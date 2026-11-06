from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from django.conf import settings
from django.contrib.auth import password_validation
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import *

Q = Decimal('0.01')
def money(x): return Decimal(x).quantize(Q, rounding=ROUND_HALF_UP)

class CategorySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug')
    class Meta: model = Category; fields = ['id', 'name', 'emoji', 'description']

class ProductSerializer(serializers.ModelSerializer):
    """Field names match what the React app already uses."""
    category = serializers.SlugRelatedField(slug_field='slug', read_only=True)
    desc = serializers.CharField(source='description'); img = serializers.CharField(source='image_url')
    time = serializers.IntegerField(source='prep_time'); cal = serializers.IntegerField(source='calories')
    veg = serializers.BooleanField(source='is_veg'); popular = serializers.BooleanField(source='is_popular')
    rating = serializers.FloatField()
    class Meta: model = Product; fields = ['id', 'name', 'category', 'desc', 'price', 'emoji', 'img', 'rating', 'reviews', 'time', 'cal', 'veg', 'popular']

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='full_name')
    class Meta: model = User; fields = ['name', 'email', 'phone', 'address']

class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150); email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False); phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    def validate_email(self, v):
        v = v.lower()
        if User.objects.filter(email__iexact=v).exists(): raise serializers.ValidationError('An account with this email already exists.')
        return v
    def validate(self, d):
        password_validation.validate_password(d['password'], User(email=d['email'], full_name=d['name'])); return d
    def create(self, d):
        return User.objects.create_user(email=d['email'], password=d['password'], full_name=d['name'].strip(), phone=d.get('phone', ''))

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(); password = serializers.CharField(trim_whitespace=False)

class OrderItemInput(serializers.Serializer):
    product_id = serializers.IntegerField(); quantity = serializers.IntegerField(min_value=1, max_value=20)

class OrderCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150); phone = serializers.RegexField(r'^[+\d][\d\s-]{6,29}$', error_messages={'invalid': 'Enter a valid phone number.'})
    address = serializers.CharField(min_length=8, max_length=300)
    latitude = serializers.FloatField(required=False, allow_null=True, min_value=-90, max_value=90); longitude = serializers.FloatField(required=False, allow_null=True, min_value=-180, max_value=180)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=300)
    payment_method = serializers.ChoiceField(choices=Payment.Method.choices); promo_code = serializers.CharField(required=False, allow_blank=True, max_length=30)
    items = OrderItemInput(many=True, allow_empty=False, max_length=30)

    def validate_promo_code(self, v):
        v = v.strip().upper()
        if v and v not in settings.PROMO_CODES: raise serializers.ValidationError('That promo code is not valid.')
        return v

    @transaction.atomic
    def create(self, d):
        qty = {}
        for i in d['items']: qty[i['product_id']] = min(20, qty.get(i['product_id'], 0) + i['quantity'])
        products = {p.id: p for p in Product.objects.filter(id__in=qty, availability=True)}
        missing = [pid for pid in qty if pid not in products]
        if missing: raise serializers.ValidationError({'items': f'Some items are no longer available (ids: {missing}).'})
        subtotal = money(sum(products[p].price * q for p, q in qty.items()))
        code = d.get('promo_code', ''); discount = money(subtotal * settings.PROMO_CODES[code] / 100) if code else Decimal('0.00')
        fee = Decimal('0.00') if subtotal - discount >= settings.FREE_DELIVERY_OVER else settings.DELIVERY_FEE
        user = self.context['request'].user
        o = Order.objects.create(user=user, customer_name=d['name'], phone=d['phone'], delivery_address=d['address'], latitude=d.get('latitude'), longitude=d.get('longitude'),
                                 notes=d.get('notes', ''), subtotal=subtotal, discount=discount, delivery_fee=fee, total_amount=subtotal - discount + fee, promo_code=code)
        OrderItem.objects.bulk_create([OrderItem(order=o, product=products[p], product_name=products[p].name, quantity=q, unit_price=products[p].price) for p, q in qty.items()])
        # Payment stays "pending": connect a gateway (e.g. Stripe) before marking orders as paid.
        Payment.objects.create(order=o, payment_method=d['payment_method'])
        eta = max(products[p].prep_time for p in qty) + 15
        Delivery.objects.create(order=o, estimated_delivery=timezone.now() + timedelta(minutes=eta))
        return o

class OrderSerializer(serializers.Serializer):
    """Read shape consumed by the React app."""
    def to_representation(self, o):
        pay = o.payments.first(); dl = o.deliveries.first(); f = float
        return {'id': o.reference, 'name': o.customer_name, 'phone': o.phone, 'email': o.user.email, 'address': o.delivery_address,
                'coords': [o.latitude, o.longitude] if o.latitude is not None else None, 'notes': o.notes,
                'payment': pay.get_payment_method_display() if pay else '', 'paymentStatus': pay.get_payment_status_display() if pay else '',
                'items': [{'id': i.product_id, 'name': i.product_name, 'price': f(i.unit_price), 'qty': i.quantity} for i in o.items.all()],
                'totals': {'subtotal': f(o.subtotal), 'discount': f(o.discount), 'delivery': f(o.delivery_fee), 'total': f(o.total_amount)},
                'promo': o.promo_code or None, 'status': o.get_order_status_display(), 'createdAt': o.created_at.isoformat(),
                'estimatedDelivery': dl.estimated_delivery.isoformat() if dl and dl.estimated_delivery else None}

class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120); email = serializers.EmailField()
    subject = serializers.CharField(max_length=200); message = serializers.CharField(min_length=10, max_length=5000)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)   # honeypot

import logging
from django.conf import settings
from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from django.core.mail import EmailMessage
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *
from .emails import send_password_reset_email, send_verification_email
from .tokens import user_from_uid, verification_token
from rest_framework.exceptions import PermissionDenied

log = logging.getLogger(__name__)

def tokens_for(user):
    r = RefreshToken.for_user(user); return {'access': str(r.access_token), 'refresh': str(r), 'user': UserSerializer(user).data}

class CategoryList(generics.ListAPIView):
    queryset = Category.objects.all(); serializer_class = CategorySerializer

class ProductList(generics.ListAPIView):
    serializer_class = ProductSerializer
    def get_queryset(self):
        qs = Product.objects.filter(availability=True).select_related('category'); p = self.request.query_params
        if p.get('category'): qs = qs.filter(category__slug=p['category'])
        if p.get('veg') == '1': qs = qs.filter(is_veg=True)
        if p.get('q'): qs = qs.filter(Q(name__icontains=p['q']) | Q(description__icontains=p['q']))
        return qs

class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.filter(availability=True).select_related('category'); serializer_class = ProductSerializer

class RegisterView(APIView):
    throttle_scope = 'auth'
    def post(self, request):
        s = RegisterSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = s.save(); send_verification_email(user)
        return Response(tokens_for(user), status=status.HTTP_201_CREATED)

class LoginView(APIView):
    throttle_scope = 'auth'
    def post(self, request):
        s = LoginSerializer(data=request.data); s.is_valid(raise_exception=True)
        user = authenticate(request, username=s.validated_data['email'].lower(), password=s.validated_data['password'])
        if not user: return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(tokens_for(user))

class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer; permission_classes = [permissions.IsAuthenticated]
    def get_object(self): return self.request.user

class OrderList(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]; throttle_scope = 'orders'
    def get_queryset(self): return Order.objects.filter(user=self.request.user).select_related('user').prefetch_related('items', 'payments', 'deliveries')
    def list(self, request, *a, **kw): return Response(OrderSerializer(self.get_queryset(), many=True).data)
    def create(self, request, *a, **kw):
        if settings.REQUIRE_EMAIL_VERIFICATION and not request.user.email_verified: raise PermissionDenied('Please verify your email address before placing an order.')
        s = OrderCreateSerializer(data=request.data, context={'request': request}); s.is_valid(raise_exception=True)
        order = s.save(); return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class OrderDetail(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]; lookup_field = 'reference'
    def get_queryset(self): return Order.objects.filter(user=self.request.user)   # customers only ever see their own orders
    def retrieve(self, request, *a, **kw): return Response(OrderSerializer(self.get_object()).data)

class ContactView(APIView):
    throttle_scope = 'contact'
    def post(self, request):
        s = ContactSerializer(data=request.data); s.is_valid(raise_exception=True); d = s.validated_data
        if d.get('website'): return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)   # bots: pretend success, store nothing
        msg = ContactMessage.objects.create(name=d['name'], email=d['email'], subject=' '.join(d['subject'].split()), message=d['message'], ip_address=request.META.get('REMOTE_ADDR'))
        if settings.CONTACT_RECIPIENT:
            try:
                EmailMessage(subject=f'[Foodstuff] {msg.subject}', body=f'From: {msg.name} <{msg.email}>\n\n{msg.message}', from_email=settings.DEFAULT_FROM_EMAIL,
                             to=[settings.CONTACT_RECIPIENT], reply_to=[msg.email]).send(fail_silently=False)
                msg.emailed = True; msg.save(update_fields=['emailed'])
            except Exception: log.exception('Contact email failed (message %s is saved in the database)', msg.pk)
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)


OK = {'detail': 'ok'}
class PasswordResetRequestView(APIView):
    throttle_scope = 'password_reset'
    def post(self, request):
        s = EmailOnlySerializer(data=request.data); s.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=s.validated_data['email'], is_active=True).first()
        if user: send_password_reset_email(user)
        return Response({'detail': 'If an account exists for that email, a reset link has been sent.'})   # same answer either way: no account enumeration

class PasswordResetConfirmView(APIView):
    throttle_scope = 'password_reset'
    def post(self, request):
        s = PasswordResetConfirmSerializer(data=request.data); s.is_valid(raise_exception=True); d = s.validated_data
        user = user_from_uid(d['uid'])
        if not user or not default_token_generator.check_token(user, d['token']): return Response({'detail': 'This reset link is invalid or has expired.'}, status=400)
        try: password_validation.validate_password(d['password'], user)
        except DjangoValidationError as e: return Response({'password': list(e.messages)}, status=400)
        user.set_password(d['password']); user.save(); return Response({'detail': 'Your password has been changed. You can log in now.'})

class VerifyEmailView(APIView):
    throttle_scope = 'verify'
    def post(self, request):
        s = UidTokenSerializer(data=request.data); s.is_valid(raise_exception=True); d = s.validated_data
        user = user_from_uid(d['uid'])
        if not user or not verification_token.check_token(user, d['token']): return Response({'detail': 'This verification link is invalid or has expired.'}, status=400)
        user.email_verified = True; user.save(update_fields=['email_verified']); return Response({'detail': 'Your email is verified.', 'user': UserSerializer(user).data})

class ResendVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]; throttle_scope = 'verify'
    def post(self, request):
        if request.user.email_verified: return Response({'detail': 'Your email is already verified.'})
        send_verification_email(request.user); return Response({'detail': 'Verification email sent.'})

class OrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, reference):
        o = generics.get_object_or_404(Order.objects.filter(user=request.user), reference=reference)
        if o.order_status == Order.Status.CANCELLED: return Response({'detail': 'This order is already cancelled.'}, status=409)
        if not o.cancellable: return Response({'detail': 'This order can no longer be cancelled because the kitchen has started preparing it. Please contact us for help.'}, status=409)
        o.order_status = Order.Status.CANCELLED; o.cancelled_at = timezone.now(); o.save()
        for p in o.payments.all():   # paid orders are flagged "refunded" so staff issue the actual refund through the payment provider
            p.payment_status = Payment.Status.REFUNDED if p.payment_status == Payment.Status.PAID else Payment.Status.FAILED; p.save()
        return Response(OrderSerializer(o).data)

class OrderPaymentView(APIView):
    """After a failed payment the customer can retry online or switch to cash on delivery."""
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, reference):
        o = generics.get_object_or_404(Order.objects.filter(user=request.user), reference=reference)
        s = PaymentChangeSerializer(data=request.data); s.is_valid(raise_exception=True)
        last = o.payments.order_by('-id').first()
        if o.order_status in (Order.Status.CANCELLED, Order.Status.DELIVERED) or not last or last.payment_status != Payment.Status.FAILED:
            return Response({'detail': 'Payment can only be changed for an active order whose payment failed.'}, status=409)
        Payment.objects.create(order=o, payment_method=s.validated_data['method'])   # new attempt; gateway hook would start here
        return Response(OrderSerializer(o).data)

import secrets
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

class UserManager(BaseUserManager):
    use_in_migrations = True
    def create_user(self, email, password=None, **extra):
        if not email: raise ValueError('Email is required')
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password); user.save(using=self._db); return user
    def create_superuser(self, email, password=None, **extra):
        extra.setdefault('is_staff', True); extra.setdefault('is_superuser', True); extra.setdefault('email_verified', True)
        return self.create_user(email, password, **extra)

class User(AbstractUser):
    """Customer account. Passwords are stored hashed by Django (password_hash in the ER diagram)."""
    username = None
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, blank=True)
    address = models.CharField(max_length=300, blank=True)
    email_verified = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'; REQUIRED_FIELDS = ['full_name']
    objects = UserManager()
    def __str__(self): return self.email

class Category(models.Model):
    slug = models.SlugField(unique=True); name = models.CharField(max_length=80)
    emoji = models.CharField(max_length=8, blank=True); description = models.TextField(blank=True)
    class Meta: verbose_name_plural = 'categories'; ordering = ['id']
    def __str__(self): return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=120); description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(0)])
    image_url = models.URLField(max_length=500, blank=True); emoji = models.CharField(max_length=8, blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=4.5, validators=[MaxValueValidator(5)])
    reviews = models.PositiveIntegerField(default=0); prep_time = models.PositiveIntegerField(default=25, help_text='minutes')
    calories = models.PositiveIntegerField(default=0)
    is_veg = models.BooleanField(default=False); is_popular = models.BooleanField(default=False)
    availability = models.BooleanField(default=True)
    class Meta: ordering = ['id']; indexes = [models.Index(fields=['category', 'availability'])]
    def __str__(self): return self.name

class Order(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Confirmed'; PREPARING = 'preparing', 'Preparing'
        ON_THE_WAY = 'on_the_way', 'On the way'; DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'
    reference = models.CharField(max_length=12, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    customer_name = models.CharField(max_length=150); phone = models.CharField(max_length=30)
    delivery_address = models.CharField(max_length=300); latitude = models.FloatField(null=True, blank=True); longitude = models.FloatField(null=True, blank=True)
    notes = models.CharField(max_length=300, blank=True)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2); discount = models.DecimalField(max_digits=9, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=9, decimal_places=2, default=0); total_amount = models.DecimalField(max_digits=9, decimal_places=2)
    promo_code = models.CharField(max_length=30, blank=True)
    order_status = models.CharField(max_length=12, choices=Status.choices, default=Status.CONFIRMED, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    class Meta: ordering = ['-created_at']
    @property
    def cancellable(self): return self.order_status == self.Status.CONFIRMED   # only before the kitchen starts preparing
    def save(self, *a, **kw):
        if not self.reference:
            while True:
                ref = 'FS-' + secrets.token_hex(3).upper()
                if not Order.objects.filter(reference=ref).exists(): self.reference = ref; break
        super().save(*a, **kw)
        d = self.deliveries.first()   # keep delivery status in step with the order
        if d:
            d.delivery_status = self.order_status
            if self.order_status == self.Status.DELIVERED and not d.delivered_at: d.delivered_at = timezone.now()
            d.save()
    def __str__(self): return self.reference

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    product_name = models.CharField(max_length=120)  # snapshot, survives product edits
    quantity = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(20)])
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)

class Payment(models.Model):
    class Method(models.TextChoices): ONLINE = 'online', 'Online'; COD = 'cod', 'Cash on delivery'
    class Status(models.TextChoices): PENDING = 'pending', 'Pending'; PAID = 'paid', 'Paid'; FAILED = 'failed', 'Failed'; REFUNDED = 'refunded', 'Refunded'
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')  # 1:N allows retries
    payment_method = models.CharField(max_length=10, choices=Method.choices); payment_status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    transaction_reference = models.CharField(max_length=100, blank=True); paid_at = models.DateTimeField(null=True, blank=True)

class Delivery(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='deliveries')
    delivery_status = models.CharField(max_length=12, choices=Order.Status.choices, default=Order.Status.CONFIRMED)
    delivery_person = models.CharField(max_length=120, blank=True)
    estimated_delivery = models.DateTimeField(null=True, blank=True); delivered_at = models.DateTimeField(null=True, blank=True)
    class Meta: verbose_name_plural = 'deliveries'

class ContactMessage(models.Model):
    name = models.CharField(max_length=120); email = models.EmailField(); subject = models.CharField(max_length=200); message = models.TextField(max_length=5000)
    ip_address = models.GenericIPAddressField(null=True, blank=True); emailed = models.BooleanField(default=False); created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ['-created_at']
    def __str__(self): return f'{self.subject} — {self.email}'

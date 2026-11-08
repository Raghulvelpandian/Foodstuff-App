from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone
from .models import *

@admin.register(User)
class CustomerAdmin(UserAdmin):
    ordering = ('-date_joined',); list_display = ('email', 'full_name', 'phone', 'email_verified', 'date_joined', 'is_staff')
    search_fields = ('email', 'full_name', 'phone')
    fieldsets = ((None, {'fields': ('email', 'password')}), ('Profile', {'fields': ('full_name', 'phone', 'address', 'email_verified')}),
                 ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), ('Dates', {'fields': ('last_login', 'date_joined')}))
    add_fieldsets = ((None, {'classes': ('wide',), 'fields': ('email', 'full_name', 'password1', 'password2')}),)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin): list_display = ('name', 'slug', 'emoji'); prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'availability', 'is_popular', 'is_veg'); list_editable = ('price', 'availability', 'is_popular')
    list_filter = ('category', 'availability', 'is_veg', 'is_popular'); search_fields = ('name',)

class ItemInline(admin.TabularInline): model = OrderItem; extra = 0; readonly_fields = ('product', 'product_name', 'quantity', 'unit_price'); can_delete = False
class PayInline(admin.TabularInline): model = Payment; extra = 0
class DelInline(admin.TabularInline): model = Delivery; extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('reference', 'user', 'total_amount', 'order_status', 'created_at'); list_editable = ('order_status',)
    list_filter = ('order_status', 'created_at'); search_fields = ('reference', 'user__email', 'customer_name')
    readonly_fields = ('reference', 'subtotal', 'discount', 'delivery_fee', 'total_amount', 'created_at', 'cancelled_at'); inlines = [ItemInline, PayInline, DelInline]
    actions = ['mark_preparing', 'mark_on_the_way', 'mark_delivered']
    def _set(self, request, qs, status):
        for o in qs: o.order_status = status; o.save()
    @admin.action(description='Mark as Preparing')
    def mark_preparing(self, r, qs): self._set(r, qs, 'preparing')
    @admin.action(description='Mark as On the way')
    def mark_on_the_way(self, r, qs): self._set(r, qs, 'on_the_way')
    @admin.action(description='Mark as Delivered')
    def mark_delivered(self, r, qs): self._set(r, qs, 'delivered')

@admin.register(ContactMessage)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('subject', 'name', 'email', 'emailed', 'created_at'); readonly_fields = [f.name for f in ContactMessage._meta.fields]
    def has_add_permission(self, request): return False

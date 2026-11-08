from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
urlpatterns = [
    path('categories/', views.CategoryList.as_view()), path('products/', views.ProductList.as_view()), path('products/<int:pk>/', views.ProductDetail.as_view()),
    path('auth/register/', views.RegisterView.as_view()), path('auth/login/', views.LoginView.as_view()), path('auth/refresh/', TokenRefreshView.as_view()), path('auth/me/', views.MeView.as_view()),
    path('auth/password-reset/', views.PasswordResetRequestView.as_view()), path('auth/password-reset/confirm/', views.PasswordResetConfirmView.as_view()),
    path('auth/verify-email/', views.VerifyEmailView.as_view()), path('auth/resend-verification/', views.ResendVerificationView.as_view()),
    path('orders/', views.OrderList.as_view()), path('orders/<str:reference>/cancel/', views.OrderCancelView.as_view()), path('orders/<str:reference>/payment/', views.OrderPaymentView.as_view()), path('orders/<str:reference>/', views.OrderDetail.as_view()), path('contact/', views.ContactView.as_view()),
]

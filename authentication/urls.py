from django.urls import path
from .views import (
    AdminLoginView,
    MobileLoginView, OTPVerifyView,
    ClientRegisterView, ResendOTPView,
    AccountInfoView
)

urlpatterns = [
    # ===== AUTHENTIFICATION ADMIN (WEB) =====
    path('auth/admin/login', AdminLoginView.as_view(), name='admin-login'),
    
    # ===== AUTHENTIFICATION MOBILE (AGENT + CLIENT) =====
    path('auth/login', MobileLoginView.as_view(), name='mobile-login'),
    path('auth/otp/verify', OTPVerifyView.as_view(), name='otp-verify'),
    
    # ===== INSCRIPTION CLIENT (MOBILE) =====
    path('auth/register', ClientRegisterView.as_view(), name='client-register'),
    path('auth/resend-otp', ResendOTPView.as_view(), name='resend-otp'),
    
    # ===== INFORMATIONS DU COMPTE =====
    path('auth/me', AccountInfoView.as_view(), name='account-info'),  # ← Ajoute cette ligne
]
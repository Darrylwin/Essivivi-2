from django.urls import path
from .views import (
    AdminLoginView,
    MobileLoginView, OTPVerifyView,
    ProfileView, ChangePasswordView, UpdatePhotoView,
    ClientRegisterView, ResendOTPView,
    AccountInfoView  # ← Ajoute cette importation
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
    
    # ===== PROFIL =====
    path('profile', ProfileView.as_view(), name='profile'),
    path('profile/password', ChangePasswordView.as_view(), name='change-password'),
    path('profile/photo', UpdatePhotoView.as_view(), name='update-photo'),
    
    # ===== INFORMATIONS DU COMPTE =====
    path('auth/me', AccountInfoView.as_view(), name='account-info'),  # ← Ajoute cette ligne
]
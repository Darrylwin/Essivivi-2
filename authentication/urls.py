from django.urls import path
from .views import (
    AdminLoginView, OTPRequestView, OTPVerifyView,
    ProfileView, ChangePasswordView, UpdatePhotoView
)

urlpatterns = [
    # Authentification Admin
    path('auth/admin/login', AdminLoginView.as_view(), name='admin-login'),
    
    # Authentification OTP (Agent & Client)
    path('auth/otp/request', OTPRequestView.as_view(), name='otp-request'),
    path('auth/otp/verify', OTPVerifyView.as_view(), name='otp-verify'),
    
    # Profil
    path('profile', ProfileView.as_view(), name='profile'),
    path('profile/password', ChangePasswordView.as_view(), name='change-password'),
    path('profile/photo', UpdatePhotoView.as_view(), name='update-photo'),
]
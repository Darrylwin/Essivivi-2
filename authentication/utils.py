from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from .models import OTP


def send_otp_email(email, otp_code):
    """Envoie un email avec le code OTP"""
    subject = 'Votre code de connexion ESSIVIVI'
    message = f'''
    Bonjour,
    
    Votre code de connexion est : {otp_code}
    
    Ce code est valide pendant 10 minutes.
    
    Si vous n'avez pas demandé ce code, ignorez ce message.
    
    Cordialement,
    L'équipe ESSIVIVI
    '''
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")
        return False


def create_otp(email, user_type):
    """Crée un nouveau OTP pour un utilisateur"""
    # Invalider tous les anciens OTP non utilisés pour cet email
    OTP.objects.filter(email=email, is_used=False).update(is_used=True)
    
    # Générer le code OTP
    otp_code = OTP.generate_otp()
    
    # Créer l'OTP avec expiration de 10 minutes
    otp = OTP.objects.create(
        email=email,
        otp=otp_code,
        user_type=user_type,
        expires_at=timezone.now() + timedelta(minutes=10)
    )
    
    return otp_code


def verify_otp(email, otp_code):
    """Vérifie si un OTP est valide"""
    try:
        otp = OTP.objects.get(
            email=email,
            otp=otp_code,
            is_used=False
        )
        
        if otp.is_valid():
            # Marquer l'OTP comme utilisé
            otp.is_used = True
            otp.save()
            return True, otp.user_type
        else:
            return False, "OTP expiré"
    except OTP.DoesNotExist:
        return False, "OTP invalide"
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from .models import OTP
import logging

logger = logging.getLogger('authentication')


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
        logger.info(f"Envoi de l'email OTP à {email}")
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        logger.info(f"Email OTP envoyé avec succès à {email}")
        return True
    except Exception as e:
        logger.error(f"Erreur lors de l'envoi de l'email OTP à {email} : {str(e)}")
        return False


def create_otp(email, user_type):
    """Crée un nouveau OTP pour un utilisateur"""
    logger.info(f"Création d'un OTP pour {email} (type: {user_type})")
    
    # Invalider tous les anciens OTP non utilisés pour cet email
    old_otps = OTP.objects.filter(email=email, is_used=False)
    count = old_otps.count()
    if count > 0:
        old_otps.update(is_used=True)
        logger.info(f"{count} ancien(s) OTP invalidé(s) pour {email}")
    
    # Générer le code OTP
    otp_code = OTP.generate_otp()
    
    # Créer l'OTP avec expiration de 10 minutes
    otp = OTP.objects.create(
        email=email,
        otp=otp_code,
        user_type=user_type,
        expires_at=timezone.now() + timedelta(minutes=10)
    )
    
    logger.info(f"OTP créé avec succès : {otp_code} pour {email}, expire à {otp.expires_at}")
    
    return otp_code


def verify_otp(email, otp_code):
    """Vérifie si un OTP est valide"""
    logger.info(f"Vérification de l'OTP {otp_code} pour {email}")
    
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
            logger.info(f"OTP {otp_code} valide et marqué comme utilisé pour {email}")
            return True, otp.user_type
        else:
            logger.warning(f"OTP {otp_code} expiré pour {email}")
            return False, "OTP expiré"
    except OTP.DoesNotExist:
        logger.warning(f"OTP {otp_code} invalide pour {email}")
        return False, "OTP invalide"
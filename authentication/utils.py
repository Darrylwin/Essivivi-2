from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import OTP
import logging

logger = logging.getLogger('authentication')


def send_otp_email(email, otp_code, user_type="utilisateur"):
    """Envoie un email avec le code OTP avec un template HTML amélioré"""
    
    # Déterminer le nom en fonction du type d'utilisateur
    if user_type == 'agent':
        user_title = "Agent ESSIVIVI"
    elif user_type == 'client':
        user_title = "Client ESSIVIVI"
    else:
        user_title = "Utilisateur ESSIVIVI"
    
    subject = f'Votre code de connexion ESSIVIVI - {otp_code}'
    
    # HTML template amélioré
    html_message = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code de connexion ESSIVIVI</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }}
            .container {{
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
            }}
            .otp-code {{
                background-color: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 10px;
                color: #2c3e50;
                margin: 20px 0;
            }}
            .info-box {{
                background-color: #e8f4fd;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
            .security-note {{
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 10px;
                border-radius: 5px;
                margin: 15px 0;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ESSIVIVI</div>
                <h2>Code de connexion</h2>
            </div>
            
            <p>Bonjour {user_title},</p>
            
            <p>Voici votre code de vérification pour accéder à votre compte :</p>
            
            <div class="otp-code">{otp_code}</div>
            
            <div class="info-box">
                <p><strong>Ce code est valide pendant 10 minutes</strong></p>
                <p>Entrez ce code dans l'application mobile pour finaliser votre connexion.</p>
            </div>
            
            <div class="security-note">
                <p><strong>Note de sécurité :</strong></p>
                <p>Ne partagez jamais ce code avec qui que ce soit.<br>
                L'équipe ESSIVIVI ne vous demandera jamais votre code OTP.</p>
            </div>
            
            <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
            
            <p>Cordialement,<br>
            <strong>L'équipe ESSIVIVI</strong></p>
            
            <div class="footer">
                <p>© {timezone.now().year} ESSIVIVI. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    # Message texte brut pour les clients qui ne supportent pas HTML
    text_message = f'''
    Code de connexion ESSIVIVI
    
    Bonjour {user_title},
    
    Votre code de vérification est : {otp_code}
    
    Ce code est valide pendant 10 minutes.
    
    Entrez ce code dans l'application mobile pour finaliser votre connexion.
    
    ⚠️ Note de sécurité :
    Ne partagez jamais ce code avec qui que ce soit.
    L'équipe ESSIVIVI ne vous demandera jamais votre code OTP.
    
    Si vous n'avez pas demandé ce code, ignorez cet email.
    
    Cordialement,
    L'équipe ESSIVIVI
    
    © {timezone.now().year} ESSIVIVI. Tous droits réservés.
    '''
    
    try:
        logger.info(f"Envoi de l'email OTP à {email}")
        
        email_msg = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        
        # Ajouter la version HTML
        email_msg.attach_alternative(html_message, "text/html")
        
        # Envoyer l'email
        email_msg.send(fail_silently=False)
        
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


def handle_email_exception(e, email):
    """Gérer les exceptions d'email de manière spécifique"""
    error_message = str(e)
    
    if "authentication failed" in error_message.lower():
        logger.error(f"Échec d'authentification SMTP pour {email}")
        return "Erreur de configuration email"
    elif "connection refused" in error_message.lower():
        logger.error(f"Connexion SMTP refusée pour {email}")
        return "Service email temporairement indisponible"
    elif "timeout" in error_message.lower():
        logger.error(f"Timeout SMTP pour {email}")
        return "Délai d'attente dépassé pour l'envoi d'email"
    else:
        logger.error(f"Erreur email inconnue pour {email}: {error_message}")
        return "Erreur lors de l'envoi de l'email"
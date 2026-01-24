from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import random
import string


class AdminManager(BaseUserManager):
    """Manager personnalisé pour le modèle Admin"""
    
    def create_user(self, email, mot_de_passe=None, **extra_fields):
        if not email:
            raise ValueError("L'email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(mot_de_passe)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, mot_de_passe=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('statut', 'actif')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True.')
        
        return self.create_user(email, mot_de_passe, **extra_fields)


class Admin(AbstractBaseUser, PermissionsMixin):
    """Modèle pour les administrateurs de la plateforme web"""
    
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    ]
    
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = AdminManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']
    
    class Meta:
        db_table = 'admins'
        verbose_name = 'Administrateur'
        verbose_name_plural = 'Administrateurs'
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"


class Tricycle(models.Model):
    """Modèle pour les tricycles"""
    
    plaque_immatriculation = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tricycles'
        verbose_name = 'Tricycle'
        verbose_name_plural = 'Tricycles'
    
    def __str__(self):
        return self.plaque_immatriculation


class Agent(models.Model):
    """Modèle pour les agents commerciaux / livreurs"""
    
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('en_tournee', 'En tournée'),
    ]
    
    numero_identification = models.CharField(max_length=20, unique=True, editable=False)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    date_naissance = models.DateField()
    adresse = models.TextField()
    photo = models.ImageField(upload_to='agents/photos/', null=True, blank=True)
    tricycle = models.ForeignKey(Tricycle, on_delete=models.SET_NULL, null=True, blank=True, related_name='agents')
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='actif')
    mot_de_passe = models.CharField(max_length=255)  # Password hashé
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'agents'
        verbose_name = 'Agent'
        verbose_name_plural = 'Agents'
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.numero_identification})"
    
    def save(self, *args, **kwargs):
        if not self.numero_identification:
            # Générer un numéro unique AGT-XXXXXX
            while True:
                numero = f"AGT-{''.join(random.choices(string.digits, k=6))}"
                if not Agent.objects.filter(numero_identification=numero).exists():
                    self.numero_identification = numero
                    break
        
        # Hasher le mot de passe si c'est nouveau ou modifié
        if self.mot_de_passe and not self.mot_de_passe.startswith('pbkdf2_sha256$'):
            from django.contrib.auth.hashers import make_password
            self.mot_de_passe = make_password(self.mot_de_passe)
        
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        """Vérifier le mot de passe"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.mot_de_passe)


class Client(models.Model):
    """Modèle pour les clients / points de vente"""
    
    TYPE_CHOICES = [
        ('detaillant', 'Détaillant'),
        ('grossiste', 'Grossiste'),
        ('institution', 'Institution'),
    ]
    
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    ]
    
    code_client = models.CharField(max_length=20, unique=True, editable=False)
    nom_point_vente = models.CharField(max_length=200)
    nom_responsable = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)  # Rendre unique et obligatoire
    mot_de_passe = models.CharField(max_length=255)  # Ajouter mot de passe
    adresse = models.TextField()
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    type_client = models.CharField(max_length=15, choices=TYPE_CHOICES)
    photo_point_vente = models.ImageField(upload_to='clients/photos/', null=True, blank=True)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')
    date_inscription = models.DateTimeField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clients'
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'
    
    def __str__(self):
        return f"{self.nom_point_vente} ({self.code_client})"
    
    def save(self, *args, **kwargs):
        if not self.code_client:
            # Générer un code unique CLT-XXXXXX
            while True:
                code = f"CLT-{''.join(random.choices(string.digits, k=6))}"
                if not Client.objects.filter(code_client=code).exists():
                    self.code_client = code
                    break
        
        # Hasher le mot de passe si c'est nouveau ou modifié
        if self.mot_de_passe and not self.mot_de_passe.startswith('pbkdf2_sha256$'):
            from django.contrib.auth.hashers import make_password
            self.mot_de_passe = make_password(self.mot_de_passe)
        
        super().save(*args, **kwargs)
    
    def check_password(self, raw_password):
        """Vérifier le mot de passe"""
        from django.contrib.auth.hashers import check_password
        return check_password(raw_password, self.mot_de_passe)


class OTP(models.Model):
    """Modèle pour les codes OTP (One-Time Password)"""
    
    USER_TYPE_CHOICES = [
        ('agent', 'Agent'),
        ('client', 'Client'),
    ]
    
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'otps'
        verbose_name = 'OTP'
        verbose_name_plural = 'OTPs'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP pour {self.email} ({self.user_type})"
    
    def is_valid(self):
        """Vérifie si l'OTP est toujours valide"""
        return not self.is_used and timezone.now() < self.expires_at
    
    @staticmethod
    def generate_otp():
        """Génère un code OTP à 6 chiffres"""
        return ''.join(random.choices(string.digits, k=6))


class PendingUser(models.Model):
    """Modèle pour les utilisateurs en attente de validation OTP"""
    
    USER_TYPE_CHOICES = [
        ('agent', 'Agent'),
        ('client', 'Client'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    email = models.EmailField(unique=True)
    
    # Données temporaires (seront transférées après validation)
    data = models.JSONField(help_text='Données temporaires de l\'utilisateur')
    
    # OTP
    otp_code = models.CharField(max_length=6)
    otp_expires_at = models.DateTimeField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pending_users'
        verbose_name = 'Utilisateur en attente'
        verbose_name_plural = 'Utilisateurs en attente'
    
    def __str__(self):
        return f"{self.user_type} - {self.email}"
    
    def is_otp_valid(self):
        """Vérifie si l'OTP est encore valide"""
        return timezone.now() < self.otp_expires_at
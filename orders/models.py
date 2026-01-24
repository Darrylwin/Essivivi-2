from django.db import models
from authentication.models import Agent, Client


class Commande(models.Model):
    """Modèle pour les commandes passées par les clients"""
    
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('acceptee', 'Acceptée'),
        ('en_cours', 'En cours de livraison'),
        ('livree', 'Livrée'),
        ('annulee', 'Annulée'),
    ]
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='commandes',
        verbose_name='Client'
    )
    agent = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes',
        verbose_name='Agent assigné'
    )
    
    # Informations de la commande
    quantite_demandee = models.IntegerField(
        verbose_name='Quantité demandée',
        null=True,
        blank=True,
        help_text='Optionnel - calculé depuis les lignes'
    )
    date_livraison_souhaitee = models.DateField(
        verbose_name='Date de livraison souhaitée'
    )
    adresse_livraison = models.TextField(verbose_name='Adresse de livraison')
    
    # Statut
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name='Statut'
    )
    
    # Notes et remarques
    notes_client = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes du client'
    )
    notes_admin = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes admin'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'commandes'
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']
    
    def __str__(self):
        agent_info = f" → {self.agent.numero_identification}" if self.agent else " (non assignée)"
        return f"Commande #{self.id} - {self.client.code_client}{agent_info}"
    
    @property
    def est_assignee(self):
        """Vérifie si la commande est assignée à un agent"""
        return self.agent is not None
    
    @property
    def peut_etre_annulee(self):
        """Vérifie si la commande peut être annulée"""
        return self.statut in ['en_attente', 'acceptee']
    
    @property
    def montant_total(self):
        """Calcule le montant total de la commande"""
        from decimal import Decimal
        total = sum(ligne.montant for ligne in self.lignes.all())
        return total if total > 0 else Decimal('0')
    
    @property
    def quantite_totale(self):
        """Calcule la quantité totale commandée"""
        total = sum(ligne.quantite for ligne in self.lignes.all())
        return total if total > 0 else (self.quantite_demandee or 0)


# NOUVEAU MODÈLE - AJOUTE À LA FIN
class LigneCommande(models.Model):
    """Détail des produits commandés"""
    
    commande = models.ForeignKey(
        Commande,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name='Commande'
    )
    produit = models.ForeignKey(
        'products.Produit',
        on_delete=models.PROTECT,
        related_name='lignes_commande',
        verbose_name='Produit'
    )
    quantite = models.IntegerField(
        verbose_name='Quantité commandée'
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire au moment de la commande'
    )
    montant = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Montant total'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lignes_commande'
        verbose_name = 'Ligne de commande'
        verbose_name_plural = 'Lignes de commande'
    
    def __str__(self):
        return f"{self.produit.nom} × {self.quantite}"
    
    def save(self, *args, **kwargs):
        self.montant = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)


class Notification(models.Model):
    """Modèle pour les notifications système"""
    
    TYPE_CHOICES = [
        ('nouvelle_commande', 'Nouvelle commande'),
        ('livraison_assignee', 'Livraison assignée'),
        ('livraison_terminee', 'Livraison terminée'),
        ('commande_annulee', 'Commande annulée'),
    ]
    
    type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
        verbose_name='Type de notification'
    )
    
    # Relations (nullable car une notification peut concerner différentes entités)
    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Agent'
    )
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Client'
    )
    commande = models.ForeignKey(
        'Commande',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Commande'
    )
    
    # Contenu de la notification
    titre = models.CharField(max_length=200, verbose_name='Titre')
    message = models.TextField(verbose_name='Message')
    
    # Statut de lecture
    lue = models.BooleanField(default=False, verbose_name='Lue')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.type} - {self.titre}"
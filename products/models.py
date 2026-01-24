from django.db import models


class Categorie(models.Model):
    """Catégories de produits (ex: Eaux, Jus, Sodas)"""
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nom de la catégorie'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True,
        verbose_name='Image de la catégorie'
    )
    ordre = models.IntegerField(
        default=0,
        verbose_name='Ordre d\'affichage',
        help_text='Ordre d\'affichage dans l\'app mobile (0 = premier)'
    )
    actif = models.BooleanField(
        default=True,
        verbose_name='Catégorie active'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['ordre', 'nom']
    
    def __str__(self):
        return self.nom
    
    @property
    def nombre_produits(self):
        """Compte le nombre de produits dans cette catégorie"""
        return self.produits.count()


class Produit(models.Model):
    """Produits vendus (ex: Eau Vitale 500ml, Eau Voltic 1.5L)"""
    
    UNITE_CHOICES = [
        ('sachet', 'Sachet'),
        ('bouteille', 'Bouteille'),
        ('pack', 'Pack'),
        ('carton', 'Carton'),
    ]
    
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.PROTECT,  # On ne peut pas supprimer une catégorie qui a des produits
        related_name='produits',
        verbose_name='Catégorie'
    )
    nom = models.CharField(
        max_length=200,
        verbose_name='Nom du produit'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    reference = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Référence produit',
        help_text='Ex: VIT-500, VOL-1500'
    )
    
    # Caractéristiques
    marque = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Marque',
        help_text='Ex: Vitale, Voltic, etc.'
    )
    volume = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Volume',
        help_text='Ex: 500ml, 1.5L, etc.'
    )
    unite_vente = models.CharField(
        max_length=20,
        choices=UNITE_CHOICES,
        default='sachet',
        verbose_name='Unité de vente'
    )
    
    # Prix
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire (FCFA)',
        help_text='Prix de vente au détail'
    )
    prix_gros = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name='Prix de gros (FCFA)',
        help_text='Prix pour les grossistes (optionnel)'
    )
    
    # Stock (optionnel pour le moment)
    stock_minimum = models.IntegerField(
        default=0,
        verbose_name='Stock minimum',
        help_text='Alerte si stock en dessous'
    )
    
    # Visibilité
    image = models.ImageField(
        upload_to='produits/',
        blank=True,
        null=True,
        verbose_name='Photo du produit'
    )
    actif = models.BooleanField(
        default=True,
        verbose_name='Produit actif'
    )
    ordre = models.IntegerField(
        default=0,
        verbose_name='Ordre d\'affichage'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'produits'
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['categorie', 'ordre', 'nom']
        indexes = [
            models.Index(fields=['categorie', 'actif']),
            models.Index(fields=['reference']),
        ]
    
    def __str__(self):
        return f"{self.nom} ({self.volume or self.unite_vente})"
from django.db import models


class Categorie(models.Model):
    """
    Catégories de produits pour ESSIVIVI
    Exemples: Eau en sachet, Eau en bouteille, Boissons gazeuses, Jus
    """
    
    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nom de la catégorie',
        help_text='Ex: Eau en sachet, Eau en bouteille, Boissons'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
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
        ordering = ['nom']
    
    def __str__(self):
        return self.nom
    
    @property
    def nombre_produits(self):
        """Compte le nombre de produits actifs dans cette catégorie"""
        return self.produits.filter(actif=True).count()


class Produit(models.Model):
    """
    Produits vendus par ESSIVIVI
    Exemples: Vitale 500ml, Voltic 1.5L, Coca-Cola 33cl
    """
    
    UNITE_CHOICES = [
        ('sachet', 'Sachet'),
        ('bouteille', 'Bouteille'),
        ('canette', 'Canette'),
        ('pack', 'Pack'),
    ]
    
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.PROTECT,
        related_name='produits',
        verbose_name='Catégorie'
    )
    
    # Informations de base
    nom = models.CharField(
        max_length=200,
        verbose_name='Nom du produit',
        help_text='Ex: Eau Vitale, Eau Voltic, Coca-Cola'
    )
    marque = models.CharField(
        max_length=100,
        verbose_name='Marque',
        help_text='Ex: Vitale, Voltic, Coca-Cola, Fanta'
    )
    volume = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Volume/Contenance',
        help_text='Ex: 500ml, 1.5L, 33cl'
    )
    
    # Photo du produit
    photo = models.ImageField(
        upload_to='produits/',
        blank=True,
        null=True,
        verbose_name='Photo du produit',
        help_text='Image du produit'
    )
    
    # Unité et prix
    unite_vente = models.CharField(
        max_length=20,
        choices=UNITE_CHOICES,
        default='sachet',
        verbose_name='Unité de vente'
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire (FCFA)',
        help_text='Prix de vente standard'
    )
    
    # Statut
    actif = models.BooleanField(
        default=True,
        verbose_name='Produit disponible à la vente'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'produits'
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'
        ordering = ['categorie', 'marque', 'nom']
        # Empêcher les doublons (même produit avec même volume)
        unique_together = [['categorie', 'nom', 'volume']]
    
    def __str__(self):
        if self.volume:
            return f"{self.nom} {self.volume}"
        return self.nom

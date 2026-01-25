from django.core.management.base import BaseCommand
from products.models import Categorie, Produit


class Command(BaseCommand):
    help = 'Créer des données de test pour les catégories et produits ESSIVIVI'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Création des catégories et produits pour ESSIVIVI...'))
        
        # ========== CATÉGORIES ==========
        self.stdout.write('\n📂 Création des catégories...')
        
        cat_eau_sachet, created = Categorie.objects.get_or_create(
            nom='Eau en sachet',
            defaults={
                'description': 'Eau potable conditionnée en sachets de 500ml',
                'actif': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Eau en sachet'))
        
        cat_eau_bouteille, created = Categorie.objects.get_or_create(
            nom='Eau en bouteille',
            defaults={
                'description': 'Eau potable en bouteilles plastiques (1L, 1.5L)',
                'actif': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Eau en bouteille'))
        
        cat_boissons, created = Categorie.objects.get_or_create(
            nom='Boissons gazeuses',
            defaults={
                'description': 'Sodas et boissons gazeuses en canettes et bouteilles',
                'actif': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Boissons gazeuses'))
        
        cat_jus, created = Categorie.objects.get_or_create(
            nom='Jus et boissons',
            defaults={
                'description': 'Jus de fruits et autres boissons non gazeuses',
                'actif': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Jus et boissons'))
        
        # ========== PRODUITS - EAU EN SACHET ==========
        self.stdout.write('\n💧 Création des produits - Eau en sachet...')
        
        produits_eau_sachet = [
            {
                'nom': 'Eau Vitale',
                'marque': 'Vitale',
                'volume': '500ml',
                'prix': 25
            },
            {
                'nom': 'Eau Voltic',
                'marque': 'Voltic',
                'volume': '500ml',
                'prix': 25
            },
            {
                'nom': 'Eau Pure Life',
                'marque': 'Nestlé',
                'volume': '500ml',
                'prix': 30
            },
        ]
        
        for p in produits_eau_sachet:
            produit, created = Produit.objects.get_or_create(
                categorie=cat_eau_sachet,
                nom=p['nom'],
                volume=p['volume'],
                defaults={
                    'marque': p['marque'],
                    'unite_vente': 'sachet',
                    'prix_unitaire': p['prix'],
                    'actif': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {p["nom"]} {p["volume"]} - {p["prix"]} FCFA'))
        
        # ========== PRODUITS - EAU EN BOUTEILLE ==========
        self.stdout.write('\n🍶 Création des produits - Eau en bouteille...')
        
        produits_eau_bouteille = [
            {
                'nom': 'Eau Vitale',
                'marque': 'Vitale',
                'volume': '1L',
                'prix': 250
            },
            {
                'nom': 'Eau Vitale',
                'marque': 'Vitale',
                'volume': '1.5L',
                'prix': 300
            },
            {
                'nom': 'Eau Voltic',
                'marque': 'Voltic',
                'volume': '1L',
                'prix': 250
            },
            {
                'nom': 'Eau Voltic',
                'marque': 'Voltic',
                'volume': '1.5L',
                'prix': 300
            },
            {
                'nom': 'Eau Pure Life',
                'marque': 'Nestlé',
                'volume': '1.5L',
                'prix': 350
            },
        ]
        
        for p in produits_eau_bouteille:
            produit, created = Produit.objects.get_or_create(
                categorie=cat_eau_bouteille,
                nom=p['nom'],
                volume=p['volume'],
                defaults={
                    'marque': p['marque'],
                    'unite_vente': 'bouteille',
                    'prix_unitaire': p['prix'],
                    'actif': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {p["nom"]} {p["volume"]} - {p["prix"]} FCFA'))
        
        # ========== PRODUITS - BOISSONS GAZEUSES ==========
        self.stdout.write('\n🥤 Création des produits - Boissons gazeuses...')
        
        produits_boissons = [
            {
                'nom': 'Coca-Cola',
                'marque': 'Coca-Cola',
                'volume': '33cl',
                'unite': 'canette',
                'prix': 200
            },
            {
                'nom': 'Coca-Cola',
                'marque': 'Coca-Cola',
                'volume': '50cl',
                'unite': 'bouteille',
                'prix': 300
            },
            {
                'nom': 'Fanta Orange',
                'marque': 'Fanta',
                'volume': '33cl',
                'unite': 'canette',
                'prix': 200
            },
            {
                'nom': 'Sprite',
                'marque': 'Sprite',
                'volume': '33cl',
                'unite': 'canette',
                'prix': 200
            },
            {
                'nom': 'Schweppes Citron',
                'marque': 'Schweppes',
                'volume': '33cl',
                'unite': 'canette',
                'prix': 200
            },
        ]
        
        for p in produits_boissons:
            produit, created = Produit.objects.get_or_create(
                categorie=cat_boissons,
                nom=p['nom'],
                volume=p['volume'],
                defaults={
                    'marque': p['marque'],
                    'unite_vente': p['unite'],
                    'prix_unitaire': p['prix'],
                    'actif': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {p["nom"]} {p["volume"]} - {p["prix"]} FCFA'))
        
        # ========== PRODUITS - JUS ==========
        self.stdout.write('\n🧃 Création des produits - Jus et boissons...')
        
        produits_jus = [
            {
                'nom': 'Jus d\'orange',
                'marque': 'Tropico',
                'volume': '25cl',
                'prix': 150
            },
            {
                'nom': 'Jus d\'ananas',
                'marque': 'Tropico',
                'volume': '25cl',
                'prix': 150
            },
            {
                'nom': 'Malta Guinness',
                'marque': 'Guinness',
                'volume': '33cl',
                'prix': 250
            },
        ]
        
        for p in produits_jus:
            produit, created = Produit.objects.get_or_create(
                categorie=cat_jus,
                nom=p['nom'],
                volume=p['volume'],
                defaults={
                    'marque': p['marque'],
                    'unite_vente': 'bouteille',
                    'prix_unitaire': p['prix'],
                    'actif': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ {p["nom"]} {p["volume"]} - {p["prix"]} FCFA'))
        
        # ========== RÉSUMÉ ==========
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('✅ Données créées avec succès !'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'📂 Catégories : {Categorie.objects.count()}')
        self.stdout.write(f'📦 Produits : {Produit.objects.count()}')
        
        # Détail par catégorie
        for cat in Categorie.objects.all():
            count = cat.produits.count()
            self.stdout.write(f'   • {cat.nom} : {count} produit(s)')
        
        self.stdout.write('=' * 60)
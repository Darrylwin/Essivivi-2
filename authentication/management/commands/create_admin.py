from django.core.management.base import BaseCommand, CommandError
from authentication.models import Admin
from django.db import IntegrityError


class Command(BaseCommand):
    help = 'Crée un administrateur pour la plateforme ESSIVIVI'

    def add_arguments(self, parser):
        # Arguments obligatoires
        parser.add_argument('--email', type=str, help='Email de l\'administrateur')
        parser.add_argument('--password', type=str, help='Mot de passe')
        parser.add_argument('--nom', type=str, help='Nom de famille')
        parser.add_argument('--prenom', type=str, help='Prénom')
        
        # Arguments optionnels
        parser.add_argument(
            '--superuser',
            action='store_true',
            help='Créer un superuser avec tous les privilèges'
        )
        parser.add_argument(
            '--interactive',
            action='store_true',
            help='Mode interactif (pose les questions)'
        )

    def handle(self, *args, **options):
        # Mode interactif
        if options['interactive']:
            self.stdout.write(self.style.SUCCESS('=== Création d\'un administrateur ===\n'))
            
            email = input('Email : ')
            password = input('Mot de passe : ')
            password_confirm = input('Confirmer le mot de passe : ')
            
            if password != password_confirm:
                raise CommandError('Les mots de passe ne correspondent pas')
            
            nom = input('Nom : ')
            prenom = input('Prénom : ')
            
            is_superuser = input('Superuser ? (o/n) [n] : ').lower() == 'o'
        else:
            # Mode avec arguments
            email = options.get('email')
            password = options.get('password')
            nom = options.get('nom')
            prenom = options.get('prenom')
            is_superuser = options.get('superuser', False)
            
            # Vérifier que tous les arguments sont fournis
            if not all([email, password, nom, prenom]):
                raise CommandError(
                    'Vous devez fournir --email, --password, --nom et --prenom '
                    'ou utiliser --interactive'
                )

        # Validation de l'email
        if not email or '@' not in email:
            raise CommandError('Email invalide')
        
        # Validation du mot de passe
        if len(password) < 6:
            raise CommandError('Le mot de passe doit contenir au moins 6 caractères')

        try:
            # Créer l'admin
            if is_superuser:
                admin = Admin.objects.create_superuser(
                    email=email,
                    mot_de_passe=password,
                    nom=nom,
                    prenom=prenom
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n✅ Superuser créé avec succès !\n'
                        f'   Email : {admin.email}\n'
                        f'   Nom : {admin.prenom} {admin.nom}\n'
                        f'   Statut : {admin.statut}\n'
                        f'   Staff : {admin.is_staff}\n'
                        f'   Superuser : {admin.is_superuser}\n'
                    )
                )
            else:
                admin = Admin.objects.create_user(
                    email=email,
                    mot_de_passe=password,
                    nom=nom,
                    prenom=prenom,
                    statut='actif',
                    is_staff=True  # Les admins normaux ont accès à l'admin Django
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'\n✅ Administrateur créé avec succès !\n'
                        f'   Email : {admin.email}\n'
                        f'   Nom : {admin.prenom} {admin.nom}\n'
                        f'   Statut : {admin.statut}\n'
                        f'   Staff : {admin.is_staff}\n'
                    )
                )

        except IntegrityError:
            raise CommandError(
                f'❌ Un administrateur avec l\'email {email} existe déjà'
            )
        except Exception as e:
            raise CommandError(f'❌ Erreur lors de la création : {str(e)}')
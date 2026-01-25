from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('tours', '0002_remove_tournee_duree'),
        ('orders', '0007_add_unique_constraint'),
    ]
    
    operations = [
        # Ajouter le champ commande
        migrations.AddField(
            model_name='tournee',
            name='commande',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tournees',
                to='orders.commande',
                verbose_name='Commande liée',
                help_text='Commande pour laquelle cette tournée est effectuée',
                null=True,  # Permet migration sans casser données existantes
                blank=True
            ),
        ),
        
        # Index pour performance
        migrations.AddIndex(
            model_name='tournee',
            index=models.Index(
                fields=['commande', '-heure_debut'],
                name='idx_tournee_commande'
            ),
        ),
        
        # Index supplémentaire
        migrations.AddIndex(
            model_name='tournee',
            index=models.Index(
                fields=['agent', '-heure_debut'],
                name='idx_tournee_agent'
            ),
        ),
    ]
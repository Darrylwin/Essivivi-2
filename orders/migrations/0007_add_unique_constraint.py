from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0006_remove_commande_adresse_livraison_and_more'),
    ]
    
    operations = [
        # Contrainte: Un agent = 1 seule commande active max
        migrations.AddConstraint(
            model_name='commande',
            constraint=models.UniqueConstraint(
                fields=['agent'],
                condition=models.Q(statut__in=['acceptee', 'en_cours']),
                name='unique_agent_commande_active',
                violation_error_message="Cet agent a déjà une commande en cours"
            ),
        ),
        
        # Index pour performance
        migrations.AddIndex(
            model_name='commande',
            index=models.Index(
                fields=['agent', 'statut'], 
                name='idx_agent_statut'
            ),
        ),
        migrations.AddIndex(
            model_name='commande',
            index=models.Index(
                fields=['client', 'statut'], 
                name='idx_client_statut'
            ),
        ),
    ]
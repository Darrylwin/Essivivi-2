from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Admin, Agent, Client, Tricycle, OTP, PendingUser


class CustomAdminAdmin(UserAdmin):
    model = Admin
    list_display = ['email', 'nom', 'prenom', 'statut', 'is_staff']
    list_filter = ['statut', 'is_staff', 'is_superuser']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'prenom', 'statut')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nom', 'prenom', 'password1', 'password2', 'statut', 'is_staff', 'is_superuser')}
        ),
    )
    search_fields = ['email', 'nom', 'prenom']
    ordering = ['email']


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['numero_identification', 'nom', 'prenom', 'telephone', 'email', 'statut']
    list_filter = ['statut']
    search_fields = ['numero_identification', 'nom', 'prenom', 'email', 'telephone']
    readonly_fields = ['numero_identification', 'created_at', 'updated_at']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['code_client', 'nom_point_vente', 'nom_responsable', 'telephone', 'type_client', 'statut']
    list_filter = ['type_client', 'statut']
    search_fields = ['code_client', 'nom_point_vente', 'nom_responsable', 'telephone', 'email']
    readonly_fields = ['code_client', 'date_inscription', 'created_at', 'updated_at']


@admin.register(Tricycle)
class TricycleAdmin(admin.ModelAdmin):
    list_display = ['plaque_immatriculation', 'created_at']
    search_fields = ['plaque_immatriculation']


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp', 'user_type', 'is_used', 'expires_at', 'created_at']
    list_filter = ['user_type', 'is_used']
    search_fields = ['email', 'otp']
    readonly_fields = ['created_at']


@admin.register(PendingUser)
class PendingUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'user_type', 'otp_expires_at', 'created_at']
    list_filter = ['user_type']
    search_fields = ['email']
    readonly_fields = ['created_at']


admin.site.register(Admin, CustomAdminAdmin)
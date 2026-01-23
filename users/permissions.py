from rest_framework import permissions
import logging

logger = logging.getLogger('users')


class IsAdmin(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est un admin"""
    
    def has_permission(self, request, view):
        is_admin = (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'is_staff') and 
            request.user.is_staff
        )
        
        if not is_admin:
            logger.warning(f"Accès refusé : L'utilisateur {request.user.email if request.user.is_authenticated else 'Anonymous'} n'est pas admin")
        
        return is_admin


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission lecture pour tous, écriture pour admin uniquement"""
    
    def has_permission(self, request, view):
        # Lecture autorisée pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Écriture uniquement pour les admins
        is_admin = (
            request.user and 
            request.user.is_authenticated and 
            hasattr(request.user, 'is_staff') and 
            request.user.is_staff
        )
        
        if not is_admin:
            logger.warning(f"Accès refusé en écriture : L'utilisateur {request.user.email} n'est pas admin")
        
        return is_admin
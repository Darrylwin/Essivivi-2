from rest_framework import permissions
import logging

logger = logging.getLogger('tours')


class IsAgent(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est un agent"""
    
    def has_permission(self, request, view):
        # L'utilisateur doit être authentifié
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Vérifier si c'est un agent
        from authentication.models import Agent
        try:
            Agent.objects.get(email=request.user.email)
            return True
        except Agent.DoesNotExist:
            logger.warning(f"Accès refusé : {request.user.email} n'est pas un agent")
            return False


class IsAgentOrAdmin(permissions.BasePermission):
    """Permission pour agent ou admin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Vérifier si c'est un admin
        if hasattr(request.user, 'is_staff') and request.user.is_staff:
            return True
        
        # Vérifier si c'est un agent
        from authentication.models import Agent
        try:
            Agent.objects.get(email=request.user.email)
            return True
        except Agent.DoesNotExist:
            logger.warning(f"Accès refusé : {request.user.email} n'est ni admin ni agent")
            return False
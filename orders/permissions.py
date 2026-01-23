from rest_framework import permissions
import logging

logger = logging.getLogger('orders')


class IsClient(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est un client"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        from authentication.models import Client
        try:
            Client.objects.get(email=request.user.email)
            return True
        except Client.DoesNotExist:
            logger.warning(f"Accès refusé : {request.user.email} n'est pas un client")
            return False


class IsAgent(permissions.BasePermission):
    """Permission pour vérifier si l'utilisateur est un agent"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        from authentication.models import Agent
        try:
            Agent.objects.get(email=request.user.email)
            return True
        except Agent.DoesNotExist:
            logger.warning(f"Accès refusé : {request.user.email} n'est pas un agent")
            return False


class IsClientOrAdmin(permissions.BasePermission):
    """Permission pour client ou admin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin
        if hasattr(request.user, 'is_staff') and request.user.is_staff:
            return True
        
        # Client
        from authentication.models import Client
        try:
            Client.objects.get(email=request.user.email)
            return True
        except Client.DoesNotExist:
            return False
"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  PackageIcon,
  CalendarIcon,
  MapPinIcon,
  ExternalLinkIcon,
  UserIcon,
  PhoneIcon,
} from "lucide-react";
import type { LivraisonListItem, StatutLivraison } from "@/lib/types";

interface DeliveryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  delivery: LivraisonListItem | null;
  onClose: () => void;
}

export function DeliveryDetailDialog({
  open,
  onOpenChange,
  delivery,
}: DeliveryDetailDialogProps) {

  if (!delivery) return null;

  const getStatusBadge = (statut: StatutLivraison) => {
    switch (statut) {
      case 'en_attente':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <ClockIcon className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
      case 'validee':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <TruckIcon className="mr-1 h-3 w-3" />
            Validée
          </Badge>
        );
      case 'livree':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Livrée
          </Badge>
        );
      case 'annulee':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Annulée
          </Badge>
        );
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  const openGoogleMaps = () => {
    // Note: Les coordonnées ne sont pas disponibles dans LivraisonListItem
    // Il faudrait fetcher les détails complets pour avoir lat/lng
    console.log("Google Maps - Coordonnées non disponibles dans la liste");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <TruckIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Détails de la livraison</DialogTitle>
                <DialogDescription>
                  Livraison #{delivery.id}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Status Section */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut actuel</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(delivery.statut)}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Informations client</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom</p>
                  <p className="font-medium">{delivery.client_nom}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Code client</p>
                  <p className="font-mono font-medium">{delivery.client_code}</p>
                </div>
              </div>
            </div>

            {/* Agent Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Agent de livraison</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom</p>
                  <p className="font-medium">{delivery.agent_prenom} {delivery.agent_nom}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Numéro ID</p>
                  <p className="font-mono font-medium">{delivery.agent_numero}</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <PackageIcon className="h-4 w-4" />
                    Quantité livrée
                  </div>
                  <p className="font-semibold text-lg">{delivery.quantite_totale} articles</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Date de livraison
                  </div>
                  <p className="font-medium">
                    {format(new Date(delivery.date_livraison), "dd MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {delivery.heure_livraison}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSignIcon className="h-4 w-4" />
                    Montant
                  </div>
                  <p className="font-bold text-lg text-green-600">
                    {parseFloat(delivery.montant_total).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <CalendarIcon className="h-4 w-4" />
                    Créée le
                  </div>
                  <p className="font-medium text-sm">
                    {format(new Date(delivery.created_at), "dd MMM yyyy HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Commande link */}
            {delivery.commande_id && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Commande associée
                    </p>
                    <p className="text-xs text-blue-700">
                      #{delivery.commande_id}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = `/dashboard/orders/${delivery.commande_id}`}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Import DollarSignIcon
import { DollarSignIcon } from "lucide-react";
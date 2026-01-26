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
            En cours
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
    if (delivery.latitude && delivery.longitude) {
      const url = `https://www.google.com/maps?q=${delivery.latitude},${delivery.longitude}`;
      window.open(url, '_blank');
    }
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
                    {format(new Date(delivery.date_livraison), "HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
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

            {/* Location Section */}
            {delivery.latitude && delivery.longitude && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Position de livraison</h4>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openGoogleMaps}
                  >
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    Ouvrir dans Maps
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Latitude</p>
                    <p className="font-mono font-medium">{delivery.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Longitude</p>
                    <p className="font-mono font-medium">{delivery.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
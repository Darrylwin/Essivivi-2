"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  PackageIcon,
  CalendarIcon,
  MapPinIcon,
  EyeIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeliveryDetailDialog } from "@/components/deliveries/delivery-detail-dialog";
import type { LivraisonListItem, StatutLivraison } from "@/lib/types";

interface DeliveryListProps {
  deliveries: LivraisonListItem[];
  loading: boolean;
  onRefresh: () => void;
}

export function DeliveryList({ deliveries, loading, onRefresh }: DeliveryListProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<LivraisonListItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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

  const handleViewDetails = (delivery: LivraisonListItem) => {
    setSelectedDelivery(delivery);
    setDetailDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDetailDialogOpen(false);
    onRefresh();
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
        <div className="p-4 rounded-full bg-muted mb-4">
          <TruckIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucune livraison</h3>
        <p className="text-muted-foreground text-sm">
          Aucune livraison n&apos;a encore été créée pour cette commande.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TruckIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">Livraison #{delivery.id}</h4>
                    {getStatusBadge(delivery.statut)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewDetails(delivery)}
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <PackageIcon className="h-3 w-3" />
                  <span>Quantité</span>
                </div>
                <div className="font-medium">{delivery.quantite_totale} articles</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CalendarIcon className="h-3 w-3" />
                  <span>Date</span>
                </div>
                <div className="font-medium text-xs">
                  {format(new Date(delivery.date_livraison), "dd MMM yyyy HH:mm", {
                    locale: fr,
                  })}
                </div>
              </div>

              {delivery.commande?.latitude && delivery.commande?.longitude && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPinIcon className="h-3 w-3" />
                    <span>Position</span>
                  </div>
                  <div className="font-mono text-xs">
                    {delivery.commande.latitude.toFixed(4)}, {delivery.commande.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DeliveryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        delivery={selectedDelivery}
        onClose={handleDialogClose}
      />
    </>
  );
}
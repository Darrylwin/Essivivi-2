/* eslint-disable react-hooks/static-components */
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PackageIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  DollarSignIcon,
  PhoneIcon,
  MailIcon,
  HashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  NavigationIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CommandeDetailResponse } from "@/lib/types";

interface CommandeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commande: CommandeDetailResponse | null;
}

export function CommandeViewDialog({
  open,
  onOpenChange,
  commande,
}: CommandeViewDialogProps) {
  if (!commande) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente': return ClockIcon;
      case 'acceptee': return CheckCircleIcon;
      case 'en_cours': return NavigationIcon;
      case 'livree': return CheckCircleIcon;
      case 'annulee': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return "text-amber-600 bg-amber-50";
      case 'acceptee': return "text-blue-600 bg-blue-50";
      case 'en_cours': return "text-indigo-600 bg-indigo-50";
      case 'livree': return "text-green-600 bg-green-50";
      case 'annulee': return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const StatusIcon = getStatusIcon(commande.statut);
  const statusColor = getStatusColor(commande.statut);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Détails de la commande #{commande.id}</DialogTitle>
            </div>
            <Badge variant="outline" className={`${statusColor} font-medium`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {commande.statut}
            </Badge>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HashIcon className="h-4 w-4" />
                    ID Commande
                  </div>
                  <div className="font-mono text-lg">#{commande.id}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    Date de création
                  </div>
                  <div className="font-medium">{formatDate(commande.created_at)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PackageIcon className="h-4 w-4" />
                    Quantité totale
                  </div>
                  <div className="font-medium text-lg">
                    {commande.quantite_totale} unités
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSignIcon className="h-4 w-4" />
                    Montant total
                  </div>
                  <div className="font-bold text-lg text-green-600">
                    {parseFloat(commande.montant_total).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informations client */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Client
              </h3>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Point de vente
                    </div>
                    <div className="font-medium">{commande.client_nom}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Code client
                    </div>
                    <div className="font-mono">{commande.client_code}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Responsable
                    </div>
                    <div className="font-medium">{commande.client_responsable}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Téléphone
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{commande.client_telephone}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Position du client
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-mono text-sm">
                        {commande.client_latitude}, {commande.client_longitude}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informations agent */}
            {commande.agent && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Agent assigné
                  </h3>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Agent
                        </div>
                        <div className="font-medium">{commande.agent_nom_complet}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Numéro d&apos;identification
                        </div>
                        <div className="font-mono">{commande.agent_numero}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Téléphone
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{commande.agent_telephone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Localisation de livraison */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Localisation de livraison
              </h3>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Coordonnées GPS
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="font-mono text-sm">
                      {commande.latitude_livraison}, {commande.longitude_livraison}
                    </span>
                  </div>
                </div>
                
                {commande.distance_client_livraison && (
                  <div className="mt-2 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Distance depuis le client
                    </div>
                    <div className="flex items-center gap-2">
                      <NavigationIcon className="h-4 w-4" />
                      <span className="font-medium">
                        {commande.distance_client_livraison.toLocaleString('fr-FR')} mètres
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Lignes de commande */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Produits commandés</h3>
              
              <div className="space-y-2">
                {commande.lignes.map((ligne, index) => (
                  <div key={ligne.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        <PackageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {ligne.produit_detail?.nom || `Produit #${ligne.produit}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                    <div className="font-bold">
                      {parseFloat(ligne.montant).toLocaleString('fr-FR')} FCFA
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
          {commande.statut === 'en_attente' && (
            <Button>
              Modifier
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
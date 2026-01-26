"use client";

import { useState, useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2Icon,
  UserIcon,
  PackageIcon,
  DollarSignIcon,
  MapPinIcon,
  AlertCircleIcon,
  BikeIcon,
  PhoneIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CommandeListItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CommandeListItem | null;
  onSuccess: () => void;
}

export function OrderAssignDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderAssignDialogProps) {
  const { assignCommande, fetchAvailableAgents, availableAgents, loading } = useOrders();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableAgents();
      setSelectedAgentId("");
    }
  }, [open, fetchAvailableAgents]);

  const handleAssign = async () => {
    if (!order || !selectedAgentId) {
      toast.error("Veuillez sélectionner un agent");
      return;
    }
    
    setSubmitting(true);
    try {
      await assignCommande(order.id, { agent_id: parseInt(selectedAgentId) });
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'assignation";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  const selectedAgent = availableAgents?.agents.find(
    (a) => a.id.toString() === selectedAgentId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Assigner un agent</DialogTitle>
              <DialogDescription>
                Choisissez un agent disponible pour cette commande
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <h4 className="font-semibold text-sm">Informations de la commande</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Client
                </div>
                <div className="font-medium">{order.client_nom}</div>
                <div className="text-xs text-muted-foreground">Code: {order.client_code}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <PackageIcon className="h-3 w-3" />
                  Quantité
                </div>
                <div className="font-medium">{order.quantite_totale} articles</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <DollarSignIcon className="h-3 w-3" />
                  Montant
                </div>
                <div className="font-bold text-green-600">
                  {parseFloat(order.montant_total).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })} FCFA
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  Localisation
                </div>
                <div className="font-medium text-xs">
                  {order.latitude_livraison}, {order.longitude_livraison}
                </div>
              </div>
            </div>
          </div>
          
          {/* Agent Selection */}
          <div className="space-y-3">
            <Label htmlFor="agent">Sélectionner un agent disponible</Label>
            
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Choisir un agent..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents?.agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            {agent.prenom} {agent.nom}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agent.numero_identification} • {agent.telephone}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {availableAgents && availableAgents.agents.length === 0 && (
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Aucun agent disponible pour le moment. Tous les agents sont soit inactifs soit déjà en tournée.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Selected Agent Details */}
          {selectedAgent && (
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                Agent sélectionné
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Nom complet</div>
                  <div className="font-medium">
                    {selectedAgent.prenom} {selectedAgent.nom}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-muted-foreground">Numéro ID</div>
                  <div className="font-mono font-medium">
                    {selectedAgent.numero_identification}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" />
                    Téléphone
                  </div>
                  <div className="font-medium">{selectedAgent.telephone}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <BikeIcon className="h-3 w-3" />
                    Tricycle
                  </div>
                  <div className="font-medium">
                    {selectedAgent.tricycle || "Non assigné"}
                  </div>
                </div>
              </div>
              
              {selectedAgent.derniere_position && (
                <div className="pt-2 border-t space-y-1">
                  <div className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    Dernière position connue
                  </div>
                  <div className="font-mono text-xs">
                    Lat: {selectedAgent.derniere_position.latitude.toFixed(6)}, 
                    Lng: {selectedAgent.derniere_position.longitude.toFixed(6)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(selectedAgent.derniere_position.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {availableAgents && (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                {availableAgents.note}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={submitting || !selectedAgentId || availableAgents?.agents.length === 0}
          >
            {submitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              "Assigner l'agent"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
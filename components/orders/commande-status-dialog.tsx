/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2Icon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  PackageIcon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Commande, CommandeStatut } from "@/lib/types";

interface CommandeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commande: Commande | null;
  onChangeStatus: (commandeId: number, statut: CommandeStatut) => Promise<void>;
}

export function CommandeStatusDialog({
  open,
  onOpenChange,
  commande,
  onChangeStatus,
}: CommandeStatusDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CommandeStatut>("en_attente");

  const getStatusOptions = (currentStatut: CommandeStatut) => {
    const allStatus: CommandeStatut[] = ['en_attente', 'acceptee', 'en_cours', 'livree', 'annulee'];
    const currentIndex = allStatus.indexOf(currentStatut);
    
    if (currentStatut === 'livree' || currentStatut === 'annulee') {
      return []; // Ne pas permettre le changement si déjà livrée ou annulée
    }
    
    // Filtrer pour ne garder que les statuts après le current ou l'annulation
    return allStatus.filter((_, index) => index > currentIndex).concat('annulee');
  };

  const getStatusInfo = (statut: CommandeStatut) => {
    const info = {
      en_attente: {
        label: "En attente",
        icon: ClockIcon,
        color: "bg-amber-100 text-amber-800",
        description: "Commande créée, en attente d'assignation",
      },
      acceptee: {
        label: "Acceptée",
        icon: CheckCircleIcon,
        color: "bg-blue-100 text-blue-800",
        description: "Commande acceptée et assignée à un agent",
      },
      en_cours: {
        label: "En cours de livraison",
        icon: TruckIcon,
        color: "bg-indigo-100 text-indigo-800",
        description: "Agent en route vers le point de livraison",
      },
      livree: {
        label: "Livrée",
        icon: PackageIcon,
        color: "bg-green-100 text-green-800",
        description: "Commande livrée avec succès",
      },
      annulee: {
        label: "Annulée",
        icon: XCircleIcon,
        color: "bg-red-100 text-red-800",
        description: "Commande annulée",
      },
    };
    
    return info[statut];
  };

  const handleChangeStatus = async () => {
    if (!commande || !selectedStatus) return;
    
    setLoading(true);
    try {
      await onChangeStatus(commande.id, selectedStatus);
      onOpenChange(false);
      setSelectedStatus("en_attente");
      toast.success("Statut modifié avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de statut");
    } finally {
      setLoading(false);
    }
  };

  if (!commande) return null;

  const statusOptions = getStatusOptions(commande.statut);
  const currentStatusInfo = getStatusInfo(commande.statut);
  const selectedStatusInfo = getStatusInfo(selectedStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-primary" />
            <DialogTitle>Changer le statut</DialogTitle>
          </div>
          <DialogDescription>
            Modifiez le statut de cette commande.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Information de la commande */}
          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Commande #{commande.id}</div>
                  <div className="text-sm text-muted-foreground">
                    Client: {commande.client_nom}
                  </div>
                </div>
                <Badge className={currentStatusInfo.color}>
                  <currentStatusInfo.icon className="h-3 w-3 mr-1" />
                  {currentStatusInfo.label}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Sélection du nouveau statut */}
          <div className="space-y-3">
            <Label htmlFor="status-select">
              Nouveau statut *
            </Label>
            
            {statusOptions.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Ce statut ne peut plus être modifié (déjà livrée ou annulée).
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as CommandeStatut)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((statut) => {
                      const info = getStatusInfo(statut);
                      return (
                        <SelectItem key={statut} value={statut}>
                          <div className="flex items-center gap-2">
                            <info.icon className="h-4 w-4" />
                            <div>
                              <div>{info.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {info.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {/* Aperçu du nouveau statut */}
                {selectedStatus && (
                  <div className={`p-3 rounded-lg ${selectedStatusInfo.color}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <selectedStatusInfo.icon className="h-4 w-4" />
                      <span className="font-medium">{selectedStatusInfo.label}</span>
                    </div>
                    <p className="text-sm">{selectedStatusInfo.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedStatus("en_attente");
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleChangeStatus}
            disabled={loading || statusOptions.length === 0 || !selectedStatus}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer le changement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
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
import {
  Loader2Icon,
  TruckIcon,
  UserIcon,
  MapPinIcon,
  AlertCircleIcon,
  PackageIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Commande, AgentList } from "@/lib/types";

interface CommandeAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commande: Commande | null;
  agents: AgentList[];
  onAssign: (commandeId: number, agentId: number) => Promise<void>;
}

export function CommandeAssignDialog({
  open,
  onOpenChange,
  commande,
  agents,
  onAssign,
}: CommandeAssignDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const handleAssign = async () => {
    if (!commande || !selectedAgentId) return;
    
    setLoading(true);
    try {
      await onAssign(commande.id, parseInt(selectedAgentId));
      onOpenChange(false);
      setSelectedAgentId("");
      toast.success("Commande assignée avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'assignation");
    } finally {
      setLoading(false);
    }
  };

  if (!commande) return null;

  const availableAgents = agents.filter(agent => agent.statut === 'actif');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-primary" />
            <DialogTitle>Assigner une commande</DialogTitle>
          </div>
          <DialogDescription>
            Assignez cette commande à un agent pour la livraison.
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
                <div className="font-bold text-primary">
                  {parseFloat(commande.montant_total).toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <PackageIcon className="h-3 w-3" />
                  <span className="text-muted-foreground">Quantité :</span>
                  <span className="font-medium ml-1">{commande.quantite_totale} unités</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  <span className="text-muted-foreground">Localisation :</span>
                  <span className="font-medium ml-1">
                    {parseFloat(commande.latitude_livraison).toFixed(6)}, {parseFloat(commande.longitude_livraison).toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sélection de l'agent */}
          <div className="space-y-3">
            <Label htmlFor="agent-select">
              Sélectionnez un agent *
            </Label>
            
            {availableAgents.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Aucun agent actif disponible pour l&apos;assignation.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agent" />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <div>
                          <div>{agent.prenom} {agent.nom}</div>
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
            
            <p className="text-sm text-muted-foreground">
              L&apos;agent recevra une notification et pourra commencer la livraison.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedAgentId("");
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={loading || !selectedAgentId || availableAgents.length === 0}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Assigner la commande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  Loader2Icon,
  PackageIcon,
  UserIcon,
  DollarSignIcon,
  CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CommandeListItem } from "@/lib/types";

interface OrderDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: CommandeListItem | null;
  onSuccess: () => void;
}

export function OrderDeleteDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: OrderDeleteDialogProps) {
  const { deleteCommande } = useOrders();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const handleDelete = async () => {
    if (!order) return;
    
    if (confirmationText !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER en majuscules pour confirmer");
      return;
    }
    
    setLoading(true);
    try {
      await deleteCommande(order.id);
      onSuccess();
      onOpenChange(false);
      setConfirmationText("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Supprimer la commande</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. La commande sera définitivement supprimée.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <PackageIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">
                  Commande #{order.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  Client: {order.client_nom}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  Code client
                </div>
                <div className="font-medium">{order.client_code}</div>
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
                  Montant total
                </div>
                <div className="font-bold text-green-600">
                  {parseFloat(order.montant_total).toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })} FCFA
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Date création
                </div>
                <div className="font-medium text-xs">{formatDate(order.created_at)}</div>
              </div>
            </div>
            
            {order.est_assignee && order.agent_nom && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention:</strong> Cette commande est assignée à l&apos;agent {order.agent_nom} ({order.agent_numero}). 
                  La suppression annulera l&apos;assignation.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-destructive mb-2">
                Confirmez la suppression :
              </p>
              <p className="text-muted-foreground">
                Tapez <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                  SUPPRIMER
                </span> en majuscules pour confirmer
              </p>
            </div>
            <Input
              id="confirm-delete"
              placeholder="Saisir SUPPRIMER"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={confirmationText === "SUPPRIMER" ? "border-green-500" : ""}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmationText("");
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmationText !== "SUPPRIMER"}
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
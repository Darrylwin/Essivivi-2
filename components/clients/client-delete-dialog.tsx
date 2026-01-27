"use client";

import { useState } from "react";
import { useClients } from "@/lib/hooks/useClients";
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
  AlertCircleIcon,
  StoreIcon,
  CalendarIcon,
  HashIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientListItem, TypeClient } from "@/lib/types";

interface ClientDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientListItem | null;
  onSuccess: () => void;
}

export function ClientDeleteDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientDeleteDialogProps) {
  const { deleteClient } = useClients();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [hasOrders, setHasOrders] = useState(false);

  const handleDelete = async () => {
    if (!client) return;
    
    if (confirmationText !== client.nom_point_vente) {
      toast.error("Veuillez taper exactement le nom du point de vente pour confirmer");
      return;
    }
    
    if (hasOrders) {
      toast.error("Ce client a des commandes en cours. Veuillez d'abord les traiter.");
      return;
    }
    
    setLoading(true);
    try {
      await deleteClient(client.id);
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

  if (!client) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTypeLabel = (type: TypeClient): string => {
    switch (type) {
      case 'detaillant': return 'Détaillant';
      case 'grossiste': return 'Grossiste';
      case 'institution': return 'Institution';
    }
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
              <DialogTitle className="text-destructive">Supprimer le client</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Le client sera définitivement supprimé.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <StoreIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {client.nom_point_vente}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <HashIcon className="h-3 w-3" />
                    {client.code_client}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {client.statut === 'actif' ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckIcon className="h-4 w-4" />
                    <span className="text-sm">Actif</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XIcon className="h-4 w-4" />
                    <span className="text-sm">Inactif</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">Responsable</div>
                <div className="font-medium">{client.nom_responsable}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Type</div>
                <div className="font-medium">{getTypeLabel(client.type_client)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3" />
                  Téléphone
                </div>
                <div className="font-medium">{client.telephone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Date d&apos;inscription
                </div>
                <div className="font-medium">{formatDate(client.date_inscription)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <MailIcon className="h-3 w-3" />
                  Email
                </div>
                <div className="font-medium truncate">{client.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3" />
                  Adresse
                </div>
                <div className="font-medium truncate">{client.adresse}</div>
              </div>
            </div>
          </div>
          
          {/* Confirmation */}
          {!hasOrders && (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-destructive mb-2">
                  Confirmez la suppression :
                </p>
                <p className="text-muted-foreground">
                  Tapez <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                    {client.nom_point_vente}
                  </span> pour confirmer
                </p>
              </div>
              <Input
                id="confirm-delete"
                placeholder={`Saisir "${client.nom_point_vente}"`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className={confirmationText === client.nom_point_vente ? "border-green-500" : ""}
                disabled={hasOrders}
              />
            </div>
          )}
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
            disabled={loading || hasOrders || confirmationText !== client.nom_point_vente}
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
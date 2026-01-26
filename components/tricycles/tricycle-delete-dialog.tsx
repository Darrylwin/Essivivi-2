"use client";

import { useState } from "react";
import { useAgents } from "@/lib/hooks/useAgents";
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
  BikeIcon,
  CalendarIcon,
  HashIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tricycle } from "@/lib/types";

interface TricycleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tricycle: Tricycle | null;
  onSuccess: () => void;
}

export function TricycleDeleteDialog({
  open,
  onOpenChange,
  tricycle,
  onSuccess,
}: TricycleDeleteDialogProps) {
  const { deleteTricycle } = useAgents();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isAssigned, setIsAssigned] = useState(false);

  const handleDelete = async () => {
    if (!tricycle) return;
    
    if (confirmationText !== tricycle.plaque_immatriculation) {
      toast.error("Veuillez taper exactement la plaque d'immatriculation pour confirmer");
      return;
    }
    
    setLoading(true);
    try {
      await deleteTricycle(tricycle.id);
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

  if (!tricycle) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              <DialogTitle className="text-destructive">Supprimer le tricycle</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Le tricycle sera définitivement supprimé.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Tricycle Info */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <BikeIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono font-bold text-lg">
                    {tricycle.plaque_immatriculation}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <HashIcon className="h-3 w-3" />
                    ID: #{tricycle.id}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Créé le
                </div>
                <div className="font-medium">{formatDate(tricycle.created_at)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Dernière mise à jour</div>
                <div className="font-medium">
                  {tricycle.updated_at ? formatDate(tricycle.updated_at) : "-"}
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirmation */}
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-destructive mb-2">
                Confirmez la suppression :
              </p>
              <p className="text-muted-foreground">
                Tapez <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                  {tricycle.plaque_immatriculation}
                </span> pour confirmer
              </p>
            </div>
            <Input
              id="confirm-delete"
              placeholder={`Saisir "${tricycle.plaque_immatriculation}"`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={confirmationText === tricycle.plaque_immatriculation ? "border-green-500" : ""}
              disabled={isAssigned}
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
            disabled={loading || isAssigned || confirmationText !== tricycle.plaque_immatriculation}
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
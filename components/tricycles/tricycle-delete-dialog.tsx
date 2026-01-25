"use client";

import { useState } from "react";
import { useUsers } from "@/lib/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TricycleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tricycle: any | null;
  onSuccess: () => void;
}

export function TricycleDeleteDialog({
  open,
  onOpenChange,
  tricycle,
  onSuccess,
}: TricycleDeleteDialogProps) {
  const { deleteTricycle } = useUsers();
  const [loading, setLoading] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  const handleDelete = async () => {
    if (!tricycle) return;
    
    setLoading(true);
    try {
      await deleteTricycle(tricycle.id);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (!tricycle) return null;

  // Dans une implémentation réelle, vérifiez si le tricycle est assigné
  // const checkIfAssigned = async () => {
  //   // Vérifiez si des agents utilisent ce tricycle
  //   // setIsAssigned(result);
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            <DialogTitle>Supprimer le tricycle</DialogTitle>
          </div>
          <DialogDescription>
            Cette action est irréversible. Le tricycle sera définitivement supprimé.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="font-mono font-semibold text-lg">
              {tricycle.plaque_immatriculation}
            </div>
            <div className="text-sm text-muted-foreground">
              ID: #{tricycle.id} • Créé le {new Date(tricycle.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
          
          {isAssigned ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Ce tricycle est actuellement assigné à un agent. Veuillez d'abord le désassigner avant de le supprimer.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                La suppression d'un tricycle affectera tous les agents qui y sont associés.
                Assurez-vous qu'aucun agent n'utilise actuellement ce tricycle.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-destructive">
              Confirmez la suppression :
            </p>
            <p className="mt-2">
              Tapez <span className="font-mono font-bold">{tricycle.plaque_immatriculation}</span> pour confirmer
            </p>
            <Input
              id="confirm-delete"
              placeholder={`Saisir "${tricycle.plaque_immatriculation}"`}
              className="mt-2"
              onChange={(e) => {
                // Vous pouvez ajouter une validation de confirmation ici
              }}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || isAssigned}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
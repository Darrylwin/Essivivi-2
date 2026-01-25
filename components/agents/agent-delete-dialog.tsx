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
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

interface AgentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any | null;
  onSuccess: () => void;
}

export function AgentDeleteDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentDeleteDialogProps) {
  const { deleteAgent } = useUsers();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!agent) return;
    
    setLoading(true);
    try {
      await deleteAgent(agent.id);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            <DialogTitle>Supprimer l'agent</DialogTitle>
          </div>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="font-medium">{agent.nom} {agent.prenom}</div>
            <div className="text-sm text-muted-foreground">
              {agent.numero_identification} • {agent.email}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-destructive">
              Attention : Cette action supprimera définitivement :
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Le compte de l'agent</li>
              <li>Toutes les données associées</li>
              <li>L'historique des activités</li>
            </ul>
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
            disabled={loading}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
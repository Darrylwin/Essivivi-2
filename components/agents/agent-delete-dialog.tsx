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
  UserIcon,
  CalendarIcon,
  HashIcon,
  PhoneIcon,
  MailIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentListItem, Agent } from "@/lib/types";

interface AgentDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentListItem | Agent | null;
  onSuccess: () => void;
}

export function AgentDeleteDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentDeleteDialogProps) {
  const { deleteAgent } = useAgents();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [hasAssignments, setHasAssignments] = useState(false);

  const handleDelete = async () => {
    if (!agent) return;
    
    if (confirmationText !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER en majuscules pour confirmer");
      return;
    }
    
    setLoading(true);
    try {
      await deleteAgent(agent.id);
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

  if (!agent) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const fullName = `${agent.prenom} ${agent.nom}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Supprimer l&apos;agent</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. L&apos;agent sera définitivement supprimé.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Agent Info */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {fullName}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <HashIcon className="h-3 w-3" />
                    ID: #{agent.id}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3" />
                  Téléphone
                </div>
                <div className="font-medium">{agent.telephone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <MailIcon className="h-3 w-3" />
                  Email
                </div>
                <div className="font-medium truncate">{agent.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  Date d&apos;inscription
                </div>
                <div className="font-medium">{formatDate(agent.created_at)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Statut</div>
                <div className="font-medium">
                  {agent.statut === 'actif' ? 'Actif' : 
                   agent.statut === 'inactif' ? 'Inactif' : 
                   'En tournée'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Warning Alerts */}
          {hasAssignments ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="font-medium">
                Cet agent a des commandes ou tournées en cours. Veuillez d&apos;abord les réassigner avant de le supprimer.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Attention : Action irréversible</div>
                La suppression d&apos;un agent affectera toutes ses commandes, tournées et statistiques.
                Cette action ne peut pas être annulée.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Confirmation */}
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
              disabled={hasAssignments}
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
            disabled={loading || hasAssignments || confirmationText !== "SUPPRIMER"}
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
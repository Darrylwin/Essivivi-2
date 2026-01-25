"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  UserIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  MapPinIcon,
  BikeIcon,
  HashIcon,
  ClockIcon,
  EditIcon,
} from "lucide-react";

interface AgentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any | null;
}

export function AgentViewDialog({
  open,
  onOpenChange,
  agent,
}: AgentViewDialogProps) {
  if (!agent) return null;

  const getStatusBadge = (statut: string) => {
    const variants = {
      actif: "default",
      inactif: "destructive",
      en_tournee: "outline",
    } as const;
    
    const labels = {
      actif: "Actif",
      inactif: "Inactif",
      en_tournee: "En tournée",
    };
    
    return (
      <Badge variant={variants[statut as keyof typeof variants]}>
        {labels[statut as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Détails de l'agent</DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(agent.statut)}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <HashIcon className="inline h-3 w-3 mr-1" />
                  ID Agent
                </div>
                <div className="font-mono">{agent.numero_identification}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Nom complet
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{agent.nom} {agent.prenom}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <PhoneIcon className="inline h-3 w-3 mr-1" />
                  Téléphone
                </div>
                <div>{agent.telephone}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <MailIcon className="inline h-3 w-3 mr-1" />
                  Email
                </div>
                <div>{agent.email}</div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Informations complémentaires */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informations complémentaires</h3>
            <div className="grid grid-cols-2 gap-4">
              {agent.date_naissance && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <CalendarIcon className="inline h-3 w-3 mr-1" />
                    Date de naissance
                  </div>
                  <div>
                    {format(new Date(agent.date_naissance), "dd MMMM yyyy", { locale: fr })}
                  </div>
                </div>
              )}
              
              {agent.adresse && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <MapPinIcon className="inline h-3 w-3 mr-1" />
                    Adresse
                  </div>
                  <div className="text-sm">{agent.adresse}</div>
                </div>
              )}
              
              {agent.tricycle && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <BikeIcon className="inline h-3 w-3 mr-1" />
                    Tricycle assigné
                  </div>
                  <div className="font-medium">
                    {agent.tricycle.plaque_immatriculation}
                  </div>
                </div>
              )}
              
              {agent.created_at && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <ClockIcon className="inline h-3 w-3 mr-1" />
                    Date d'inscription
                  </div>
                  <div>
                    {format(new Date(agent.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Photo (si disponible) */}
          {agent.photo && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Photo de profil</h3>
                <div className="flex justify-center">
                  <div className="relative h-40 w-40 overflow-hidden rounded-full border">
                    <img
                      src={agent.photo}
                      alt={`Photo de ${agent.prenom} ${agent.nom}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Actions */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
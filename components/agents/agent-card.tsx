"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  BikeIcon,
  HashIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { AgentListItem } from "@/lib/types";

interface AgentCardProps {
  agent: AgentListItem;
  onEdit?: (agent: AgentListItem) => void;
  onDelete?: (agent: AgentListItem) => void;
  onView?: (agent: AgentListItem) => void;
}

export function AgentCard({
  agent,
  onEdit,
  onDelete,
  onView,
}: AgentCardProps) {
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const getStatusBadge = () => {
    switch (agent.statut) {
      case 'actif':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Actif
          </Badge>
        );
      case 'inactif':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Inactif
          </Badge>
        );
      case 'en_tournee':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <BikeIcon className="mr-1 h-3 w-3" />
            En tournée
          </Badge>
        );
      default:
        return <Badge variant="outline">{agent.statut}</Badge>;
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {agent.prenom} {agent.nom}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <HashIcon className="h-3 w-3" />
                  {agent.numero_identification}
                </CardDescription>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{agent.telephone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{agent.email}</span>
            </div>
          </div>

          {/* Tricycle Info */}
          {agent.tricycle_plaque && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <BikeIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tricycle assigné</span>
              </div>
              <div className="font-mono font-semibold">
                {agent.tricycle_plaque}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            Inscrit le {formatDate(agent.created_at)}
          </div>
        </div>
      </CardContent>
      
      {(onEdit || onDelete || onView) && (
        <CardFooter className="pt-3 border-t">
          <div className="flex w-full gap-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onView(agent)}
              >
                <EyeIcon className="mr-2 h-3 w-3" />
                Détails
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(agent)}
              >
                <EditIcon className="mr-2 h-3 w-3" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(agent)}
              >
                <Trash2Icon className="mr-2 h-3 w-3" />
                Supprimer
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
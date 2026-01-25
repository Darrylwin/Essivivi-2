"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BikeIcon, CalendarIcon, UserIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TricycleCardProps {
  tricycle: any;
  onEdit?: (tricycle: any) => void;
  onDelete?: (tricycle: any) => void;
}

export function TricycleCard({
  tricycle,
  onEdit,
  onDelete,
}: TricycleCardProps) {
  const isAssigned = false; // À implémenter
  const assignedAgent = null; // À implémenter

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BikeIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-mono">
              {tricycle.plaque_immatriculation}
            </CardTitle>
          </div>
          <Badge variant={isAssigned ? "default" : "outline"}>
            {isAssigned ? "Assigné" : "Disponible"}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <CalendarIcon className="h-3 w-3" />
          Ajouté le {format(new Date(tricycle.created_at), "dd MMMM yyyy", { locale: fr })}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">ID</div>
            <div className="font-medium">#{tricycle.id}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Statut</div>
            <div className="font-medium">
              {isAssigned ? "En service" : "En stock"}
            </div>
          </div>
        </div>
        
        {isAssigned && assignedAgent && (
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="h-4 w-4" />
              <div className="font-medium">Assigné à :</div>
            </div>
            <div className="text-sm">
              <div>{assignedAgent.nom} {assignedAgent.prenom}</div>
              <div className="text-muted-foreground">{assignedAgent.numero_identification}</div>
            </div>
          </div>
        )}
        
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(tricycle)}>
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(tricycle)}
              >
                Supprimer
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
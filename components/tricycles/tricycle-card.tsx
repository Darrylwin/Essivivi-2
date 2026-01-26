"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BikeIcon,
  CalendarIcon,
  UserIcon,
  HashIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tricycle } from "@/lib/types";

interface TricycleCardProps {
  tricycle: Tricycle;
  onEdit?: (tricycle: Tricycle) => void;
  onDelete?: (tricycle: Tricycle) => void;
}

export function TricycleCard({
  tricycle,
  onEdit,
  onDelete,
}: TricycleCardProps) {
  const isAssigned = false; // À implémenter avec les données réelles
  const assignedAgent = null; // À implémenter avec les données réelles

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <BikeIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="font-mono text-lg tracking-wider">
                {tricycle.plaque_immatriculation}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-2 text-sm">
              <HashIcon className="h-3 w-3" />
              ID: #{tricycle.id}
            </CardDescription>
          </div>
          <Badge 
            variant={isAssigned ? "default" : "secondary"} 
            className={isAssigned ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
          >
            {isAssigned ? "Assigné" : "Disponible"}
          </Badge>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Dates</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Création</div>
                <div className="font-medium">{formatDate(tricycle.created_at)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatTimeAgo(tricycle.created_at)}
                </div>
              </div>
              {tricycle.updated_at && (
                <div>
                  <div className="text-muted-foreground">Mise à jour</div>
                  <div className="font-medium">{formatDate(tricycle.updated_at)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(tricycle.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agent assigné */}
          {isAssigned && assignedAgent && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assigné à</span>
              </div>
              <div className="space-y-1">
                <div className="font-medium">
                  {/* {assignedAgent.prenom} {assignedAgent.nom} */}
                  Agent
                </div>
                <div className="text-sm text-muted-foreground">
                  {/* {assignedAgent.numero_identification} */}
                  N° ID: 123456
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {(onEdit || onDelete) && (
        <CardFooter className="pt-3 border-t">
          <div className="flex w-full gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(tricycle)}
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
                onClick={() => onDelete(tricycle)}
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
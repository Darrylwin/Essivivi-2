"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  StoreIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CalendarIcon,
  HashIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
  CheckIcon,
  XIcon,
  BuildingIcon,
  PackageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ClientListItem, TypeClient } from "@/lib/types";

interface ClientCardProps {
  client: ClientListItem;
  onEdit?: (client: ClientListItem) => void;
  onDelete?: (client: ClientListItem) => void;
  onView?: (client: ClientListItem) => void;
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  onView,
}: ClientCardProps) {
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  const getTypeIcon = (type: TypeClient) => {
    switch (type) {
      case 'detaillant': return <StoreIcon className="h-4 w-4" />;
      case 'grossiste': return <PackageIcon className="h-4 w-4" />;
      case 'institution': return <BuildingIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: TypeClient): string => {
    switch (type) {
      case 'detaillant': return 'Détaillant';
      case 'grossiste': return 'Grossiste';
      case 'institution': return 'Institution';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                {getTypeIcon(client.type_client)}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {client.nom_point_vente}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <HashIcon className="h-3 w-3" />
                  {client.code_client}
                </CardDescription>
              </div>
            </div>
          </div>
          {client.statut === 'actif' ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckIcon className="mr-1 h-3 w-3" />
              Actif
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-200">
              <XIcon className="mr-1 h-3 w-3" />
              Inactif
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{client.nom_responsable}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span>{client.telephone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{client.email}</span>
            </div>
          </div>

          {/* Type Info */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <div className="flex items-center gap-2">
              {getTypeIcon(client.type_client)}
              <span className="text-sm font-medium">Type de client</span>
            </div>
            <div className="font-medium">
              {getTypeLabel(client.type_client)}
            </div>
          </div>

          {/* Address and Date */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPinIcon className="h-4 w-4 mt-0.5" />
              <span className="line-clamp-2">{client.adresse}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              Inscrit le {formatDate(client.date_inscription)}
            </div>
          </div>
        </div>
      </CardContent>
      
      {(onEdit || onDelete || onView) && (
        <CardFooter className="pt-3 border-t">
          <div className="flex w-full gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(client)}
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
                onClick={() => onDelete(client)}
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
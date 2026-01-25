"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  PackageIcon,
  CalendarIcon,
  TagIcon,
  DollarSignIcon,
  HashIcon,
  ScaleIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  BuildingIcon,
  TypeIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProduitViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produit: any | null;
}

export function ProduitViewDialog({
  open,
  onOpenChange,
  produit,
}: ProduitViewDialogProps) {
  if (!produit) return null;

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getUniteLabel = (unite: string) => {
    const labels: Record<string, string> = {
      sachet: 'Sachet',
      bouteille: 'Bouteille',
      canette: 'Canette',
      pack: 'Pack',
    };
    return labels[unite] || unite;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Détails du produit</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={produit.actif ? "default" : "secondary"}>
                {produit.actif ? (
                  <>
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Actif
                  </>
                ) : (
                  <>
                    <EyeOffIcon className="h-3 w-3 mr-1" />
                    Inactif
                  </>
                )}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 overflow-y-auto pr-2">
          {/* Photo du produit */}
          {produit.photo && (
            <div className="flex justify-center">
              <div className="relative w-64 h-64 overflow-hidden rounded-lg border">
                <img
                  src={produit.photo}
                  alt={`${produit.nom} ${produit.volume || ''}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Informations principales */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              Informations du produit
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <HashIcon className="inline h-3 w-3 mr-1" />
                  ID Produit
                </div>
                <div className="font-mono text-sm">#{produit.id}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Nom
                </div>
                <div className="font-medium text-lg">{produit.nom}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <BuildingIcon className="inline h-3 w-3 mr-1" />
                  Marque
                </div>
                <div className="font-medium">{produit.marque}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <ScaleIcon className="inline h-3 w-3 mr-1" />
                  Volume
                </div>
                <div className="font-medium">
                  {produit.volume || <span className="text-muted-foreground italic">Non spécifié</span>}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <TypeIcon className="inline h-3 w-3 mr-1" />
                  Unité de vente
                </div>
                <div>
                  <Badge variant="outline">{getUniteLabel(produit.unite_vente)}</Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  <DollarSignIcon className="inline h-3 w-3 mr-1" />
                  Prix unitaire
                </div>
                <div className="font-bold text-lg text-primary">
                  {formatPrice(produit.prix_unitaire)}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Catégorie */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Catégorie
            </h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Catégorie
                  </div>
                  <div className="font-medium">
                    {produit.categorie_detail?.nom || `Catégorie #${produit.categorie}`}
                  </div>
                </div>
                
                {produit.categorie_detail && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Statut catégorie
                    </div>
                    <div>
                      <Badge variant={produit.categorie_detail.actif ? "outline" : "secondary"}>
                        {produit.categorie_detail.actif ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Informations temporelles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Historique
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Date de création
                </div>
                <div className="text-sm">
                  {format(new Date(produit.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Dernière mise à jour
                </div>
                <div className="text-sm">
                  {format(new Date(produit.updated_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Note sur l'unité */}
          <div className={cn(
            "p-3 rounded-lg text-sm",
            produit.unite_vente === 'sachet' 
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-muted text-muted-foreground"
          )}>
            <div className="font-medium mb-1">Note sur l'unité de vente :</div>
            <div>
              {produit.unite_vente === 'sachet' && "Cette unité est idéale pour la vente de détail au détail."}
              {produit.unite_vente === 'bouteille' && "Cette unité est adaptée pour les boissons en bouteille."}
              {produit.unite_vente === 'canette' && "Cette unité est destinée aux boissons en canette."}
              {produit.unite_vente === 'pack' && "Cette unité représente un pack de plusieurs produits."}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
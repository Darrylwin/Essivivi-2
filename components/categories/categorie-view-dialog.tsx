"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  TagIcon,
  PackageIcon,
  TrendingUpIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  HashIcon,
} from "lucide-react";
import { ProduitTableMini } from "./produit-table-mini";

interface CategorieViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorie: any | null;
}

export function CategorieViewDialog({
  open,
  onOpenChange,
  categorie,
}: CategorieViewDialogProps) {
  if (!categorie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>Détails de la catégorie</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={categorie.actif ? "default" : "secondary"}>
                {categorie.actif ? (
                  <>
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <EyeOffIcon className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                Informations générales
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    <HashIcon className="inline h-3 w-3 mr-1" />
                    ID Catégorie
                  </div>
                  <div className="font-mono text-sm">#{categorie.id}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Nom
                  </div>
                  <div className="font-medium text-lg">{categorie.nom}</div>
                </div>
                
                {categorie.description && (
                  <div className="col-span-2 space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Description
                    </div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {categorie.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Statistiques */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                Statistiques
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Produits totaux</div>
                  <div className="text-2xl font-bold">{categorie.nombre_produits || 0}</div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Produits actifs</div>
                  <div className="text-2xl font-bold">
                    {categorie.produits?.filter((p: any) => p.actif).length || 0}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Créée le</div>
                  <div className="text-sm">
                    {format(new Date(categorie.created_at), "dd MMM yyyy", { locale: fr })}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
                  <div className="text-sm">
                    {format(new Date(categorie.updated_at), "dd MMM yyyy", { locale: fr })}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Liste des produits */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <PackageIcon className="h-4 w-4" />
                  Produits ({categorie.produits?.length || 0})
                </h3>
                {categorie.produits?.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {categorie.produits.filter((p: any) => p.actif).length} actifs
                  </div>
                )}
              </div>
              
              {categorie.produits && categorie.produits.length > 0 ? (
                <ProduitTableMini produits={categorie.produits} />
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucun produit dans cette catégorie</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Commencez par ajouter des produits à cette catégorie
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
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
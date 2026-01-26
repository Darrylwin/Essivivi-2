"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  PackageIcon,
  TagIcon,
  DollarSignIcon,
  ScaleIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
} from "lucide-react";
import type { ProduitListItem, UniteVente } from "@/lib/types";

interface ProductCardProps {
  product: ProduitListItem;
  onEdit?: (product: ProduitListItem) => void;
  onDelete?: (product: ProduitListItem) => void;
  onView?: (product: ProduitListItem) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onView,
}: ProductCardProps) {
  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00 FCFA" : `${num.toFixed(2)} FCFA`;
  };

  const getUnitBadge = (unite: UniteVente) => {
    const unitConfig = {
      sachet: { label: "Sachet", color: "bg-blue-100 text-blue-800" },
      bouteille: { label: "Bouteille", color: "bg-green-100 text-green-800" },
      canette: { label: "Canette", color: "bg-orange-100 text-orange-800" },
      pack: { label: "Pack", color: "bg-purple-100 text-purple-800" },
    };
    
    const config = unitConfig[unite];
    return (
      <Badge className={`${config.color} hover:${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <PackageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {product.nom}
                </CardTitle>
                <CardDescription className="text-sm">
                  {product.marque}
                </CardDescription>
              </div>
            </div>
          </div>
          {product.actif ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Actif
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-200">
              Inactif
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSignIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {formatPrice(product.prix_unitaire)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Prix unitaire
                </div>
              </div>
            </div>
            {getUnitBadge(product.unite_vente)}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <span>Catégorie</span>
              </div>
              <span className="font-medium">{product.categorie_nom}</span>
            </div>
            
            {product.volume && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ScaleIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Volume</span>
                </div>
                <span className="font-medium">{product.volume}</span>
              </div>
            )}
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
                onClick={() => onView(product)}
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
                onClick={() => onEdit(product)}
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
                onClick={() => onDelete(product)}
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
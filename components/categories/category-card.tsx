"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  TagIcon,
  PackageIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  Trash2Icon,
  EyeIcon,
} from "lucide-react";
import type { CategorieListItem } from "@/lib/types";

interface CategoryCardProps {
  category: CategorieListItem,
  onEdit?: (category: CategorieListItem) => void;
  onDelete?: (category: CategorieListItem) => void;
  onView?: (category: CategorieListItem) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onView,
}: CategoryCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <TagIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {category.nom}
                </CardTitle>
                <CardDescription className="text-sm">
                  ID: #{category.id}
                </CardDescription>
              </div>
            </div>
          </div>
          {category.actif ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckIcon className="mr-1 h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-200">
              <XIcon className="mr-1 h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          {/* Products Count */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Produits dans cette catégorie</span>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">
                {category.nombre_produits}
              </div>
              <div className="text-sm text-muted-foreground">
                produit{category.nombre_produits !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="text-sm">
            <p className="text-muted-foreground">
              {category.actif 
                ? "Cette catégorie est visible dans le catalogue."
                : "Cette catégorie est masquée dans le catalogue."}
            </p>
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
                onClick={() => onView(category)}
              >
                <EyeIcon className="mr-2 h-3 w-3" />
                Produits
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(category)}
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
                onClick={() => onDelete(category)}
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
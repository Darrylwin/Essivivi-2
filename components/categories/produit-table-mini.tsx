"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProduitTableMiniProps {
  produits: any[];
  onView?: (produit: any) => void;
  onEdit?: (produit: any) => void;
  onDelete?: (produit: any) => void;
}

export function ProduitTableMini({ 
  produits, 
  onView, 
  onEdit, 
  onDelete 
}: ProduitTableMiniProps) {
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (produits.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Aucun produit</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Statut</TableHead>
            {onView || onEdit || onDelete ? (
              <TableHead className="text-right">Actions</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {produits.map((produit) => (
            <TableRow key={produit.id} className="hover:bg-muted/50">
              <TableCell>
                <div>
                  <div className="font-medium">{produit.nom}</div>
                  {produit.volume && (
                    <div className="text-sm text-muted-foreground">
                      {produit.volume} • {produit.unite_vente}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{produit.marque}</div>
              </TableCell>
              <TableCell>
                <div className="font-bold text-primary">
                  {formatPrice(produit.prix_unitaire)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={produit.actif ? "default" : "secondary"}>
                  {produit.actif ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              {(onView || onEdit || onDelete) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(produit)}
                        title="Voir détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(produit)}
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(produit)}
                        title="Supprimer"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
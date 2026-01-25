"use client";

import { useState } from "react";
import { useProducts } from "@/lib/hooks/useProducts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export function CategorieDeleteDialog({ open, onOpenChange, categorie, onSuccess }: any) {
  const { deleteCategorie } = useProducts();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!categorie) return;
    
    setLoading(true);
    try {
      await deleteCategorie(categorie.id);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (!categorie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            <DialogTitle>Supprimer la catégorie</DialogTitle>
          </div>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette catégorie ?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border p-4">
            <div className="font-medium">{categorie.nom}</div>
            <div className="text-sm text-muted-foreground">
              {categorie.nombre_produits} produit(s) • {categorie.actif ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || categorie.nombre_produits > 0}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
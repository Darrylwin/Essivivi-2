"use client";

import { useState } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  Loader2Icon,
  AlertCircleIcon,
  TagIcon,
  PackageIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CategorieListItem } from "@/lib/types";

interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategorieListItem | null;
  onSuccess: () => void;
}

export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDeleteDialogProps) {
  const { deleteCategorie } = useCategories();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [hasProducts, setHasProducts] = useState(false);

  const handleDelete = async () => {
    if (!category) return;
    
    if (confirmationText !== category.nom) {
      toast.error("Veuillez taper exactement le nom de la catégorie pour confirmer");
      return;
    }
    
    if (category.nombre_produits > 0) {
      toast.error("Cette catégorie contient des produits. Veuillez d'abord déplacer ou supprimer les produits.");
      return;
    }
    
    setLoading(true);
    try {
      await deleteCategorie(category.id);
      onSuccess();
      onOpenChange(false);
      setConfirmationText("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  const hasProductsCheck = category.nombre_produits > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Supprimer la catégorie</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. La catégorie sera définitivement supprimée.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Category Info */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {category.nom}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ID: #{category.id}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {category.actif ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckIcon className="h-4 w-4" />
                    <span className="text-sm">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XIcon className="h-4 w-4" />
                    <span className="text-sm">Inactive</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <PackageIcon className="h-3 w-3" />
                  Produits associés
                </div>
                <div className={`font-medium ${category.nombre_produits > 0 ? "text-destructive" : ""}`}>
                  {category.nombre_produits} produit(s)
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirmation */}
          {!hasProductsCheck && (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-destructive mb-2">
                  Confirmez la suppression :
                </p>
                <p className="text-muted-foreground">
                  Tapez <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                    {category.nom}
                  </span> pour confirmer
                </p>
              </div>
              <Input
                id="confirm-delete"
                placeholder={`Saisir "${category.nom}"`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className={confirmationText === category.nom ? "border-green-500" : ""}
                disabled={hasProductsCheck}
              />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmationText("");
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || hasProductsCheck || confirmationText !== category.nom}
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
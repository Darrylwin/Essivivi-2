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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  Loader2Icon,
  AlertCircleIcon,
  PackageIcon,
  TagIcon,
  DollarSignIcon,
  ScaleIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { ProduitListItem } from "@/lib/types";

interface ProductDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProduitListItem | null;
  onSuccess: () => void;
}

export function ProductDeleteDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDeleteDialogProps) {
  const { deleteProduit } = useProducts();
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [hasOrders, setHasOrders] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    
    if (confirmationText !== product.nom) {
      toast.error("Veuillez taper exactement le nom du produit pour confirmer");
      return;
    }
    
    setLoading(true);
    try {
      await deleteProduit(product.id);
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

  if (!product) return null;

  const formatPrice = (price: string): string => {
    const num = parseFloat(price);
    return isNaN(num) ? "0.00 FCFA" : `${num.toFixed(2)} FCFA`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangleIcon className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">Supprimer le produit</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. Le produit sera définitivement supprimé.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Product Info */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <PackageIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {product.nom}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.marque}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  Catégorie
                </div>
                <div className="font-medium">{product.categorie_nom}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Statut</div>
                <div className="font-medium">
                  {product.actif ? 'Actif' : 'Inactif'}
                </div>
              </div>
              {product.volume && (
                <div className="space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1">
                    <ScaleIcon className="h-3 w-3" />
                    Volume
                  </div>
                  <div className="font-medium">{product.volume}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <DollarSignIcon className="h-3 w-3" />
                  Prix
                </div>
                <div className="font-bold">{formatPrice(product.prix_unitaire)}</div>
              </div>
            </div>
          </div>
          
          {/* Warning Alerts */}
          {hasOrders ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription className="font-medium">
                Ce produit a des commandes en cours. Veuillez d&apos;abord traiter ces commandes avant de supprimer le produit.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Attention : Action irréversible</div>
                La suppression d&apos;un produit affectera toutes les commandes et statistiques qui y sont associées.
                Cette action ne peut pas être annulée.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Confirmation */}
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-medium text-destructive mb-2">
                Confirmez la suppression :
              </p>
              <p className="text-muted-foreground">
                Tapez <span className="font-mono font-bold bg-muted px-2 py-1 rounded">
                  {product.nom}
                </span> pour confirmer
              </p>
            </div>
            <Input
              id="confirm-delete"
              placeholder={`Saisir "${product.nom}"`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={confirmationText === product.nom ? "border-green-500" : ""}
              disabled={hasOrders}
            />
          </div>
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
            disabled={loading || hasOrders || confirmationText !== product.nom}
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
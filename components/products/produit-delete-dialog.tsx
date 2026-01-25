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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangleIcon,
  Loader2Icon,
  PackageIcon,
  AlertCircleIcon,
  HashIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ProduitDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produit: any | null;
  onSuccess: () => void;
}

export function ProduitDeleteDialog({
  open,
  onOpenChange,
  produit,
  onSuccess,
}: ProduitDeleteDialogProps) {
  const { deleteProduit } = useProducts();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleDelete = async () => {
    if (!produit) return;
    
    if (confirmText !== produit.nom) {
      setError(`Veuillez taper "${produit.nom}" pour confirmer la suppression`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteProduit(produit.id);
      onSuccess();
      onOpenChange(false);
      setConfirmText("");
      toast.success("Produit supprimé avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
      setError("Erreur lors de la suppression du produit");
    } finally {
      setLoading(false);
    }
  };

  if (!produit) return null;

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-500" />
            <DialogTitle>Supprimer le produit</DialogTitle>
          </div>
          <DialogDescription>
            Cette action est irréversible. Le produit sera définitivement supprimé.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Information du produit */}
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              {produit.photo ? (
                <div className="w-16 h-16 rounded overflow-hidden border">
                  <img
                    src={produit.photo}
                    alt={produit.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                  <PackageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{produit.nom}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{produit.marque}</span>
                      {produit.volume && <span>• {produit.volume}</span>}
                    </div>
                  </div>
                  <div className="font-bold text-primary">
                    {formatPrice(produit.prix_unitaire)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <HashIcon className="h-3 w-3" />
                    <span className="text-muted-foreground">ID :</span>
                    <span className="font-mono">#{produit.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Unité :</span>
                    <span className="ml-1">{getUniteLabel(produit.unite_vente)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Catégorie :</span>
                    <span className="ml-1 font-medium">
                      {produit.categorie_nom || `Catégorie #${produit.categorie}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirmation */}
          <div className="space-y-3">
            <Label htmlFor="confirm-delete" className="text-destructive">
              Confirmez la suppression
            </Label>
            <div className="text-sm text-muted-foreground">
              Pour confirmer, tapez <span className="font-bold">"{produit.nom}"</span> dans le champ ci-dessous
            </div>
            
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError(null);
              }}
              placeholder={`Saisir "${produit.nom}"`}
              className={error ? "border-red-500" : ""}
              disabled={loading}
            />
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmText("");
              setError(null);
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmText !== produit.nom}
          >
            {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
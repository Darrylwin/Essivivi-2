"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2Icon, TagIcon } from "lucide-react";
import { toast } from "sonner";

interface CategorieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorie: any | null;
  onSuccess: () => void;
}

export function CategorieDialog({
  open,
  onOpenChange,
  categorie,
  onSuccess,
}: CategorieDialogProps) {
  const { createCategorie, updateCategorie } = useProducts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    actif: true,
  });
  const [errors, setErrors] = useState<{ nom?: string }>({});

  useEffect(() => {
    if (categorie && open) {
      setFormData({
        nom: categorie.nom || "",
        description: categorie.description || "",
        actif: categorie.actif ?? true,
      });
      setErrors({});
    } else if (open) {
      setFormData({
        nom: "",
        description: "",
        actif: true,
      });
      setErrors({});
    }
  }, [categorie, open]);

  const validateForm = () => {
    const newErrors: { nom?: string } = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      if (categorie) {
        await updateCategorie(categorie.id, {
          nom: formData.nom,
          description: formData.description || null,
          actif: formData.actif,
        });
      } else {
        await createCategorie({
          nom: formData.nom,
          description: formData.description || undefined,
          actif: formData.actif,
        });
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            <DialogTitle>
              {categorie ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {categorie
              ? "Modifiez les informations de la catégorie ci-dessous."
              : "Renseignez les informations pour créer une nouvelle catégorie."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nom">
                Nom de la catégorie *
              </Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Eau en sachet"
                className={errors.nom ? "border-red-500" : ""}
              />
              {errors.nom && (
                <p className="text-sm text-red-500">{errors.nom}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Nom unique qui décrit le type de produits
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">
                Description (optionnelle)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée de la catégorie..."
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Informations supplémentaires sur cette catégorie
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="actif">Catégorie active</Label>
                <p className="text-sm text-muted-foreground">
                  Les catégories inactives ne seront pas visibles dans le catalogue
                </p>
              </div>
              <Switch
                id="actif"
                checked={formData.actif}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, actif: checked }))}
              />
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {categorie ? "Mettre à jour" : "Créer la catégorie"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
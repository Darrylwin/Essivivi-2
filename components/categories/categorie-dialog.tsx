"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/lib/hooks/useCategories";
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
import {
  Loader2Icon,
  TagIcon,
  CheckIcon,
  AlertCircleIcon,
  PackageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import type { CategorieListItem, CategorieCreateRequest, CategorieUpdateRequest } from "@/lib/types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategorieListItem | null;
  onSuccess: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const { createCategorie, updateCategorie } = useCategories();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategorieCreateRequest>({
    nom: "",
    description: "",
    actif: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category && open) {
      setFormData({
        nom: category.nom || "",
        description: "",
        actif: category.actif,
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
  }, [category, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom.trim()) newErrors.nom = "Le nom de la catégorie est requis";
    else if (formData.nom.length < 2) newErrors.nom = "Le nom doit faire au moins 2 caractères";
    else if (formData.nom.length > 50) newErrors.nom = "Le nom ne doit pas dépasser 50 caractères";
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = "La description ne doit pas dépasser 500 caractères";
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
      if (category) {
        const updateData: CategorieUpdateRequest = {
          ...formData,
          description: formData.description || undefined,
        };
        await updateCategorie(category.id, updateData);
      } else {
        const createData: CategorieCreateRequest = {
          ...formData,
          description: formData.description || undefined,
        };
        await createCategorie(createData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <TagIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {category ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}
              </DialogTitle>
              <DialogDescription>
                {category
                  ? "Modifiez les informations de la catégorie ci-dessous."
                  : "Renseignez les informations pour créer une nouvelle catégorie."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                Nom de la catégorie
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Boissons, Snacks, Produits frais"
                  className={errors.nom ? "border-destructive pr-10" : "pr-10"}
                  autoFocus
                />
                {!errors.nom && formData.nom && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.nom && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.nom}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                2 à 50 caractères. Ce nom sera visible par les clients.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                Description
              </Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez cette catégorie (usage interne)"
                  className={errors.description ? "border-destructive min-h-[100px]" : "min-h-[100px]"}
                  rows={3}
                />
                {!errors.description && formData.description && (
                  <CheckIcon className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Max 500 caractères</span>
                <span>{(formData.description || "").length}/500</span>
              </div>
            </div>

            {/* Statut */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="actif" className="text-base">
                  Catégorie active
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.actif 
                    ? "Visible pour les clients et les agents"
                    : "Masquée dans le catalogue"}
                </p>
              </div>
              <Switch
                id="actif"
                checked={formData.actif}
                onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
              />
            </div>
          </div>
          
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              {formData.actif 
                ? "Cette catégorie sera visible pour les clients et les agents."
                : "Cette catégorie sera masquée dans le catalogue."}
            </AlertDescription>
          </Alert>
          
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
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  {category ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  {category ? "Mettre à jour" : "Créer la catégorie"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
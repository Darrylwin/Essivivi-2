"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/lib/hooks/useProducts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2Icon,
  PackageIcon,
  TagIcon,
  DollarSignIcon,
  ScaleIcon,
  CameraIcon,
  CheckIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import type { ProduitListItem, UniteVente, ProduitCreateRequest } from "@/lib/types";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProduitListItem | null;
  onSuccess: () => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) {
  const { createProduit, updateProduit } = useProducts();
  const { categories, loading: categoriesLoading, fetchCategories, error: categoriesError } = useCategories();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ProduitCreateRequest>>({
    nom: "",
    marque: "",
    volume: "",
    unite_vente: "bouteille" as UniteVente,
    prix_unitaire: 0,
    categorie_id: 0,
    actif: true,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les catégories quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      console.log('Opening product dialog, fetching categories...');
      fetchCategories().catch(error => {
        console.error("Erreur lors du chargement des catégories:", error);
        toast.error("Impossible de charger la liste des catégories");
      });
    }
  }, [open, fetchCategories]);

  useEffect(() => {
    if (product && open) {
      console.log('Setting form data for product:', product);
      
      // Trouver la catégorie correspondante
      let categorieId = 0;
      if (product.categorie && categories?.results) {
        const categorie = categories.results.find(cat => cat.id === product.categorie);
        if (categorie) {
          categorieId = categorie.id;
        } else {
          console.warn('Catégorie non trouvée:', product.categorie);
        }
      }
      
      setFormData({
        nom: product.nom || "",
        marque: product.marque || "",
        volume: product.volume || "",
        unite_vente: product.unite_vente || "bouteille",
        prix_unitaire: parseFloat(product.prix_unitaire) || 0,
        categorie_id: categorieId,
        actif: product.actif,
      });
      
      // Afficher la photo existante si disponible
      if ((product as any).photo_url) {
        setPhotoPreview((product as any).photo_url);
      } else if (product.photo_url) {
        // Fallback pour l'ancien champ photo (URL relative)
        setPhotoPreview(product.photo_url);
      } else {
        setPhotoPreview(null);
      }
      
      setErrors({});
    } else if (open) {
      console.log('Initializing new product form');
      // Initialiser avec la première catégorie si disponible
      const defaultCategorieId = categories?.results?.[0]?.id || 0;
      
      setFormData({
        nom: "",
        marque: "",
        volume: "",
        unite_vente: "bouteille",
        prix_unitaire: 0,
        categorie_id: defaultCategorieId,
        actif: true,
      });
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});
    }
  }, [product, open, categories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom?.trim()) newErrors.nom = "Le nom du produit est requis";
    else if (formData.nom.length < 2) newErrors.nom = "Le nom doit faire au moins 2 caractères";
    
    if (!formData.marque?.trim()) newErrors.marque = "La marque est requise";
    
    if (!formData.categorie_id || formData.categorie_id === 0) {
      newErrors.categorie_id = "La catégorie est requise";
    }
    
    if (!formData.prix_unitaire || formData.prix_unitaire <= 0) {
      newErrors.prix_unitaire = "Le prix doit être supérieur à 0";
    }
    
    if (!formData.unite_vente) {
      newErrors.unite_vente = "L'unité de vente est requise";
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
      const apiData: any = {
        nom: formData.nom?.trim(),
        marque: formData.marque?.trim(),
        volume: formData.volume?.trim() || undefined,
        unite_vente: formData.unite_vente,
        prix_unitaire: formData.prix_unitaire,
        categorie_id: formData.categorie_id,
        actif: formData.actif,
      };
      
      if (photo) {
        apiData.photo = photo;
      }
      
      if (product) {
        await updateProduit(product.id, apiData);
      } else {
        await createProduit(apiData as ProduitCreateRequest);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    // Pour supprimer une photo existante, vous pourriez vouloir passer un champ spécial
    // Par exemple, apiData.remove_photo = true dans handleSubmit
  };

  const unitOptions = [
    { value: "sachet", label: "Sachet" },
    { value: "bouteille", label: "Bouteille" },
    { value: "canette", label: "Canette" },
    { value: "pack", label: "Pack" },
  ];

  // Détermine ce qu'il faut afficher pour la photo
  const getPhotoDisplay = () => {
    if (photoPreview) {
      return (
        <div className="relative group">
          <div className="h-24 w-24 rounded-lg overflow-hidden border-2 border-primary">
            <img
              src={photoPreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemovePhoto}
              className="text-xs"
            >
              Supprimer
            </Button>
          </div>
        </div>
      );
    }
    
    if (product) {
      return (
        <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border">
          {product.nom ? (
            <span className="text-2xl font-bold">
              {product.nom.charAt(0).toUpperCase()}
            </span>
          ) : (
            <PackageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
      );
    }
    
    return (
      <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
        <CameraIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <PackageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {product ? "Modifier le produit" : "Créer un nouveau produit"}
              </DialogTitle>
              <DialogDescription>
                {product
                  ? "Modifiez les informations du produit ci-dessous."
                  : "Renseignez les informations pour créer un nouveau produit."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo */}
            <div className="md:col-span-2">
              <Label htmlFor="photo" className="block mb-2">
                Photo du produit
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {getPhotoDisplay()}
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="photo" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm">
                      <CameraIcon className="mr-2 h-4 w-4" />
                      {photoPreview ? "Changer la photo" : "Ajouter une photo"}
                    </Button>
                  </Label>
                  {photoPreview && product && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                    >
                      Supprimer la photo
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG ou WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                Nom du produit
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nom"
                  value={formData.nom || ""}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Eau minérale 1.5L"
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
            </div>

            {/* Marque */}
            <div className="space-y-2">
              <Label htmlFor="marque" className="flex items-center gap-2">
                Marque
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="marque"
                  value={formData.marque || ""}
                  onChange={(e) => setFormData({ ...formData, marque: e.target.value })}
                  placeholder="Ex: Cristaline, Coca-Cola"
                  className={errors.marque ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.marque && formData.marque && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.marque && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.marque}
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="categorie_id" className="flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Catégorie
                <span className="text-destructive">*</span>
              </Label>
              
              {categoriesLoading ? (
                <div className="flex items-center justify-center p-3 border rounded-md bg-muted/50">
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  Chargement des catégories...
                </div>
              ) : categoriesError ? (
                <div className="p-3 border border-destructive/20 rounded-md bg-destructive/10">
                  <p className="text-sm text-destructive">
                    Erreur: {categoriesError}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => fetchCategories()}
                  >
                    Réessayer
                  </Button>
                </div>
              ) : (
                <Select 
                  value={formData.categorie_id?.toString() || ""}
                  onValueChange={(value) => {
                    console.log('Category selected:', value);
                    setFormData({ ...formData, categorie_id: parseInt(value) });
                  }}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className={errors.categorie_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.results && categories.results.length > 0 ? (
                      categories.results.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nom} {!category.actif && "(inactive)"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled>
                        Aucune catégorie disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              
              {errors.categorie_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.categorie_id}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {categories?.results ? `${categories.results.length} catégories disponibles` : 'Chargement...'}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchCategories()}
                  disabled={categoriesLoading}
                >
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Unité de vente */}
            <div className="space-y-2">
              <Label htmlFor="unite_vente" className="flex items-center gap-2">
                Unité de vente
                <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.unite_vente}
                onValueChange={(value: UniteVente) => setFormData({ ...formData, unite_vente: value })}
              >
                <SelectTrigger className={errors.unite_vente ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner une unité" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unite_vente && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.unite_vente}
                </p>
              )}
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label htmlFor="volume" className="flex items-center gap-2">
                <ScaleIcon className="h-4 w-4" />
                Volume/Poids
              </Label>
              <div className="relative">
                <Input
                  id="volume"
                  value={formData.volume || ""}
                  onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  placeholder="Ex: 1.5L, 500ml, 250g"
                />
                {formData.volume && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Pour information seulement (non utilisé dans les calculs)
              </p>
            </div>

            {/* Prix unitaire */}
            <div className="space-y-2">
              <Label htmlFor="prix_unitaire" className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4" />
                Prix unitaire (FCFA)
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="prix_unitaire"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix_unitaire || ""}
                  onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 1.50"
                  className={errors.prix_unitaire ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.prix_unitaire && formData.prix_unitaire && formData.prix_unitaire > 0 && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.prix_unitaire && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.prix_unitaire}
                </p>
              )}
            </div>

            {/* Statut */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="actif" className="text-base">
                    Produit actif
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.actif 
                      ? "Disponible à la vente pour les clients"
                      : "Masqué dans le catalogue"}
                  </p>
                </div>
                <Switch
                  id="actif"
                  checked={formData.actif}
                  onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
                />
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              {formData.actif 
                ? "Ce produit sera visible et disponible à la vente pour les clients."
                : "Ce produit sera masqué dans le catalogue et ne sera pas disponible à la vente."}
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
                  {product ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  {product ? "Mettre à jour" : "Créer le produit"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
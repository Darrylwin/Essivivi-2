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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Loader2Icon, PackageIcon, UploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

interface ProduitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produit: any | null;
  categories: any[];
  onSuccess: () => void;
}

export function ProduitDialog({
  open,
  onOpenChange,
  produit,
  categories,
  onSuccess,
}: ProduitDialogProps) {
  const { createProduit, updateProduit } = useProducts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categorie_id: 0,
    nom: "",
    marque: "",
    volume: "",
    unite_vente: "sachet" as "sachet" | "bouteille" | "canette" | "pack",
    prix_unitaire: "",
    description: "",
    actif: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    categorie_id?: string;
    nom?: string;
    marque?: string;
    prix_unitaire?: string;
  }>({});

  useEffect(() => {
    if (produit && open) {
      setFormData({
        categorie_id: produit.categorie || produit.categorie_detail?.id || 0,
        nom: produit.nom || "",
        marque: produit.marque || "",
        volume: produit.volume || "",
        unite_vente: produit.unite_vente || "sachet",
        prix_unitaire: produit.prix_unitaire ? parseFloat(produit.prix_unitaire).toString() : "",
        description: "",
        actif: produit.actif ?? true,
      });
      setPhotoPreview(produit.photo || null);
      setPhotoFile(null);
      setErrors({});
    } else if (open) {
      setFormData({
        categorie_id: Array.isArray(categories) && categories.length > 0 ? categories[0].id : 0,
        nom: "",
        marque: "",
        volume: "",
        unite_vente: "sachet",
        prix_unitaire: "",
        description: "",
        actif: true,
      });
      setPhotoPreview(null);
      setPhotoFile(null);
      setErrors({});
    }
  }, [produit, open, categories]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.categorie_id || formData.categorie_id === 0) {
      newErrors.categorie_id = "La catégorie est requise";
    }
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }
    
    if (!formData.marque.trim()) {
      newErrors.marque = "La marque est requise";
    }
    
    if (!formData.prix_unitaire) {
      newErrors.prix_unitaire = "Le prix est requis";
    } else {
      const prix = parseFloat(formData.prix_unitaire);
      if (isNaN(prix) || prix <= 0) {
        newErrors.prix_unitaire = "Le prix doit être un nombre positif";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image");
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB");
        return;
      }
      
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const produitData = {
        categorie_id: formData.categorie_id,
        nom: formData.nom,
        marque: formData.marque,
        volume: formData.volume || null,
        unite_vente: formData.unite_vente,
        prix_unitaire: parseFloat(formData.prix_unitaire),
        actif: formData.actif,
        photo: photoFile,
      };
      
      if (produit) {
        await updateProduit(produit.id, produitData);
      } else {
        await createProduit(produitData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: string) => {
    // Enlever tout ce qui n'est pas numérique
    const numeric = value.replace(/[^0-9]/g, '');
    return numeric;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setFormData(prev => ({ ...prev, prix_unitaire: formatted }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            <DialogTitle>
              {produit ? "Modifier le produit" : "Créer un nouveau produit"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {produit
              ? "Modifiez les informations du produit ci-dessous."
              : "Renseignez les informations pour ajouter un nouveau produit au catalogue."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Photo */}
            <div className="space-y-4">
              <Label>Photo du produit</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {photoPreview ? (
                      <div className="relative">
                        <img
                          src={photoPreview}
                          alt="Aperçu"
                          className="h-48 w-48 rounded-lg object-cover border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                          onClick={handleRemovePhoto}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-48 w-48 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center">
                        <UploadIcon className="h-12 w-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Aucune photo
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Label
                        htmlFor="photo-upload"
                        className="cursor-pointer rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 text-sm"
                      >
                        {photoPreview ? "Changer" : "Ajouter une photo"}
                      </Label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemovePhoto}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      JPEG, PNG, max 5MB. Recommandé : 400x400px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Informations de base */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categorie_id">
                  Catégorie *
                </Label>
                <Select
                  value={formData.categorie_id.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categorie_id: parseInt(value) }))}
                >
                  <SelectTrigger className={errors.categorie_id ? "border-red-500" : ""}>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categories) && categories.map((categorie) => (
                      <SelectItem key={categorie.id} value={categorie.id.toString()}>
                        {categorie.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categorie_id && (
                  <p className="text-sm text-red-500">{errors.categorie_id}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Eau Vitale"
                    className={errors.nom ? "border-red-500" : ""}
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-500">{errors.nom}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="marque">
                    Marque *
                  </Label>
                  <Input
                    id="marque"
                    name="marque"
                    value={formData.marque}
                    onChange={(e) => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                    placeholder="Ex: Vitale"
                    className={errors.marque ? "border-red-500" : ""}
                  />
                  {errors.marque && (
                    <p className="text-sm text-red-500">{errors.marque}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">
                    Volume
                  </Label>
                  <Input
                    id="volume"
                    name="volume"
                    value={formData.volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                    placeholder="Ex: 500ml, 1.5L"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unite_vente">
                    Unité de vente
                  </Label>
                  <Select
                    value={formData.unite_vente}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unite_vente: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sachet">Sachet</SelectItem>
                      <SelectItem value="bouteille">Bouteille</SelectItem>
                      <SelectItem value="canette">Canette</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prix_unitaire">
                  Prix unitaire (FCFA) *
                </Label>
                <Input
                  id="prix_unitaire"
                  name="prix_unitaire"
                  value={formData.prix_unitaire}
                  onChange={handlePriceChange}
                  placeholder="Ex: 1500"
                  className={errors.prix_unitaire ? "border-red-500" : ""}
                />
                {errors.prix_unitaire && (
                  <p className="text-sm text-red-500">{errors.prix_unitaire}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Prix de vente standard en FCFA
                </p>
              </div>
            </div>
          </div>
          
          {/* Statut */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="actif">Produit actif</Label>
              <p className="text-sm text-muted-foreground">
                Les produits inactifs ne seront pas disponibles à la vente
              </p>
            </div>
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, actif: checked }))}
            />
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
              {produit ? "Mettre à jour" : "Créer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
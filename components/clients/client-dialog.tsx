"use client";

import { useState, useEffect } from "react";
import { useClients } from "@/lib/hooks/useClients";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2Icon,
  StoreIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CameraIcon,
  CheckIcon,
  BuildingIcon,
  PackageIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import type { ClientListItem, TypeClient, StatutClient, ClientCreateRequest } from "@/lib/types";

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientListItem | null;
  onSuccess: () => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientDialogProps) {
  const { createClient, updateClient } = useClients();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ClientCreateRequest>>({
    nom_point_vente: "",
    nom_responsable: "",
    telephone: "",
    email: "",
    adresse: "",
    latitude: undefined,
    longitude: undefined,
    type_client: "detaillant",
    mot_de_passe: "", // ← Ajouté
  });
  const [statut, setStatut] = useState<StatutClient>("actif");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false); // ← Pour afficher/cacher le mot de passe

  useEffect(() => {
    if (client && open) {
      setFormData({
        nom_point_vente: client.nom_point_vente || "",
        nom_responsable: client.nom_responsable || "",
        telephone: client.telephone || "",
        email: client.email || "",
        adresse: client.adresse || "",
        latitude: undefined,
        longitude: undefined,
        type_client: client.type_client,
        mot_de_passe: "", // ← Vide pour l'édition
      });
      setStatut(client.statut);
      setPhotoPreview(null);
      setErrors({});
    } else if (open) {
      setFormData({
        nom_point_vente: "",
        nom_responsable: "",
        telephone: "",
        email: "",
        adresse: "",
        latitude: undefined,
        longitude: undefined,
        type_client: "detaillant",
        mot_de_passe: "", // ← Vide par défaut
      });
      setStatut("actif");
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});
    }
  }, [client, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom_point_vente?.trim()) newErrors.nom_point_vente = "Le nom du point de vente est requis";
    if (!formData.nom_responsable?.trim()) newErrors.nom_responsable = "Le nom du responsable est requis";
    if (!formData.telephone?.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.email?.trim()) newErrors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.adresse?.trim()) newErrors.adresse = "L'adresse est requise";
    if (!formData.type_client) newErrors.type_client = "Le type de client est requis";
    
    // Validation du mot de passe seulement pour la création
    if (!client) {
      if (!formData.mot_de_passe?.trim()) newErrors.mot_de_passe = "Le mot de passe est requis";
      else if (formData.mot_de_passe.length < 6) newErrors.mot_de_passe = "Le mot de passe doit contenir au moins 6 caractères";
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
        nom_point_vente: formData.nom_point_vente?.trim(),
        nom_responsable: formData.nom_responsable?.trim(),
        telephone: formData.telephone?.trim(),
        email: formData.email?.trim(),
        adresse: formData.adresse?.trim(),
        type_client: formData.type_client,
      };
      
      // Gérer les coordonnées GPS
      if (formData.latitude !== undefined && formData.longitude !== undefined) {
        apiData.latitude = formData.latitude;
        apiData.longitude = formData.longitude;
      }
      
      // Gérer la photo
      if (photo) {
        apiData.photo_point_vente = photo;
      }
      
      if (client) {
        // Pour la mise à jour, inclure le statut
        apiData.statut = statut;
        // Ne pas inclure le mot de passe pour la mise à jour
        await updateClient(client.id, apiData);
      } else {
        // Pour la création, inclure le mot de passe
        apiData.mot_de_passe = formData.mot_de_passe; // ← Mot de passe saisi par l'utilisateur
        await createClient(apiData as ClientCreateRequest);
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

  const getTypeIcon = (type: TypeClient) => {
    switch (type) {
      case 'detaillant': return <StoreIcon className="h-4 w-4" />;
      case 'grossiste': return <PackageIcon className="h-4 w-4" />;
      case 'institution': return <BuildingIcon className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <StoreIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {client ? "Modifier le client" : "Ajouter un nouveau client"}
              </DialogTitle>
              <DialogDescription>
                {client
                  ? "Modifiez les informations du client ci-dessous."
                  : "Renseignez les informations pour ajouter un nouveau client."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo */}
            <div className="md:col-span-2">
              <Label htmlFor="photo" className="block mb-2">
                Photo du point de vente
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoPreview ? (
                    <div className="h-24 w-24 rounded-lg overflow-hidden border-2 border-primary">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border-2 border-dashed">
                      <CameraIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
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
                      {photo ? "Changer la photo" : "Ajouter une photo"}
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG ou WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Nom point de vente */}
            <div className="space-y-2">
              <Label htmlFor="nom_point_vente" className="flex items-center gap-2">
                Nom du point de vente
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nom_point_vente"
                  value={formData.nom_point_vente || ""}
                  onChange={(e) => setFormData({ ...formData, nom_point_vente: e.target.value })}
                  placeholder="Ex: Supermarché Paris Centre"
                  className={errors.nom_point_vente ? "border-destructive pr-10" : "pr-10"}
                  autoFocus
                />
                {!errors.nom_point_vente && formData.nom_point_vente && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.nom_point_vente && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.nom_point_vente}
                </p>
              )}
            </div>

            {/* Nom responsable */}
            <div className="space-y-2">
              <Label htmlFor="nom_responsable" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Nom du responsable
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nom_responsable"
                  value={formData.nom_responsable || ""}
                  onChange={(e) => setFormData({ ...formData, nom_responsable: e.target.value })}
                  placeholder="Ex: Jean Dupont"
                  className={errors.nom_responsable ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.nom_responsable && formData.nom_responsable && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.nom_responsable && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.nom_responsable}
                </p>
              )}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="telephone" className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Téléphone
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="telephone"
                  value={formData.telephone || ""}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                  className={errors.telephone ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.telephone && formData.telephone && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.telephone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.telephone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Email
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@exemple.com"
                  className={errors.email ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.email && formData.email && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe (uniquement pour la création) */}
            {!client && (
              <div className="space-y-2">
                <Label htmlFor="mot_de_passe" className="flex items-center gap-2">
                  Mot de passe temporaire
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="mot_de_passe"
                    type={showPassword ? "text" : "password"}
                    value={formData.mot_de_passe || ""}
                    onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                    placeholder="Saisir un mot de passe temporaire"
                    className={errors.mot_de_passe ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.mot_de_passe && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircleIcon className="h-3 w-3" />
                    {errors.mot_de_passe}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Le client devra changer ce mot de passe à sa première connexion.
                </p>
              </div>
            )}

            {/* Type client */}
            <div className="space-y-2">
              <Label htmlFor="type_client" className="flex items-center gap-2">
                Type de client
                <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.type_client} 
                onValueChange={(value: TypeClient) => setFormData({ ...formData, type_client: value })}
              >
                <SelectTrigger className={errors.type_client ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detaillant">
                    <div className="flex items-center gap-2">
                      <StoreIcon className="h-4 w-4" />
                      Détaillant
                    </div>
                  </SelectItem>
                  <SelectItem value="grossiste">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4" />
                      Grossiste
                    </div>
                  </SelectItem>
                  <SelectItem value="institution">
                    <div className="flex items-center gap-2">
                      <BuildingIcon className="h-4 w-4" />
                      Institution
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.type_client && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.type_client}
                </p>
              )}
            </div>

            {/* Statut (pour l'édition seulement) */}
            {client && (
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select value={statut} onValueChange={(value: StatutClient) => setStatut(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Adresse */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="adresse" className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Adresse complète
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="adresse"
                  value={formData.adresse || ""}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  placeholder="123 Rue du Commerce, 75001 Paris, France"
                  className={errors.adresse ? "border-destructive min-h-[100px]" : "min-h-[100px]"}
                  rows={3}
                />
                {!errors.adresse && formData.adresse && (
                  <CheckIcon className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.adresse && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.adresse}
                </p>
              )}
            </div>

            {/* Coordonnées GPS */}
            <div className="md:col-span-2">
              <Label className="block mb-2">
              Coordonnées GPS
              <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 relative">
                <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Latitude (ex: 48.8566)"
                className={errors.latitude ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.latitude && formData.latitude !== undefined && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.latitude && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.latitude}
                </p>
                )}
              </div>
              <div className="space-y-2 relative">
                <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Longitude (ex: 2.3522)"
                className={errors.longitude ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.longitude && formData.longitude !== undefined && (
                <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.longitude && (
                <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.longitude}
                </p>
                )}
              </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
              Pour la géolocalisation des livraisons. Les deux champs sont requis.
              </p>
            </div>
            </div>
          
          {client && (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Pour changer le mot de passe, utilisez la fonctionnalité dédiée dans le profil du client.
              </AlertDescription>
            </Alert>
          )}
          
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
                  {client ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  {client ? "Mettre à jour" : "Créer le client"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
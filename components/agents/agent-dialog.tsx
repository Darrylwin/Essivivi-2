"use client";

import { useState, useEffect } from "react";
import { useAgents } from "@/lib/hooks/useAgents";
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
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  BikeIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import type { Agent, AgentListItem, StatutAgent, AgentCreateRequest, AgentUpdateRequest } from "@/lib/types";

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentListItem | Agent | null;
  onSuccess: () => void;
}

export function AgentDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentDialogProps) {
  const { createAgent, updateAgent, patchAgent, tricycles } = useAgents();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AgentCreateRequest>>({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    date_naissance: "",
    adresse: "",
    tricycle_id: null,
    mot_de_passe: "",
  });
  const [statut, setStatut] = useState<StatutAgent>("actif");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false); // ← Pour afficher/cacher le mot de passe

  useEffect(() => {
    if (agent && open) {
      setFormData({
        nom: agent.nom || "",
        prenom: agent.prenom || "",
        telephone: agent.telephone || "",
        email: agent.email || "",
        date_naissance: agent.date_naissance || "",
        adresse: agent.adresse || "",
        tricycle_id: null,
        mot_de_passe: "", // ← Vide pour l'édition
      });
      if ('statut' in agent) {
        setStatut(agent.statut);
      }
      setPhotoPreview(null);
      setErrors({});
    } else if (open) {
      setFormData({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        date_naissance: "",
        adresse: "",
        tricycle_id: null,
        mot_de_passe: "",
      });
      setStatut("actif");
      setPhoto(null);
      setPhotoPreview(null);
      setErrors({});
    }
  }, [agent, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nom?.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom?.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.telephone?.trim()) newErrors.telephone = "Le téléphone est requis";
    if (!formData.email?.trim()) newErrors.email = "L'email est requis";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.date_naissance?.trim()) newErrors.date_naissance = "La date de naissance est requise";
    if (!formData.adresse?.trim()) newErrors.adresse = "L'adresse est requise";
    
    // Validation du mot de passe seulement pour la création
    if (!agent) {
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
      if (agent) {
        // Pour la mise à jour, on ne modifie pas le mot de passe ici
        // (prévoir une fonctionnalité séparée pour changer le mot de passe)
        const updateData: AgentUpdateRequest = {
          ...formData,
          statut,
          photo: photo || undefined,
        };
        await updateAgent(agent.id, updateData);
      } else {
        // Pour la création, inclure le mot de passe
        const createData: AgentCreateRequest = {
          ...formData as Required<AgentCreateRequest>,
          mot_de_passe: formData.mot_de_passe!, // ← Mot de passe saisi par l'utilisateur
          photo: photo || undefined,
        };
        await createAgent(createData);
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

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {agent ? "Modifier l'agent" : "Ajouter un nouvel agent"}
              </DialogTitle>
              <DialogDescription>
                {agent
                  ? "Modifiez les informations de l'agent ci-dessous."
                  : "Renseignez les informations pour ajouter un nouvel agent à l'équipe."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo */}
            <div className="md:col-span-2">
              <Label htmlFor="photo" className="block mb-2">
                Photo de profil
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photoPreview ? (
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
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

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom" className="flex items-center gap-2">
                Nom
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="nom"
                  value={formData.nom || ""}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Dupont"
                  className={errors.nom ? "border-destructive pr-10" : "pr-10"}
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

            {/* Prénom */}
            <div className="space-y-2">
              <Label htmlFor="prenom" className="flex items-center gap-2">
                Prénom
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="prenom"
                  value={formData.prenom || ""}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  placeholder="Jean"
                  className={errors.prenom ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.prenom && formData.prenom && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.prenom && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.prenom}
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
                  placeholder="jean.dupont@example.com"
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

            {/* Date de naissance */}
            <div className="space-y-2">
              <Label htmlFor="date_naissance" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date de naissance
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="date_naissance"
                  type="date"
                  value={formatDateForInput(formData.date_naissance || "")}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  className={errors.date_naissance ? "border-destructive pr-10" : "pr-10"}
                />
                {!errors.date_naissance && formData.date_naissance && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.date_naissance && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.date_naissance}
                </p>
              )}
            </div>

            {/* Mot de passe (uniquement pour la création) */}
            {!agent && (
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
                  L&apos;agent devra changer ce mot de passe à sa première connexion.
                </p>
              </div>
            )}

            {/* Statut (pour l'édition seulement) */}
            {agent && (
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select value={statut} onValueChange={(value: StatutAgent) => setStatut(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="inactif">Inactif</SelectItem>
                    <SelectItem value="en_tournee">En tournée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tricycle */}
            <div className="space-y-2">
              <Label htmlFor="tricycle_id" className="flex items-center gap-2">
                <BikeIcon className="h-4 w-4" />
                Tricycle assigné
              </Label>
              <Select 
                value={formData.tricycle_id?.toString() || "none"} 
                onValueChange={(value) => setFormData({ ...formData, tricycle_id: value === "none" ? null : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un tricycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun tricycle</SelectItem>
                  {tricycles?.map((tricycle) => (
                    <SelectItem key={tricycle.id} value={tricycle.id.toString()}>
                      {tricycle.plaque_immatriculation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  placeholder="123 Rue de la Livraison, 75001 Paris, France"
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
          </div>
          
          {agent && (
            <div className="rounded-lg border p-4 space-y-3">
              <h4 className="font-medium">Informations supplémentaires</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">ID</div>
                  <div className="font-mono font-medium">#{agent.id}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Date d&apos;inscription</div>
                  <div className="font-medium">
                    {new Date(agent.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <Alert className="mt-3">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  Pour changer le mot de passe, utilisez la fonctionnalité dédiée dans le profil de l&apos;agent.
                </AlertDescription>
              </Alert>
            </div>
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
                  {agent ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  {agent ? "Mettre à jour" : "Créer l'agent"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
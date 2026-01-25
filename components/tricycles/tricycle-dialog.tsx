"use client";

import { useState, useEffect } from "react";
import { useUsers } from "@/lib/hooks/useUsers";
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
import { Loader2Icon, BikeIcon, AlertCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TricycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tricycle: any | null;
  onSuccess: () => void;
}

export function TricycleDialog({
  open,
  onOpenChange,
  tricycle,
  onSuccess,
}: TricycleDialogProps) {
  const { createTricycle, updateTricycle } = useUsers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    plaque_immatriculation: "",
  });
  const [errors, setErrors] = useState<{ plaque_immatriculation?: string }>({});

  useEffect(() => {
    if (tricycle && open) {
      setFormData({
        plaque_immatriculation: tricycle.plaque_immatriculation || "",
      });
      setErrors({});
    } else if (open) {
      setFormData({
        plaque_immatriculation: "",
      });
      setErrors({});
    }
  }, [tricycle, open]);

  const validateForm = () => {
    const newErrors: { plaque_immatriculation?: string } = {};
    
    if (!formData.plaque_immatriculation.trim()) {
      newErrors.plaque_immatriculation = "La plaque d'immatriculation est requise";
    } else if (formData.plaque_immatriculation.length < 3) {
      newErrors.plaque_immatriculation = "La plaque est trop courte";
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
      if (tricycle) {
        await updateTricycle(tricycle.id, formData.plaque_immatriculation);
      } else {
        await createTricycle(formData.plaque_immatriculation);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const formatPlaque = (value: string) => {
    // Formatage automatique de la plaque (ex: AB123CD)
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Si la plaque est assez longue, on peut ajouter un séparateur
    if (formatted.length > 3) {
      formatted = formatted.substring(0, 2) + '-' + formatted.substring(2);
    }
    if (formatted.length > 6) {
      formatted = formatted.substring(0, 6) + '-' + formatted.substring(6);
    }
    
    return formatted;
  };

  const handlePlaqueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlaque(e.target.value);
    setFormData(prev => ({ ...prev, plaque_immatriculation: formatted }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <BikeIcon className="h-5 w-5" />
            <DialogTitle>
              {tricycle ? "Modifier le tricycle" : "Ajouter un nouveau tricycle"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {tricycle
              ? "Modifiez les informations du tricycle ci-dessous."
              : "Renseignez les informations pour ajouter un nouveau tricycle à la flotte."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaque_immatriculation">
                Plaque d&apos;immatriculation *
              </Label>
              <Input
                id="plaque_immatriculation"
                name="plaque_immatriculation"
                value={formData.plaque_immatriculation}
                onChange={handlePlaqueChange}
                placeholder="Ex: AB-123-CD"
                className={errors.plaque_immatriculation ? "border-red-500" : ""}
                maxLength={20}
              />
              {errors.plaque_immatriculation && (
                <p className="text-sm text-red-500">{errors.plaque_immatriculation}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Format recommandé : Lettres et chiffres (ex: AB123CD)
              </p>
            </div>

            {tricycle && (
              <div className="space-y-2">
                <Label>Informations supplémentaires</Label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">ID</div>
                    <div className="font-medium">#{tricycle.id}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Créé le</div>
                    <div className="font-medium">
                      {new Date(tricycle.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              {tricycle ? "Mettre à jour" : "Créer le tricycle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
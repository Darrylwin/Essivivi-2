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
import { Loader2Icon, BikeIcon, CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Tricycle } from "@/lib/types";

interface TricycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tricycle: Tricycle | null;
  onSuccess: () => void;
}

export function TricycleDialog({
  open,
  onOpenChange,
  tricycle,
  onSuccess,
}: TricycleDialogProps) {
  const { createTricycle, updateTricycle, tricycles } = useAgents();
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

  const validateForm = (): boolean => {
    const newErrors: { plaque_immatriculation?: string } = {};
    
    if (!formData.plaque_immatriculation.trim()) {
      newErrors.plaque_immatriculation = "La plaque d'immatriculation est requise";
    } else if (formData.plaque_immatriculation.length < 3) {
      newErrors.plaque_immatriculation = "La plaque est trop courte";
    } else {
      // Vérifier si la plaque existe déjà (sauf pour l'édition du même tricycle)
      const existingPlaque = tricycles?.some((t) => 
        t.plaque_immatriculation.toLowerCase() === formData.plaque_immatriculation.toLowerCase() &&
        (!tricycle || t.id !== tricycle.id)
      );
      if (existingPlaque) {
        newErrors.plaque_immatriculation = "Cette plaque existe déjà";
      }
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
        await updateTricycle(tricycle.id, {
          plaque_immatriculation: formData.plaque_immatriculation.trim().toUpperCase(),
        });
      } else {
        await createTricycle({
          plaque_immatriculation: formData.plaque_immatriculation.trim().toUpperCase(),
        });
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

  const formatPlaque = (value: string): string => {
    // Formatage automatique de la plaque (ex: AB-123-CD)
    let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Ajouter des séparateurs pour une meilleure lisibilité
    if (formatted.length > 2) {
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
            <div className="p-2 rounded-full bg-primary/10">
              <BikeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {tricycle ? "Modifier le tricycle" : "Ajouter un nouveau tricycle"}
              </DialogTitle>
              <DialogDescription>
                {tricycle
                  ? "Modifiez les informations du tricycle ci-dessous."
                  : "Renseignez les informations pour ajouter un nouveau tricycle à la flotte."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaque_immatriculation" className="flex items-center gap-2">
                Plaque d&apos;immatriculation
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="plaque_immatriculation"
                  name="plaque_immatriculation"
                  value={formData.plaque_immatriculation}
                  onChange={handlePlaqueChange}
                  placeholder="Ex: AB-123-CD"
                  className={errors.plaque_immatriculation ? "border-destructive pr-10" : "pr-10"}
                  maxLength={20}
                  autoFocus
                />
                {!errors.plaque_immatriculation && formData.plaque_immatriculation && (
                  <CheckIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.plaque_immatriculation && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-3 w-3" />
                  {errors.plaque_immatriculation}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Format recommandé : Lettres et chiffres (ex: AB-123-CD)
              </p>
            </div>

          </div>
          
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              La plaque d&apos;immatriculation doit être unique et sera utilisée pour identifier le tricycle.
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
                  {tricycle ? "Mise à jour..." : "Création..."}
                </>
              ) : (
                <>
                  {tricycle ? "Mettre à jour" : "Créer le tricycle"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
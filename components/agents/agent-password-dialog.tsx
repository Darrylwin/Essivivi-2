/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUsers } from "@/lib/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2Icon, KeyIcon } from "lucide-react";
import { toast } from "sonner";

const passwordSchema = z.object({
  nouveau_mot_de_passe: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmation: z.string().min(6, "La confirmation est requise"),
}).refine((data) => data.nouveau_mot_de_passe === data.confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmation"],
});

interface AgentPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any | null;
  onSuccess: () => void;
}

export function AgentPasswordDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentPasswordDialogProps) {
  const { changeAgentPassword } = useUsers();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      nouveau_mot_de_passe: "",
      confirmation: "",
    },
  });

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("nouveau_mot_de_passe", password);
    form.setValue("confirmation", password);
  };

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!agent) return;
    
    setLoading(true);
    try {
      await changeAgentPassword(agent.id, {
        nouveau_mot_de_passe: values.nouveau_mot_de_passe,
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </div>
          <DialogDescription>
            Définissez un nouveau mot de passe pour {agent.prenom} {agent.nom}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRandomPassword}
                >
                  Générer un mot de passe sécurisé
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="nouveau_mot_de_passe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Saisir le nouveau mot de passe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Confirmer le mot de passe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm font-medium">Recommandations :</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                <li>Minimum 6 caractères</li>
                <li>Mélange de lettres majuscules et minuscules</li>
                <li>Au moins un chiffre</li>
                <li>Caractères spéciaux recommandés</li>
              </ul>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                Changer le mot de passe
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
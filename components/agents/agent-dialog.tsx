"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label"; // Ajoutez cette importation

const agentSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  email: z.string().email("Email invalide"),
  date_naissance: z.date({
    required_error: "La date de naissance est requise",
  }),
  adresse: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  tricycle_id: z.number().nullable().optional(),
  mot_de_passe: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any | null;
  tricycles: any[];
  onSuccess: () => void;
}

export function AgentDialog({
  open,
  onOpenChange,
  agent,
  tricycles,
  onSuccess,
}: AgentDialogProps) {
  const { createAgent, updateAgent } = useUsers();
  const [loading, setLoading] = useState(false);
  const [generatePassword, setGeneratePassword] = useState(false);

  const form = useForm<z.infer<typeof agentSchema>>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      email: "",
      date_naissance: undefined,
      adresse: "",
      tricycle_id: null,
      mot_de_passe: "",
    },
  });

  useEffect(() => {
    if (agent && open) {
      form.reset({
        nom: agent.nom,
        prenom: agent.prenom,
        telephone: agent.telephone,
        email: agent.email,
        date_naissance: new Date(agent.date_naissance),
        adresse: agent.adresse,
        tricycle_id: agent.tricycle?.id || null,
        mot_de_passe: "",
      });
      setGeneratePassword(false);
    } else if (open) {
      form.reset({
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        date_naissance: undefined,
        adresse: "",
        tricycle_id: null,
        mot_de_passe: "",
      });
      setGeneratePassword(true);
    }
  }, [agent, open, form]);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue("mot_de_passe", password);
  };

  const onSubmit = async (values: z.infer<typeof agentSchema>) => {
    setLoading(true);
    try {
      if (agent) {
        // Mise à jour
        const updateData: any = {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          email: values.email,
          date_naissance: format(values.date_naissance, "yyyy-MM-dd"),
          adresse: values.adresse,
        };
        
        if (values.tricycle_id !== undefined) {
          updateData.tricycle_id = values.tricycle_id;
        }
        
        await updateAgent(agent.id, updateData);
      } else {
        // Création
        const createData: any = {
          nom: values.nom,
          prenom: values.prenom,
          telephone: values.telephone,
          email: values.email,
          date_naissance: format(values.date_naissance, "yyyy-MM-dd"),
          adresse: values.adresse,
        };
        
        if (values.tricycle_id) {
          createData.tricycle_id = values.tricycle_id;
        }
        
        if (values.mot_de_passe) {
          createData.mot_de_passe = values.mot_de_passe;
        }
        
        await createAgent(createData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agent ? "Modifier l'agent" : "Créer un nouvel agent"}
          </DialogTitle>
          <DialogDescription>
            {agent
              ? "Modifiez les informations de l'agent ci-dessous."
              : "Remplissez les informations pour créer un nouvel agent."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prenom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+22912345678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="john@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="date_naissance"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date de naissance</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1960}
                        toYear={new Date().getFullYear() - 18}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="123 Rue des Agents, Cotonou"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tricycle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tricycle assigné</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : parseInt(value))
                    }
                    value={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un tricycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucun tricycle</SelectItem>
                      {Array.isArray(tricycles) && tricycles.map((tricycle) => (
                        <SelectItem key={tricycle.id} value={tricycle.id.toString()}>
                          {tricycle.plaque_immatriculation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!agent && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Utilisez Label au lieu de FormLabel ici */}
                    <Label htmlFor="mot-de-passe">Mot de passe</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateRandomPassword}
                    >
                      Générer un mot de passe
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="mot_de_passe"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Laisser vide pour générer automatiquement"
                            id="mot-de-passe"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    {generatePassword
                      ? "Un mot de passe sera généré automatiquement si ce champ est vide."
                      : "Conservez le mot de passe généré, il ne sera pas affiché à nouveau."}
                  </div>
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                {agent ? "Mettre à jour" : "Créer l'agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
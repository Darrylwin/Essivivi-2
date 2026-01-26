/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrders } from "@/lib/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  EditIcon,
  Trash2Icon,
  TruckIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PackageIcon,
  DollarSignIcon,
  PhoneIcon,
  HashIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { CommandeMap } from "@/components/orders/order-map";
import { toast } from "sonner";

export default function CommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedCommande, loadCommande, deleteCommande, isLoading } = useOrders();
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadCommande(parseInt(params.id as string));
    }
  }, [params.id, loadCommande]);

  const handleDelete = async () => {
    if (!selectedCommande) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteCommande(selectedCommande.id);
      toast.success("Commande supprimée avec succès");
      router.push("/orders");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!selectedCommande) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircleIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Commande non trouvée</h3>
        <p className="text-muted-foreground text-center mb-4">
          La commande demandée n&apos;existe pas ou a été supprimée.
        </p>
        <Button onClick={() => router.push("/orders")}>
          Retour aux commandes
        </Button>
      </div>
    );
  }

  const getStatusBadge = (statut: string) => {
    const variants = {
      en_attente: "secondary",
      acceptee: "outline",
      en_cours: "default",
      livree: "success",
      annulee: "destructive",
    } as const;

    return (
      <Badge variant={variants[statut as keyof typeof variants] as any}>
        {statut}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/orders")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Commande #{selectedCommande.id}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(selectedCommande.statut)}
                <span className="text-sm text-muted-foreground">
                  Créée le {formatDate(selectedCommande.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedCommande.statut === 'en_attente' && (
              <Button variant="outline" size="sm">
                <EditIcon className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2Icon className="mr-2 h-4 w-4" />
              )}
              Supprimer
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Informations */}
          <div className="md:col-span-2 space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HashIcon className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Date de création
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(selectedCommande.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Date de modification
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{formatDate(selectedCommande.updated_at)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Quantité totale
                    </div>
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4" />
                      <span className="font-bold">{selectedCommande.quantite_totale} unités</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Montant total
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
                        {parseFloat(selectedCommande.montant_total).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Point de vente
                      </div>
                      <div className="font-medium text-lg">
                        {selectedCommande.client_nom}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Code: {selectedCommande.client_code}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Responsable
                      </div>
                      <div className="font-medium">
                        {selectedCommande.client_responsable}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Téléphone
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4" />
                        <span>{selectedCommande.client_telephone}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Localisation
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        <span className="font-mono text-sm">
                          {selectedCommande.client_latitude}, {selectedCommande.client_longitude}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent */}
            {selectedCommande.agent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Agent assigné
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Nom complet
                        </div>
                        <div className="font-medium">
                          {selectedCommande.agent_nom_complet}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Numéro d&apos;identification
                        </div>
                        <div className="font-mono">
                          {selectedCommande.agent_numero}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          Téléphone
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{selectedCommande.agent_telephone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Produits commandés */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Produits commandés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedCommande.lignes.map((ligne) => (
                    <div
                      key={ligne.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <PackageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {ligne.produit_detail?.nom || `Produit #${ligne.produit}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {ligne.quantite} × {parseFloat(ligne.prix_unitaire).toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        {parseFloat(ligne.montant).toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5" />
                  Localisation de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Coordonnées GPS
                    </div>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      {selectedCommande.latitude_livraison}, {selectedCommande.longitude_livraison}
                    </div>
                  </div>
                  
                  {selectedCommande.distance_client_livraison && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Distance depuis le client
                      </div>
                      <div className="font-medium">
                        {selectedCommande.distance_client_livraison.toLocaleString('fr-FR')} mètres
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <CommandeMap
                  commandes={[selectedCommande]}
                  height="300px"
                  zoom={15}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
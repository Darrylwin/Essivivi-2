"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrders } from "@/lib/hooks/useOrders";
import { useToursDeliveries } from "@/lib/hooks/";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeftIcon,
  MapPinIcon,
  UserIcon,
  PackageIcon,
  DollarSignIcon,
  TruckIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  BikeIcon,
  NavigationIcon,
} from "lucide-react";
import { toast } from "sonner";
import { OrderTrackingMap } from "@/components/orders/order-tracking-map";
import { DeliveryList } from "@/components/deliveries/delivery-list";
import { CreateDeliveryDialog } from "@/components/deliveries/create-delivery-dialog";
import type { StatutCommande } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);
  
  const { commandeDetails, loading, error, fetchCommandeDetails, clearError } = useOrders();
  const { livraisons, loading: deliveriesLoading, fetchLivraisonsByCommande } = useToursDeliveries();
  
  const [createDeliveryOpen, setCreateDeliveryOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadData = async () => {
    try {
      await fetchCommandeDetails(orderId);
      await fetchLivraisonsByCommande(orderId);
    } catch (err) {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
      toast.success("Données actualisées");
    } catch (err) {
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeliveryCreated = () => {
    setCreateDeliveryOpen(false);
    loadData();
    toast.success("Livraison créée avec succès");
  };

  const getStatusBadge = (statut: StatutCommande) => {
    switch (statut) {
      case 'en_attente':
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <ClockIcon className="mr-1 h-3 w-3" />
            En attente
          </Badge>
        );
      case 'acceptee':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Acceptée
          </Badge>
        );
      case 'en_cours':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <TruckIcon className="mr-1 h-3 w-3" />
            En cours
          </Badge>
        );
      case 'livree':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Livrée
          </Badge>
        );
      case 'annulee':
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            Annulée
          </Badge>
        );
      default:
        return <Badge variant="outline">{statut}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            Impossible de charger les détails de la commande.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => { clearError(); loadData(); }}>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !commandeDetails) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (!commandeDetails) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const safeDeliveries = livraisons?.results && Array.isArray(livraisons.results) ? livraisons.results : [];
  const totalDeliveries = safeDeliveries.length;
  const completedDeliveries = safeDeliveries.filter(d => d.statut === 'livree').length;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  Commande #{commandeDetails.id}
                </h1>
                {getStatusBadge(commandeDetails.statut)}
              </div>
              <p className="text-muted-foreground">
                Créée le {formatDate(commandeDetails.created_at)}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCwIcon className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commandeDetails.quantite_totale}</div>
            <p className="text-xs text-muted-foreground">
              Quantité totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {parseFloat(commandeDetails.montant_total).toLocaleString('fr-FR', {
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground">FCFA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deliveriesLoading ? <Skeleton className="h-8 w-16" /> : totalDeliveries}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedDeliveries} terminée(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDeliveries > 0 ? Math.round((completedDeliveries / totalDeliveries) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Livraisons complétées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Info Cards */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium">{commandeDetails.client.nom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Code Client</p>
                  <p className="font-mono font-medium">{commandeDetails.client.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{commandeDetails.client.telephone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{commandeDetails.client.email || "Non renseigné"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Adresse de livraison</p>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{commandeDetails.adresse_livraison}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {commandeDetails.latitude_livraison.toFixed(6)}, {commandeDetails.longitude_livraison.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Info */}
          {commandeDetails.agent ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Agent Assigné
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom</p>
                    <p className="font-medium">
                      {commandeDetails.agent.prenom} {commandeDetails.agent.nom}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numéro ID</p>
                    <p className="font-mono font-medium">{commandeDetails.agent.numero_identification}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{commandeDetails.agent.telephone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tricycle</p>
                    <div className="flex items-center gap-2">
                      <BikeIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{commandeDetails.agent.tricycle || "Non assigné"}</p>
                    </div>
                  </div>
                </div>
                
                {commandeDetails.agent.derniere_position && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <NavigationIcon className="h-4 w-4" />
                      Position actuelle
                    </p>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-mono text-xs">
                        Lat: {commandeDetails.agent.derniere_position.latitude.toFixed(6)}, 
                        Lng: {commandeDetails.agent.derniere_position.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mise à jour: {new Date(commandeDetails.agent.derniere_position.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Cette commande n&apos;est pas encore assignée à un agent.
              </AlertDescription>
            </Alert>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Articles de la commande
              </CardTitle>
              <CardDescription>
                {commandeDetails.articles.length} article(s) dans cette commande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commandeDetails.articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{article.produit_nom}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {article.produit_code}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Qté: {article.quantite}</p>
                      <p className="text-sm font-semibold text-green-600">
                        {parseFloat(article.prix_unitaire).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {parseFloat(commandeDetails.montant_total).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map & Deliveries */}
        <div className="space-y-6">
          {/* Tracking Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinIcon className="h-5 w-5" />
                Suivi en temps réel
              </CardTitle>
              <CardDescription>
                Position de l&apos;agent et point de livraison
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <OrderTrackingMap
                deliveryLocation={{
                  lat: commandeDetails.latitude_livraison,
                  lng: commandeDetails.longitude_livraison,
                }}
                agentLocation={
                  commandeDetails.agent?.derniere_position
                    ? {
                        lat: commandeDetails.agent.derniere_position.latitude,
                        lng: commandeDetails.agent.derniere_position.longitude,
                      }
                    : undefined
                }
                orderId={commandeDetails.id}
              />
            </CardContent>
          </Card>

          {/* Deliveries Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Livraisons
                  </CardTitle>
                  <CardDescription>
                    Historique des livraisons pour cette commande
                  </CardDescription>
                </div>
                {commandeDetails.statut !== 'livree' && commandeDetails.statut !== 'annulee' && (
                  <Button
                    size="sm"
                    onClick={() => setCreateDeliveryOpen(true)}
                    disabled={!commandeDetails.agent}
                  >
                    Nouvelle livraison
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DeliveryList
                deliveries={safeDeliveries}
                loading={deliveriesLoading}
                onRefresh={() => fetchLivraisonsByCommande(orderId)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateDeliveryDialog
        open={createDeliveryOpen}
        onOpenChange={setCreateDeliveryOpen}
        orderId={commandeDetails.id}
        onSuccess={handleDeliveryCreated}
      />
    </div>
  );
}
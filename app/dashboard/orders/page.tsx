"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToursDeliveries } from "@/lib/hooks/useToursDeliveries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SearchIcon,
  RefreshCwIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AlertCircleIcon,
  FilterIcon,
} from "lucide-react";
import { toast } from "sonner";
import { DeliveryTable } from "@/components/deliveries/delivery-table";
import { DeliveryDetailDialog } from "@/components/deliveries/delivery-detail-dialog";
import type { LivraisonListItem, StatutLivraison } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DeliveriesPage() {
  const router = useRouter();
  const {
    livraisons,
    deliveriesLoading: loading,
    deliveriesError: error,
    fetchLivraisons,
    clearErrors,
  } = useToursDeliveries();

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<LivraisonListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatutLivraison | "all">("all");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchLivraisons();
    } catch (err) {
      toast.error("Erreur lors du chargement des livraisons");
    }
  };

  const handleViewDetails = (delivery: LivraisonListItem) => {
    setSelectedDelivery(delivery);
    setDetailDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDetailDialogOpen(false);
    fetchData();
  };

  const safeDeliveries = livraisons?.results && Array.isArray(livraisons.results) ? livraisons.results : [];
  
  const filteredDeliveries = safeDeliveries.filter((delivery) => {
    const matchesSearch = searchQuery === "" || 
      delivery.client_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.client_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.agent_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.agent_numero.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || delivery.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const enAttenteCount = safeDeliveries.filter(d => d.statut === 'en_attente').length;
  const valideeCount = safeDeliveries.filter(d => d.statut === 'validee').length;
  const livreeCount = safeDeliveries.filter(d => d.statut === 'livree').length;
  const annuleeCount = safeDeliveries.filter(d => d.statut === 'annulee').length;

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
            Impossible de charger les livraisons. Vérifiez votre connexion.
          </p>
          <Button onClick={() => { clearErrors(); fetchData(); }}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TruckIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Livraisons</h1>
              <p className="text-muted-foreground">
                Suivez toutes les livraisons effectuées
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <ClockIcon className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : enAttenteCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Non commencées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validées</CardTitle>
              <TruckIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : valideeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                En cours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : livreeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Terminées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annulées</CardTitle>
              <XCircleIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : annuleeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Non effectuées
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Livraisons</CardTitle>
              <CardDescription>
                Liste de toutes les livraisons
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par client, agent, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatutLivraison | "all")}>
                  <SelectTrigger className="w-[180px]">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="en_attente">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-orange-500" />
                        En attente
                      </div>
                    </SelectItem>
                    <SelectItem value="validee">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4 text-blue-500" />
                        Validée
                      </div>
                    </SelectItem>
                    <SelectItem value="livree">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        Livrée
                      </div>
                    </SelectItem>
                    <SelectItem value="annulee">
                      <div className="flex items-center gap-2">
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        Annulée
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredDeliveries.length} livraison(s) trouvée(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Total: {safeDeliveries.length}
                </Badge>
              </div>
            </div>
          </div>

          {loading && !livraisons ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredDeliveries.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <TruckIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune livraison trouvée</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Aucune livraison ne correspond à vos critères de recherche."
                      : "Aucune livraison n'a encore été effectuée."}
                  </p>
                  {searchQuery || statusFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Effacer les filtres
                    </Button>
                  ) : null}
                </div>
              ) : (
                <DeliveryTable
                  deliveries={filteredDeliveries}
                  loading={loading}
                  onViewDetails={handleViewDetails}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeliveryDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        delivery={selectedDelivery}
        onClose={handleDialogClose}
      />
    </div>
  );
}
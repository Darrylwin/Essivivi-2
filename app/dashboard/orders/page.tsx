"use client";

import { useState, useEffect } from "react";
import { OrderTable } from "@/components/orders/order-table";
import { OrderAssignDialog } from "@/components/orders/order-assign-dialog";
import { OrderDeleteDialog } from "@/components/orders/order-delete-dialog";
import { useOrders } from "@/lib/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  SearchIcon,
  RefreshCwIcon,
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  AlertCircleIcon,
  FilterIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CommandeListItem, StatutCommande } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  const {
    commandes,
    loading,
    error,
    fetchCommandes,
    clearError,
  } = useOrders();

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CommandeListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatutCommande | "all">("all");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchCommandes();
      toast.success("Liste des commandes actualisée");
    } catch (err) {
      toast.error("Erreur lors du chargement des commandes");
    }
  };

  const handleAssign = (orderItem: CommandeListItem) => {
    setSelectedOrder(orderItem);
    setAssignDialogOpen(true);
  };

  const handleDelete = (orderItem: CommandeListItem) => {
    setSelectedOrder(orderItem);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (orderItem: CommandeListItem) => {
    router.push(`/dashboard/orders/${orderItem.id}`);
  };

  const handleOrderAssigned = () => {
    setAssignDialogOpen(false);
    fetchData();
    toast.success("Commande assignée avec succès");
  };

  const handleOrderDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Commande supprimée avec succès");
  };

  const safeOrders = commandes?.results && Array.isArray(commandes.results) ? commandes.results : [];
  
  const filteredOrders = safeOrders.filter((orderItem) => {
    const matchesSearch = searchQuery === "" || 
      orderItem.client_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderItem.client_nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderItem.agent_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderItem.agent_numero?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || orderItem.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const enAttenteCount = safeOrders.filter(o => o.statut === 'en_attente').length;
  const accepteeCount = safeOrders.filter(o => o.statut === 'acceptee').length;
  const enCoursCount = safeOrders.filter(o => o.statut === 'en_cours').length;
  const livreeCount = safeOrders.filter(o => o.statut === 'livree').length;

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
            Impossible de charger les commandes. Vérifiez votre connexion.
          </p>
          <Button onClick={() => { clearError(); fetchData(); }}>
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
              <PackageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Commandes</h1>
              <p className="text-muted-foreground">
                Suivez et gérez toutes les commandes clients
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
                Non assignées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : accepteeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Assignées aux agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <TruckIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : enCoursCount}
              </div>
              <p className="text-xs text-muted-foreground">
                En livraison
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Commandes</CardTitle>
              <CardDescription>
                Liste de toutes les commandes
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
                    placeholder="Rechercher par client, code, agent..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: StatutCommande | "all") => setStatusFilter(value)}>
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
                    <SelectItem value="acceptee">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                        Acceptée
                      </div>
                    </SelectItem>
                    <SelectItem value="en_cours">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4 text-purple-500" />
                        En cours
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
                  `${filteredOrders.length} commande(s) trouvée(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Total: {safeOrders.length}
                </Badge>
              </div>
            </div>
          </div>

          {loading && !commandes ? (
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
              {filteredOrders.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <PackageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Aucune commande ne correspond à vos critères de recherche."
                      : "Aucune commande n'a encore été passée."}
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
                <OrderTable
                  orders={filteredOrders}
                  loading={loading}
                  onAssign={handleAssign}
                  onDelete={handleDelete}
                  onViewDetails={handleViewDetails}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OrderAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        order={selectedOrder}
        onSuccess={handleOrderAssigned}
      />

      <OrderDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        order={selectedOrder}
        onSuccess={handleOrderDeleted}
      />
    </div>
  );
}
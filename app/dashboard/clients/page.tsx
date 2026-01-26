"use client";

import { useState, useEffect } from "react";
import { ClientTable } from "@/components/clients/client-table";
import { ClientDialog } from "@/components/clients/client-dialog";
import { ClientDeleteDialog } from "@/components/clients/client-delete-dialog";
import { useClients } from "@/lib/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  UsersIcon,
  StoreIcon,
  BuildingIcon,
  PackageIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  FilterIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { ClientListItem, TypeClient, StatutClient } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientGrid } from "@/components/clients/client-grid";

export default function ClientsPage() {
  const {
    clients,
    client,
    loading,
    error,
    fetchClients,
    clearError,
  } = useClients();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [typeFilter, setTypeFilter] = useState<TypeClient | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatutClient | "all">("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchClients();
      toast.success("Liste des clients actualisée");
    } catch (error) {
      toast.error("Erreur lors du chargement des clients");
    }
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setDialogOpen(true);
  };

  const handleEdit = (clientItem: ClientListItem) => {
    setSelectedClient(clientItem);
    setDialogOpen(true);
  };

  const handleView = (clientItem: ClientListItem) => {
    setSelectedClient(clientItem);
    setDialogOpen(true);
  };

  const handleDelete = (clientItem: ClientListItem) => {
    setSelectedClient(clientItem);
    setDeleteDialogOpen(true);
  };

  const handleClientCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Client créé avec succès");
  };

  const handleClientUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Client mis à jour avec succès");
  };

  const handleClientDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Client supprimé avec succès");
  };

  // S'assurer que clients.results est toujours un tableau
  const safeClients = clients?.results && Array.isArray(clients.results) ? clients.results : [];
  
  // Filtrer les clients
  const filteredClients = safeClients.filter((clientItem) => {
    // Filtre de recherche
    const matchesSearch = searchQuery === "" || 
      clientItem.nom_point_vente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientItem.nom_responsable.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientItem.code_client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientItem.telephone.includes(searchQuery) ||
      clientItem.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par type
    const matchesType = typeFilter === "all" || clientItem.type_client === typeFilter;
    
    // Filtre par statut
    const matchesStatus = statusFilter === "all" || clientItem.statut === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculer les statistiques
  const detaillantCount = safeClients.filter(c => c.type_client === 'detaillant').length;
  const grossisteCount = safeClients.filter(c => c.type_client === 'grossiste').length;
  const institutionCount = safeClients.filter(c => c.type_client === 'institution').length;
  const activeCount = safeClients.filter(c => c.statut === 'actif').length;
  const inactiveCount = safeClients.filter(c => c.statut === 'inactif').length;

  const getTypeIcon = (type: TypeClient) => {
    switch (type) {
      case 'detaillant': return <StoreIcon className="h-4 w-4" />;
      case 'grossiste': return <PackageIcon className="h-4 w-4" />;
      case 'institution': return <BuildingIcon className="h-4 w-4" />;
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
            Impossible de charger les clients. Vérifiez votre connexion.
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
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Clients</h1>
              <p className="text-muted-foreground">
                Gérez vos clients détaillants, grossistes et institutions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total clients</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : safeClients.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les clients enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Détaillants</CardTitle>
              <StoreIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : detaillantCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Points de vente individuels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grossistes</CardTitle>
              <PackageIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : grossisteCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Revendeurs en gros
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institutions</CardTitle>
              <BuildingIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : institutionCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Établissements publics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : activeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {inactiveCount > 0 ? `${inactiveCount} inactif(s)` : 'Tous actifs'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Clients</CardTitle>
              <CardDescription>
                Liste de tous vos clients enregistrés
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
              
              <Button size="sm" onClick={handleCreate}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, responsable, téléphone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={(value: TypeClient | "all") => setTypeFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Type de client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
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

                <Select value={statusFilter} onValueChange={(value: StatutClient | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">
                      <div className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-green-500" />
                        Actif
                      </div>
                    </SelectItem>
                    <SelectItem value="inactif">
                      <div className="flex items-center gap-2">
                        <XIcon className="h-4 w-4 text-red-500" />
                        Inactif
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Toggle and Results */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredClients.length} client(s) trouvé(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <StoreIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <UsersIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && !clients ? (
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
              {/* Empty State */}
              {filteredClients.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <UsersIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                      ? "Aucun client ne correspond à vos critères de recherche."
                      : "Commencez par créer votre premier client pour gérer votre réseau commercial."}
                  </p>
                  {searchQuery || typeFilter !== "all" || statusFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setTypeFilter("all");
                        setStatusFilter("all");
                      }}
                    >
                      Effacer les filtres
                    </Button>
                  ) : (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Créer un client
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <ClientGrid
                      clients={filteredClients}
                      loading={loading}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <ClientTable
                      clients={filteredClients}
                      loading={loading}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={selectedClient}
        onSuccess={selectedClient ? handleClientUpdated : handleClientCreated}
      />

      <ClientDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        client={selectedClient}
        onSuccess={handleClientDeleted}
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { TricycleTable } from "@/components/tricycles/tricycle-table";
import { TricycleDialog } from "@/components/tricycles/tricycle-dialog";
import { TricycleDeleteDialog } from "@/components/tricycles/tricycle-delete-dialog";
import { useAgents } from "@/lib/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  BikeIcon,
  PackageIcon,
  UsersIcon,
  AlertCircleIcon,
  FilterIcon,
  GridIcon,
  TableIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Tricycle } from "@/lib/types";
import { TricycleGrid } from "@/components/tricycles/tricycle-grid";

export default function TricyclesPage() {
  const {
    tricycles,
    tricycle,
    tricyclesLoading,
    tricyclesError,
    fetchTricycles,
    clearError,
  } = useAgents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTricycle, setSelectedTricycle] = useState<Tricycle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "available">("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchTricycles();
      toast.success("Liste des tricycles actualisée");
    } catch (error) {
      toast.error("Erreur lors du chargement des tricycles");
    }
  };

  const handleCreate = () => {
    setSelectedTricycle(null);
    setDialogOpen(true);
  };

  const handleEdit = (tricycleItem: Tricycle) => {
    setSelectedTricycle(tricycleItem);
    setDialogOpen(true);
  };

  const handleDelete = (tricycleItem: Tricycle) => {
    setSelectedTricycle(tricycleItem);
    setDeleteDialogOpen(true);
  };

  const handleTricycleCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Tricycle créé avec succès");
  };

  const handleTricycleUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Tricycle mis à jour avec succès");
  };

  const handleTricycleDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Tricycle supprimé avec succès");
  };

  // Filtrer les tricycles
  const filteredTricycles = (tricycles || []).filter((tricycleItem) => {
    // Filtre de recherche
    const matchesSearch = searchQuery === "" || 
      tricycleItem.plaque_immatriculation.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par statut (simulé pour l'instant)
    const isAssigned = false; // À implémenter avec les données réelles
    let matchesStatus = true;
    if (statusFilter === "assigned") matchesStatus = isAssigned;
    if (statusFilter === "available") matchesStatus = !isAssigned;
    
    return matchesSearch && matchesStatus;
  });

  const assignedCount = 0; // À implémenter avec les données réelles
  const availableCount = filteredTricycles.length - assignedCount;

  if (tricyclesError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{tricyclesError}</AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            Impossible de charger les tricycles. Vérifiez votre connexion.
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
              <BikeIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Tricycles</h1>
              <p className="text-muted-foreground">
                Gérez votre flotte de tricycles de livraison
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total tricycles</CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tricyclesLoading ? <Skeleton className="h-8 w-16" /> : filteredTricycles.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les tricycles enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tricycles assignés</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tricyclesLoading ? <Skeleton className="h-8 w-16" /> : assignedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Actuellement utilisés par des agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tricycles disponibles</CardTitle>
              <BikeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tricyclesLoading ? <Skeleton className="h-8 w-16" /> : availableCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Prêts à être assignés
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
              <CardTitle>Tricycles</CardTitle>
              <CardDescription>
                Liste de tous les tricycles de votre flotte
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={tricyclesLoading}
              >
                <RefreshCwIcon className={`mr-2 h-4 w-4 ${tricyclesLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              
              <Button size="sm" onClick={handleCreate}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouveau tricycle
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
                    placeholder="Rechercher par plaque d'immatriculation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-primary/10" : ""}
                >
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Tous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("assigned")}
                  className={statusFilter === "assigned" ? "bg-primary/10" : ""}
                >
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Assignés
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("available")}
                  className={statusFilter === "available" ? "bg-primary/10" : ""}
                >
                  <BikeIcon className="mr-2 h-4 w-4" />
                  Disponibles
                </Button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {tricyclesLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredTricycles.length} tricycle(s) trouvé(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {tricyclesLoading && !tricycles ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Empty State */}
              {filteredTricycles.length === 0 && !tricyclesLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <BikeIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun tricycle trouvé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Aucun tricycle ne correspond à vos critères de recherche."
                      : "Commencez par créer votre premier tricycle pour gérer votre flotte."}
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
                  ) : (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Créer un tricycle
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <TricycleGrid
                      tricycles={filteredTricycles}
                      loading={tricyclesLoading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <TricycleTable
                      tricycles={filteredTricycles}
                      loading={tricyclesLoading}
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
      <TricycleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tricycle={selectedTricycle}
        onSuccess={selectedTricycle ? handleTricycleUpdated : handleTricycleCreated}
      />

      <TricycleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tricycle={selectedTricycle}
        onSuccess={handleTricycleDeleted}
      />
    </div>
  );
}
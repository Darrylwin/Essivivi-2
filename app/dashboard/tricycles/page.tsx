"use client";

import { useState, useEffect } from "react";
import { TricycleTable } from "@/components/tricycles/tricycle-table";
import { TricycleDialog } from "@/components/tricycles/tricycle-dialog";
import { TricycleDeleteDialog } from "@/components/tricycles/tricycle-delete-dialog";
import { useUsers } from "@/lib/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, FilterIcon, RefreshCwIcon, BikeIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function TricyclesPage() {
  const {
    tricycles,
    tricyclesLoading,
    tricyclesError,
    fetchTricycles,
    clearErrors,
  } = useUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTricycle, setSelectedTricycle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchTricycles();
    } catch (error) {
      toast.error("Erreur lors du chargement des tricycles");
    }
  };

  const handleSearch = () => {
    // La recherche est gérée côté client pour l'instant
    // Vous pouvez implémenter une recherche API si nécessaire
  };

  const handleCreate = () => {
    setSelectedTricycle(null);
    setDialogOpen(true);
  };

  const handleEdit = (tricycle: any) => {
    setSelectedTricycle(tricycle);
    setDialogOpen(true);
  };

  const handleDelete = (tricycle: any) => {
    setSelectedTricycle(tricycle);
    setDeleteDialogOpen(true);
  };

  const handleTricycleCreated = () => {
    setDialogOpen(false);
    fetchTricycles();
    toast.success("Tricycle créé avec succès");
  };

  const handleTricycleUpdated = () => {
    setDialogOpen(false);
    fetchTricycles();
    toast.success("Tricycle mis à jour avec succès");
  };

  const handleTricycleDeleted = () => {
    setDeleteDialogOpen(false);
    fetchTricycles();
    toast.success("Tricycle supprimé avec succès");
  };

  // Filtrer les tricycles côté client basé sur la recherche
  const filteredTricycles = Array.isArray(tricycles) 
    ? tricycles.filter(tricycle => 
        tricycle.plaque_immatriculation.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getAssignedTricyclesCount = () => {
    if (!Array.isArray(tricycles)) return 0;
    // Dans une implémentation réelle, vous auriez besoin des données des agents
    return 0; // À implémenter
  };

  if (tricyclesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{tricyclesError}</div>
        <Button onClick={() => { clearErrors(); fetchData(); }}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des Tricycles</h1>
            <p className="text-muted-foreground">
              Gérez votre flotte de tricycles ({filteredTricycles.length} tricycles)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={tricyclesLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouveau tricycle
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher par plaque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={tricyclesLoading}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Total tricycles</div>
            <div className="text-2xl font-bold">
              {filteredTricycles.length}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Tricycles assignés</div>
            <div className="text-2xl font-bold">
              {getAssignedTricyclesCount()}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Tricycles disponibles</div>
            <div className="text-2xl font-bold">
              {filteredTricycles.length - getAssignedTricyclesCount()}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <TricycleTable
            tricycles={filteredTricycles}
            loading={tricyclesLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

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
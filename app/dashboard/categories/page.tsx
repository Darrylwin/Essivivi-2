"use client";

import { useState, useEffect } from "react";
import { CategoryTable } from "@/components/categories/categorie-table";
import { CategoryDialog } from "@/components/categories/categorie-dialog";
import { CategoryDeleteDialog } from "@/components/categories/categorie-delete-dialog";
import { useCategories } from "@/lib/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  TagIcon,
  PackageIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  FilterIcon,
  GridIcon,
  TableIcon,
  LayersIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { CategorieListItem } from "@/lib/types";
import { CategoryGrid } from "@/components/categories/category-grid";
import { Toggle } from "@/components/ui/toggle";

export default function CategoriesPage() {
  const {
    categories,
    categorie,
    loading,
    error,
    fetchCategories,
    clearError,
  } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategorieListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showProducts, setShowProducts] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchCategories({ avec_produits: showProducts });
      toast.success("Liste des catégories actualisée");
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setDialogOpen(true);
  };

  const handleEdit = (categoryItem: CategorieListItem) => {
    setSelectedCategory(categoryItem);
    setDialogOpen(true);
  };

  const handleDelete = (categoryItem: CategorieListItem) => {
    setSelectedCategory(categoryItem);
    setDeleteDialogOpen(true);
  };

  const handleCategoryCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Catégorie créée avec succès");
  };

  const handleCategoryUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Catégorie mise à jour avec succès");
  };

  const handleCategoryDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Catégorie supprimée avec succès");
  };

  // S'assurer que categories.results est toujours un tableau
  const safeCategories = categories?.results && Array.isArray(categories.results) ? categories.results : [];
  
  // Filtrer les catégories
  const filteredCategories = safeCategories.filter((categoryItem) => {
    // Filtre de recherche
    const matchesSearch = searchQuery === "" || 
      categoryItem.nom.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par statut
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && categoryItem.actif) ||
      (statusFilter === "inactive" && !categoryItem.actif);
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const activeCount = safeCategories.filter(c => c.actif).length;
  const inactiveCount = safeCategories.filter(c => !c.actif).length;
  const totalProducts = safeCategories.reduce((sum, cat) => sum + cat.nombre_produits, 0);
  const averageProducts = safeCategories.length > 0 ? (totalProducts / safeCategories.length).toFixed(1) : "0";

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
            Impossible de charger les catégories. Vérifiez votre connexion.
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
              <LayersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
              <p className="text-muted-foreground">
                Organisez vos produits en catégories pour une meilleure gestion
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total catégories</CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : safeCategories.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Toutes les catégories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories actives</CardTitle>
              <CheckIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : activeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Visibles dans le catalogue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits total</CardTitle>
              <PackageIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous produits confondus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moyenne produits</CardTitle>
              <LayersIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : averageProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Produits par catégorie
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
              <CardTitle>Catégories</CardTitle>
              <CardDescription>
                Liste de toutes les catégories de produits
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Toggle
                pressed={showProducts}
                onPressedChange={(pressed) => {
                  setShowProducts(pressed);
                  fetchCategories({ avec_produits: pressed });
                }}
                aria-label="Afficher les produits"
                variant="outline"
                size="sm"
              >
                <PackageIcon className="mr-2 h-4 w-4" />
                Produits
              </Toggle>
              
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
                Nouvelle catégorie
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
                    placeholder="Rechercher par nom de catégorie..."
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
                  Toutes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                  className={statusFilter === "active" ? "bg-primary/10" : ""}
                >
                  <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                  Actives
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                  className={statusFilter === "inactive" ? "bg-primary/10" : ""}
                >
                  <XIcon className="mr-2 h-4 w-4 text-red-500" />
                  Inactives
                </Button>
              </div>
            </div>

            {/* View Toggle and Results */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredCategories.length} catégorie(s) trouvée(s)`
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
          {loading && !categories ? (
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
              {filteredCategories.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <LayersIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucune catégorie trouvée</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Aucune catégorie ne correspond à vos critères de recherche."
                      : "Commencez par créer votre première catégorie pour organiser vos produits."}
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
                      Créer une catégorie
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <CategoryGrid
                      categories={filteredCategories}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <CategoryTable
                      categories={filteredCategories}
                      loading={loading}
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
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSuccess={selectedCategory ? handleCategoryUpdated : handleCategoryCreated}
      />

      <CategoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={selectedCategory}
        onSuccess={handleCategoryDeleted}
      />
    </div>
  );
}
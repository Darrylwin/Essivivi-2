"use client";

import { useState, useEffect } from "react";
import { ProductTable } from "@/components/products/produit-table";
import { ProductDialog } from "@/components/products/produit-dialog";
import { ProductDeleteDialog } from "@/components/products/produit-delete-dialog";
import { useProducts } from "@/lib/hooks/useProducts";
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
  PackageIcon,
  TagIcon,
  DollarSignIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  FilterIcon,
  GridIcon,
  TableIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  FilterXIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { ProduitListItem, UniteVente } from "@/lib/types";
import { ProductGrid } from "@/components/products/product-grid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductsPage() {
  const {
    produits,
    produit,
    loading,
    error,
    fetchProduits,
    clearError,
  } = useProducts();

  const { categories, fetchCategories } = useCategories();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProduitListItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<UniteVente | "all">("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") {
        params.actif = statusFilter === "active";
      }
      if (categoryFilter !== "all") {
        params.categorie_id = parseInt(categoryFilter);
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      await fetchProduits(params);
      toast.success("Liste des produits actualisée");
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    }
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (productItem: ProduitListItem) => {
    setSelectedProduct(productItem);
    setDialogOpen(true);
  };

  const handleDelete = (productItem: ProduitListItem) => {
    setSelectedProduct(productItem);
    setDeleteDialogOpen(true);
  };

  const handleProductCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Produit créé avec succès");
  };

  const handleProductUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Produit mis à jour avec succès");
  };

  const handleProductDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Produit supprimé avec succès");
  };

  // S'assurer que produits.results est toujours un tableau
  const safeProducts = produits?.results && Array.isArray(produits.results) ? produits.results : [];
  
  // Filtrer les produits (client-side pour les filtres supplémentaires)
  const filteredProducts = safeProducts.filter((productItem) => {
    // Filtre par unité
    const matchesUnit = unitFilter === "all" || productItem.unite_vente === unitFilter;
    
    return matchesUnit;
  });

  // Calculer les statistiques
  const activeCount = safeProducts.filter(p => p.actif).length;
  const inactiveCount = safeProducts.filter(p => !p.actif).length;
  
  const totalValue = safeProducts.reduce((sum, prod) => {
    const price = parseFloat(prod.prix_unitaire) || 0;
    return sum + price;
  }, 0);
  
  const averagePrice = safeProducts.length > 0 ? (totalValue / safeProducts.length).toFixed(2) : "0.00";
  
  const unitsCount = {
    sachet: safeProducts.filter(p => p.unite_vente === 'sachet').length,
    bouteille: safeProducts.filter(p => p.unite_vente === 'bouteille').length,
    canette: safeProducts.filter(p => p.unite_vente === 'canette').length,
    pack: safeProducts.filter(p => p.unite_vente === 'pack').length,
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
            Impossible de charger les produits. Vérifiez votre connexion.
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
              <PackageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Produits</h1>
              <p className="text-muted-foreground">
                Gérez votre catalogue de produits de vente
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total produits</CardTitle>
              <PackageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : safeProducts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les produits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
              <CheckIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : activeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Disponibles à la vente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prix moyen</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-20" /> : `${averagePrice} FCFA`}
              </div>
              <p className="text-xs text-muted-foreground">
                Prix unitaire moyen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-20" /> : `${totalValue.toFixed(2)} FCFA`}
              </div>
              <p className="text-xs text-muted-foreground">
                Valeur catalogue
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
              <CardTitle>Produits</CardTitle>
              <CardDescription>
                Liste de tous les produits du catalogue
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
                Nouveau produit
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
                    placeholder="Rechercher par nom, marque..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={fetchData}
                disabled={loading}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Statut</Label>
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
                    onClick={() => setStatusFilter("active")}
                    className={statusFilter === "active" ? "bg-primary/10" : ""}
                  >
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    Actifs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatusFilter("inactive")}
                    className={statusFilter === "inactive" ? "bg-primary/10" : ""}
                  >
                    <XIcon className="mr-2 h-4 w-4 text-red-500" />
                    Inactifs
                  </Button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catégorie</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <TagIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories?.results?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.nom} ({category.nombre_produits})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Unité de vente</Label>
                <Select value={unitFilter} onValueChange={(value: UniteVente | "all") => setUnitFilter(value)}>
                  <SelectTrigger>
                    <ShoppingCartIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Toutes les unités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les unités</SelectItem>
                    <SelectItem value="sachet">Sachet ({unitsCount.sachet})</SelectItem>
                    <SelectItem value="bouteille">Bouteille ({unitsCount.bouteille})</SelectItem>
                    <SelectItem value="canette">Canette ({unitsCount.canette})</SelectItem>
                    <SelectItem value="pack">Pack ({unitsCount.pack})</SelectItem>
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
                  `${filteredProducts.length} produit(s) trouvé(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {(statusFilter !== "all" || categoryFilter !== "all" || unitFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("all");
                      setCategoryFilter("all");
                      setUnitFilter("all");
                      setSearchQuery("");
                      fetchProduits();
                    }}
                  >
                    <FilterXIcon className="mr-2 h-4 w-4" />
                    Effacer les filtres
                  </Button>
                )}
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
          {loading && !produits ? (
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
              {filteredProducts.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <PackageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || unitFilter !== "all"
                      ? "Aucun produit ne correspond à vos critères de recherche."
                      : "Commencez par créer votre premier produit pour enrichir votre catalogue."}
                  </p>
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || unitFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                        setUnitFilter("all");
                        fetchProduits();
                      }}
                    >
                      Effacer les filtres
                    </Button>
                  ) : (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Créer un produit
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <ProductGrid
                      products={filteredProducts}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  )}

                  {/* Table View */}
                  {viewMode === "table" && (
                    <ProductTable
                      products={filteredProducts}
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
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSuccess={selectedProduct ? handleProductUpdated : handleProductCreated}
      />

      <ProductDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        onSuccess={handleProductDeleted}
      />
    </div>
  );
}

// Label component pour éviter l'erreur
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
    {children}
  </label>
);
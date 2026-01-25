/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ProduitTable } from "@/components/products/produit-table";
import { ProduitDialog } from "@/components/products/produit-dialog";
import { ProduitDeleteDialog } from "@/components/products/produit-delete-dialog";
import { ProduitViewDialog } from "@/components/products/produit-view-dialog";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, FilterIcon, RefreshCwIcon, PackageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const {
    produits,
    produitsCount,
    produitsLoading,
    produitsError,
    categories,
    categoriesLoading,
    fetchProduits,
    fetchCategories,
    clearErrors,
    stats,
  } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [uniteFilter, setUniteFilter] = useState<string>("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchProduits(),
        fetchCategories(),
      ]);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handleSearch = () => {
    // Recherche côté client pour l'instant
    // Pour une recherche serveur : fetchProduits({ search: searchQuery })
  };

  const handleCreate = () => {
    setSelectedProduit(null);
    setDialogOpen(true);
  };

  const handleView = (produit: any) => {
    setSelectedProduit(produit);
    setViewDialogOpen(true);
  };

  const handleEdit = (produit: any) => {
    setSelectedProduit(produit);
    setDialogOpen(true);
  };

  const handleDelete = (produit: any) => {
    setSelectedProduit(produit);
    setDeleteDialogOpen(true);
  };

  const handleProduitCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Produit créé avec succès");
  };

  const handleProduitUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Produit mis à jour avec succès");
  };

  const handleProduitDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Produit supprimé avec succès");
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchProduits({
      actif: value !== "all" ? value === "actif" : undefined,
      categorie_id: categorieFilter !== "all" ? parseInt(categorieFilter) : undefined,
    });
  };

  const handleCategorieFilter = (value: string) => {
    setCategorieFilter(value);
    fetchProduits({
      categorie_id: value !== "all" ? parseInt(value) : undefined,
      actif: statusFilter !== "all" ? statusFilter === "actif" : undefined,
    });
  };

  const handleUniteFilter = (value: string) => {
    setUniteFilter(value);
    // Filtre côté client pour l'unité
  };

  // Filtrer les produits côté client
  const filteredProduits = Array.isArray(produits)
    ? produits.filter(produit => {
        let matches = true;
        
        // Recherche
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          matches = matches && (
            produit.nom.toLowerCase().includes(searchLower) ||
            produit.marque.toLowerCase().includes(searchLower) ||
            (produit.volume && produit.volume.toLowerCase().includes(searchLower)) ||
            produit.categorie_nom.toLowerCase().includes(searchLower)
          );
        }
        
        // Filtre unité
        if (uniteFilter !== "all") {
          matches = matches && produit.unite_vente === uniteFilter;
        }
        
        return matches;
      })
    : [];

  if (produitsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{produitsError}</div>
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
            <h1 className="text-2xl font-bold tracking-tight">Catalogue Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits ({produitsCount} produits)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={produitsLoading || categoriesLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouveau produit
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={produitsLoading}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={categorieFilter} onValueChange={handleCategorieFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {Array.isArray(categories) && categories.map((categorie) => (
                  <SelectItem key={categorie.id} value={categorie.id.toString()}>
                    {categorie.nom} ({categorie.nombre_produits})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actifs</SelectItem>
                <SelectItem value="inactif">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={uniteFilter} onValueChange={handleUniteFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Unité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes unités</SelectItem>
                <SelectItem value="sachet">Sachet</SelectItem>
                <SelectItem value="bouteille">Bouteille</SelectItem>
                <SelectItem value="canette">Canette</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium text-muted-foreground">Total produits</div>
              </div>
              <div className="text-2xl font-bold mt-2">{produitsCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="h-2 w-2 p-0" />
                <div className="text-sm font-medium text-muted-foreground">Produits actifs</div>
              </div>
              <div className="text-2xl font-bold mt-2">
                {filteredProduits.filter(p => p.actif).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-2 w-2 p-0" />
                <div className="text-sm font-medium text-muted-foreground">Catégories</div>
              </div>
              <div className="text-2xl font-bold mt-2">
                {Array.isArray(categories) ? categories.length : 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">Prix moyen</div>
              </div>
              <div className="text-2xl font-bold mt-2">
                {filteredProduits.length > 0
                  ? Math.round(filteredProduits.reduce((acc, p) => acc + parseFloat(p.prix_unitaire), 0) / filteredProduits.length)
                  : 0} FCFA
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <ProduitTable
            produits={filteredProduits}
            loading={produitsLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Dialogs */}
      <ProduitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produit={selectedProduit}
        categories={categories}
        onSuccess={selectedProduit ? handleProduitUpdated : handleProduitCreated}
      />

      <ProduitViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        produit={selectedProduit}
      />

      <ProduitDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        produit={selectedProduit}
        onSuccess={handleProduitDeleted}
      />
    </div>
  );
}
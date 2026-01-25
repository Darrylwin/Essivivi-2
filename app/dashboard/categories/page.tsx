/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { CategorieTable } from "@/components/categories/categorie-table";
import { CategorieDialog } from "@/components/categories/categorie-dialog";
import { CategorieDeleteDialog } from "@/components/categories/categorie-delete-dialog";
import { CategorieViewDialog } from "@/components/categories/categorie-view-dialog";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, FilterIcon, RefreshCwIcon, TagIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
  const {
    categories,
    categoriesCount,
    categoriesLoading,
    categoriesError,
    fetchCategories,
    clearErrors,
    stats,
  } = useProducts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [avecProduitsFilter, setAvecProduitsFilter] = useState<string>("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchCategories({ avec_produits: true });
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const handleSearch = () => {
    // Recherche côté client
  };

  const handleCreate = () => {
    setSelectedCategorie(null);
    setDialogOpen(true);
  };

  const handleView = (categorie: any) => {
    setSelectedCategorie(categorie);
    setViewDialogOpen(true);
  };

  const handleEdit = (categorie: any) => {
    setSelectedCategorie(categorie);
    setDialogOpen(true);
  };

  const handleDelete = (categorie: any) => {
    setSelectedCategorie(categorie);
    setDeleteDialogOpen(true);
  };

  const handleCategorieCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Catégorie créée avec succès");
  };

  const handleCategorieUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Catégorie mise à jour avec succès");
  };

  const handleCategorieDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Catégorie supprimée avec succès");
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchCategories({
      actif: value !== "all" ? value === "actif" : undefined,
      avec_produits: true,
    });
  };

  const handleAvecProduitsFilter = (value: string) => {
    setAvecProduitsFilter(value);
    fetchCategories({
      avec_produits: value !== "all" ? value === "avec" : undefined,
    });
  };

  // Filtrer les catégories côté client basé sur la recherche
  const filteredCategories = Array.isArray(categories)
    ? categories.filter(categorie =>
        categorie.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (categorie.description && categorie.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  if (categoriesError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{categoriesError}</div>
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
            <h1 className="text-2xl font-bold tracking-tight">Gestion des Catégories</h1>
            <p className="text-muted-foreground">
              Organisez vos produits par catégories ({categoriesCount} catégories)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={categoriesLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={categoriesLoading}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actives</SelectItem>
                <SelectItem value="inactif">Inactives</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={avecProduitsFilter} onValueChange={handleAvecProduitsFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Avec produits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="avec">Avec produits</SelectItem>
                <SelectItem value="sans">Sans produits</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium text-muted-foreground">Total catégories</div>
              </div>
              <div className="text-2xl font-bold mt-2">{categoriesCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="h-2 w-2 p-0" />
                <div className="text-sm font-medium text-muted-foreground">Catégories actives</div>
              </div>
              <div className="text-2xl font-bold mt-2">
                {filteredCategories.filter(c => c.actif).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-2 w-2 p-0" />
                <div className="text-sm font-medium text-muted-foreground">Total produits</div>
              </div>
              <div className="text-2xl font-bold mt-2">
                {filteredCategories.reduce((acc, cat) => acc + cat.nombre_produits, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <CategorieTable
            categories={filteredCategories}
            loading={categoriesLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Dialogs */}
      <CategorieDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categorie={selectedCategorie}
        onSuccess={selectedCategorie ? handleCategorieUpdated : handleCategorieCreated}
      />

      <CategorieViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        categorie={selectedCategorie}
      />

      <CategorieDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        categorie={selectedCategorie}
        onSuccess={handleCategorieDeleted}
      />
    </div>
  );
}
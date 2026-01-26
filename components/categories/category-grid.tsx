"use client";

import { CategoryCard } from "./category-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategorieListItem } from "@/lib/types";

interface CategoryGridProps {
  categories: CategorieListItem[];
  loading: boolean;
  onEdit: (category: CategorieListItem) => void;
  onDelete: (category: CategorieListItem) => void;
}

export function CategoryGrid({
  categories,
  loading,
  onEdit,
  onDelete,
}: CategoryGridProps) {
  if (loading && categories.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Aucune catégorie trouvée</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
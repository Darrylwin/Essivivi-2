"use client";

import { ProductCard } from "./produit-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProduitListItem } from "@/lib/types";

interface ProductGridProps {
  products: ProduitListItem[];
  loading: boolean;
  onEdit: (product: ProduitListItem) => void;
  onDelete: (product: ProduitListItem) => void;
}

export function ProductGrid({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductGridProps) {
  if (loading && products.length === 0) {
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

  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Aucun produit trouvé</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
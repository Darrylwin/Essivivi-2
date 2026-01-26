"use client";

import { TricycleCard } from "./tricycle-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tricycle } from "@/lib/types";

interface TricycleGridProps {
  tricycles: Tricycle[];
  loading: boolean;
  onEdit: (tricycle: Tricycle) => void;
  onDelete: (tricycle: Tricycle) => void;
}

export function TricycleGrid({
  tricycles,
  loading,
  onEdit,
  onDelete,
}: TricycleGridProps) {
  if (loading && tricycles.length === 0) {
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

  if (!loading && tricycles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Aucun tricycle trouvé</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tricycles.map((tricycle) => (
        <TricycleCard
          key={tricycle.id}
          tricycle={tricycle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
"use client";

import { TricycleCard } from "./tricycle-card";

interface TricycleGridProps {
  tricycles: any[];
  loading: boolean;
  onEdit: (tricycle: any) => void;
  onDelete: (tricycle: any) => void;
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
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
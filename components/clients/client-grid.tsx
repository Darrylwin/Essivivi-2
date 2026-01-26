"use client";

import { ClientCard } from "./client-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientListItem } from "@/lib/types";

interface ClientGridProps {
  clients: ClientListItem[];
  loading: boolean;
  onView?: (client: ClientListItem) => void;
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
}

export function ClientGrid({
  clients,
  loading,
  onView,
  onEdit,
  onDelete,
}: ClientGridProps) {
  if (loading && clients.length === 0) {
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

  if (!loading && clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">Aucun client trouvé</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
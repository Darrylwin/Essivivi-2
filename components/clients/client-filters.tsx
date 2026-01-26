"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FilterIcon,
  StoreIcon,
  UserIcon,
  SearchIcon,
} from "lucide-react";
import type { ClientQueryParams } from "@/lib/types";
import { useState } from "react";

interface ClientFiltersProps {
  onFilter: (filters: ClientFilters) => void;
  loading?: boolean;
}

export interface ClientFilters {
  type_client?: 'détaillant' | 'grossiste' | 'institution';
  statut?: 'actif' | 'inactif';
  search?: string;
}

export function ClientFilters({
  onFilter,
  loading = false,
}: ClientFiltersProps) {
  const [filters, setFilters] = useState<ClientFilters>({});

  const handleFilterChange = (key: keyof ClientFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, responsable, téléphone..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-9"
              disabled={loading}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            disabled={loading}
          >
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select
            value={filters.type_client || "all"}
            onValueChange={(value) => 
              handleFilterChange("type_client", value === "all" ? undefined : value)
            }
            disabled={loading}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="détaillant">Détaillant</SelectItem>
              <SelectItem value="grossiste">Grossiste</SelectItem>
              <SelectItem value="institution">Institution</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.statut || "all"}
            onValueChange={(value) => 
              handleFilterChange("statut", value === "all" ? undefined : value)
            }
            disabled={loading}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
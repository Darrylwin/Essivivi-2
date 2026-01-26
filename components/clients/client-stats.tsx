"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  StoreIcon,
  UserIcon,
  BuildingIcon,
  MapPinIcon,
  DollarSignIcon,
  TrendingUpIcon,
} from "lucide-react";

interface ClientStatsProps {
  stats: {
    total: number;
    actifs: number;
    inactifs: number;
    detaillants: number;
    grossistes: number;
    institutions: number;
    avgCommandsPerClient?: number;
  };
  loading?: boolean;
}

export function ClientStats({ stats, loading = false }: ClientStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-8 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total clients",
      value: stats.total,
      icon: StoreIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clients actifs",
      value: stats.actifs,
      icon: UserIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Détaillants",
      value: stats.detaillants,
      icon: StoreIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Grossistes",
      value: stats.grossistes,
      icon: BuildingIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Institutions",
      value: stats.institutions,
      icon: BuildingIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Inactifs",
      value: stats.inactifs,
      icon: UserIcon,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <div className={`${card.bgColor} h-1 w-full`}></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-2">{card.value}</h3>
                  </div>
                  <div className={`${card.color} p-2 rounded-lg bg-white/50`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Répartition par type */}
      {stats.avgCommandsPerClient && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-4">Répartition par type</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Détaillants', value: stats.detaillants, color: 'bg-indigo-500' },
                    { label: 'Grossistes', value: stats.grossistes, color: 'bg-purple-500' },
                    { label: 'Institutions', value: stats.institutions, color: 'bg-orange-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{
                            width: `${(item.value / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Statistiques avancées</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Commandes moyennes par client</span>
                    </div>
                    <span className="font-bold">{stats.avgCommandsPerClient}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Taux d'activation</span>
                    </div>
                    <span className="font-bold">
                      {((stats.actifs / stats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
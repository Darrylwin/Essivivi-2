"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PackageIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  DollarSignIcon,
  XCircleIcon,
} from "lucide-react";
import type { CommandeStats } from "@/lib/types";

interface CommandeStatsProps {
  stats: CommandeStats;
  loading?: boolean;
}

export function CommandeStats({ stats, loading = false }: CommandeStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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

  const montantTotal = parseFloat(stats.montant_total);

  const statCards = [
    {
      title: "Total commandes",
      value: stats.total,
      icon: PackageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "En attente",
      value: stats.en_attente,
      icon: ClockIcon,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "En cours",
      value: stats.en_cours,
      icon: TruckIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Montant total",
      value: `${montantTotal.toLocaleString('fr-FR')} FCFA`,
      icon: DollarSignIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Commandes livrées
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.livree}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircleIcon className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Commandes annulées
              </span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.annulee}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Commandes acceptées
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.acceptee}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
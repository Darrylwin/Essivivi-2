"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Package, Users } from "lucide-react";
import { useState } from "react";
import type { DashboardStats } from "@/lib/types";

interface DashboardChartsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function DashboardCharts({ stats, loading = false }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = useState("7d");

  // Données pour les graphiques (simulation - à remplacer par des données réelles)
  const deliveryData = [
    { day: "Lun", livraisons: 42 },
    { day: "Mar", livraisons: 38 },
    { day: "Mer", livraisons: 45 },
    { day: "Jeu", livraisons: 51 },
    { day: "Ven", livraisons: 48 },
    { day: "Sam", livraisons: 39 },
    { day: "Dim", livraisons: 32 }
  ];

  const agentData = [
    { name: "En tournée", value: stats?.agents_en_tournee || 0, color: "#3b82f6" },
    { name: "Disponibles", value: (stats?.agents_actifs || 0) - (stats?.agents_en_tournee || 0), color: "#10b981" },
    { name: "Inactifs", value: 0, color: "#6b7280" }
  ];

  const revenueData = [
    { hour: "8h", ca: 1200 },
    { hour: "10h", ca: 1800 },
    { hour: "12h", ca: 2500 },
    { hour: "14h", ca: 3200 },
    { hour: "16h", ca: 2800 },
    { hour: "18h", ca: 1900 },
    { hour: "20h", ca: 800 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Graphique des livraisons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Livraisons par jour
              </CardTitle>
              <CardDescription>Évolution du nombre de livraisons</CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="90d">3 derniers mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="livraisons" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Deuxième ligne - Graphiques comparés */}
      <div className="grid grid-cols-1 gap-6">
        {/* Chiffre d'affaires par heure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              CA par heure
            </CardTitle>
            <CardDescription>Évolution horaire aujourd&apos;hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} />
                  <Tooltip />
                  <Bar 
                    dataKey="ca" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
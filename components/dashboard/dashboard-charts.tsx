"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard";
import { ChartAreaInteractive } from "../chart-area-interactive";
import { ChartBarInteractive } from "../chart-bar-interactive";

interface DashboardChartsProps {
  loading?: boolean;
}

export function DashboardCharts({ loading = false }: DashboardChartsProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const { dashboardStats, dashboardLoading, fetchDashboardStats } = useTrackingDashboard();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const agentData = [
    { 
      name: "En tournée", 
      value: dashboardStats?.agents_en_tournee || 0, 
      color: "#3b82f6" 
    },
    { 
      name: "Disponibles", 
      value: Math.max(0, (dashboardStats?.agents_actifs || 0) - (dashboardStats?.agents_en_tournee || 0)), 
      color: "#10b981" 
    },
    { 
      name: "Inactifs", 
      value: 0, 
      color: "#6b7280" 
    }
  ];

  const revenueData = Array.from({ length: 8 }, (_, i) => {
    const hour = 8 + i * 2;
    const baseRevenue = parseFloat(dashboardStats?.montant_total_aujourdhui.replace(/[^0-9.-]+/g, "") || "0");
    const hourFactor = Math.sin((i / 7) * Math.PI) * 0.5 + 0.5;
    
    return {
      hour: `${hour}h`,
      ca: Math.round(baseRevenue * hourFactor * 0.1)
    };
  });

  if (loading || dashboardLoading) {
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
      {/* Graphique des livraisons - Utilise le composant area interactive */}
      <ChartAreaInteractive defaultTimeRange={timeRange} />

      {/* Graphique bar interactive */}
      <ChartBarInteractive timeRange={timeRange} />

      {/* Deuxième ligne - Graphiques comparés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chiffre d'affaires par heure */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  CA aujourd&apos;hui
                </CardTitle>
                <CardDescription>Répartition horaire du chiffre d&apos;affaires</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")}>
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
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value: number) => `€${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`€${value.toLocaleString()}`, "CA"]}
                    labelStyle={{ color: '#666' }}
                  />
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

        {/* Statut des agents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Statut des agents
            </CardTitle>
            <CardDescription>Répartition des agents actuellement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {agentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, "Agents"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {agentData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {item.name}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
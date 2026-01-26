"use client";

import { useState, useEffect } from "react";
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  MapPin,
  Navigation,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Activity,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardMap } from "@/components/dashboard/dashboard-map";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { AgentPositionsTable } from "@/components/dashboard/agent-positions-table";

export default function OverviewPage() {
  const {
    dashboardStats,
    dashboardLoading,
    dashboardError,
    fetchDashboardStats,
    positions,
    trackingLoading,
    fetchPositions,
    agentsEnTournee,
    fetchAgentsEnTournee,
    clearErrors
  } = useTrackingDashboard();

  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 20000); // 20 secondes

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchPositions(),
        fetchAgentsEnTournee()
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    }
  };

  const handleManualRefresh = () => {
    toast.promise(fetchData(), {
      loading: "Actualisation des données...",
      success: "Données actualisées",
      error: "Erreur lors de l'actualisation"
    });
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast.success(`Auto-rafraîchissement ${!autoRefresh ? 'activé' : 'désactivé'}`);
  };

  if (dashboardError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dashboardError}</AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            Impossible de charger les données du dashboard.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => { clearErrors(); fetchData(); }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Surveillance en temps réel de votre activité de livraison
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={autoRefresh ? "default" : "outline"} className="gap-1">
              <Activity className="h-3 w-3" />
              Auto-rafraîchissement {autoRefresh ? "ON" : "OFF"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoRefresh}
            >
              {autoRefresh ? "Désactiver" : "Activer"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={dashboardLoading || trackingLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${dashboardLoading || trackingLoading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chiffre d&apos;affaires aujourd&apos;hui</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.montant_total_aujourdhui || "0.00"} FCFA</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {dashboardStats?.evolution_montant !== undefined && (
                      <>
                        {dashboardStats.evolution_montant > 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {Math.abs(dashboardStats.evolution_montant)}% vs hier
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Livraisons aujourd&apos;hui</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.livraisons_aujourdhui || 0}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {dashboardStats?.evolution_livraisons !== undefined && (
                      <>
                        {dashboardStats.evolution_livraisons > 0 ? (
                          <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        {Math.abs(dashboardStats.evolution_livraisons)}% vs hier
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agents en tournée</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.agents_en_tournee || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Sur {dashboardStats?.agents_actifs || 0} agents actifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commandes en attente</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.commandes_en_attente || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    À traiter
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tracking Live
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Positions Agents
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              <DashboardCharts />
              
              {/* Additional Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métriques d&apos;activité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>Quantité totale aujourd&apos;hui</span>
                        </div>
                        <span className="font-semibold">{dashboardStats?.quantite_totale_aujourdhui || 0} unités</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span>Livraisons hier</span>
                        </div>
                        <span className="font-semibold">{dashboardStats?.livraisons_hier || 0}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>Chiffre d&apos;affaires hier</span>
                        </div>
                        <span className="font-semibold">{dashboardStats?.montant_hier || "0.00"} FCFA</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Live Map */}
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Carte Live
                  </CardTitle>
                  <CardDescription>
                    Positions des agents en temps réel
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <DashboardMap
                    positions={positions || []}
                    loading={trackingLoading}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartographie Live</CardTitle>
              <CardDescription>
                Suivi en temps réel des positions GPS des agents
                {positions && positions.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {positions.length} position(s)
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <DashboardMap
                positions={positions || []}
                loading={trackingLoading}
                showHeatmap={true}
                showTrails={true}
              />
            </CardContent>
          </Card>

          {/* Metrics Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dernière mise à jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {positions && positions.length > 0 ? (
                    new Date(positions[0].timestamp).toLocaleTimeString('fr-FR')
                  ) : (
                    "N/A"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Dernier point GPS reçu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Agents trackés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {positions ? new Set(positions.map(p => p.agent)).size : 0}
                </div>
                <p className="text-xs text-muted-foreground">Agents distincts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Points GPS aujourd&apos;hui</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {positions?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Points enregistrés</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Positions Tab */}
        <TabsContent value="agents" className="space-y-4">
          <AgentPositionsTable
            positions={positions || []}
            loading={trackingLoading}
            agentsEnTournee={agentsEnTournee || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
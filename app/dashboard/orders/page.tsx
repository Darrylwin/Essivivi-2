/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommandeTable } from "@/components/orders/commande-table";
import { CommandeStats } from "@/components/orders/commande-stats";
import { CommandeMap } from "@/components/orders/commande-map";
import { CommandeAssignDialog } from "@/components/orders/commande-assign-dialog";
import { CommandeStatusDialog } from "@/components/orders/commande-status-dialog";
import { CommandeViewDialog } from "@/components/orders/commande-view-dialog";
import { NotificationBadge } from "@/components/orders/notification-badge";
import { useOrders } from "@/lib/hooks/useOrders";
import { useUsers } from "@/lib/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusIcon,
  RefreshCwIcon,
  MapIcon,
  TableIcon,
  BarChartIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Commande, CommandeStatut, CommandeFilters as Filters } from "@/lib/types";

export default function OrdersPage() {
  const router = useRouter();
  const {
    commandes,
    selectedCommande,
    isLoading,
    error,
    loadCommandes,
    loadCommande,
    assignCommande,
    changeCommandeStatus,
    clearError,
  } = useOrders();

  const { agents, clients, fetchAgents, fetchClients } = useUsers();

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedCommandeAction, setSelectedCommandeAction] = useState<Commande | null>(null);
  const [activeTab, setActiveTab] = useState("table");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (filters?: Filters) => {
    try {
      await Promise.all([
        loadCommandes(filters),
        fetchAgents(),
        fetchClients(),
      ]);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handleFilter = (filters: Filters) => {
    loadCommandes(filters);
  };

  const handleView = (commande: Commande) => {
    setSelectedCommandeAction(commande);
    loadCommande(commande.id);
    setViewDialogOpen(true);
  };

  const handleAssign = (commande: Commande) => {
    setSelectedCommandeAction(commande);
    setAssignDialogOpen(true);
  };

  const handleChangeStatus = (commande: Commande) => {
    setSelectedCommandeAction(commande);
    setStatusDialogOpen(true);
  };

  const handleAssignConfirm = async (commandeId: number, agentId: number) => {
    try {
      await assignCommande(commandeId, agentId);
      setAssignDialogOpen(false);
      toast.success("Commande assignée avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'assignation");
    }
  };

  const handleStatusChangeConfirm = async (commandeId: number, statut: CommandeStatut) => {
    try {
      await changeCommandeStatus(commandeId, statut);
      setStatusDialogOpen(false);
      toast.success("Statut modifié avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du changement de statut");
    }
  };

  // Calcul des statistiques
  const calculateStats = () => {
    const stats = {
      total: commandes.length,
      en_attente: commandes.filter(c => c.statut === 'en_attente').length,
      acceptee: commandes.filter(c => c.statut === 'acceptee').length,
      en_cours: commandes.filter(c => c.statut === 'en_cours').length,
      livree: commandes.filter(c => c.statut === 'livree').length,
      annulee: commandes.filter(c => c.statut === 'annulee').length,
      montant_total: commandes.reduce((sum, c) => sum + parseFloat(c.montant_total), 0).toString(),
    };
    return stats;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => { clearError(); fetchData(); }}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des Commandes</h1>
            <p className="text-muted-foreground">
              Gérez les commandes, les livraisons et les notifications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationBadge />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData()}
              disabled={isLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            
            <Button size="sm" onClick={() => router.push('/orders/notifications')}>
              Voir notifications
            </Button>
          </div>
        </div>

        {/* Stats */}
        <CommandeStats stats={calculateStats()} loading={isLoading} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Liste
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              Carte
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChartIcon className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <CommandeTable
                  commandes={commandes}
                  loading={isLoading}
                  onView={handleView}
                  onEdit={() => {}} // Pas d'édition directe depuis la table
                  onAssign={handleAssign}
                  onChangeStatus={handleChangeStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="map" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="h-5 w-5" />
                  Carte des livraisons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CommandeMap
                  commandes={commandes}
                  onMarkerClick={handleView}
                  height="600px"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: 'En attente', value: calculateStats().en_attente, color: 'bg-amber-500' },
                      { label: 'Acceptées', value: calculateStats().acceptee, color: 'bg-blue-500' },
                      { label: 'En cours', value: calculateStats().en_cours, color: 'bg-indigo-500' },
                      { label: 'Livrées', value: calculateStats().livree, color: 'bg-green-500' },
                      { label: 'Annulées', value: calculateStats().annulee, color: 'bg-red-500' },
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
                              width: `${(item.value / calculateStats().total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Activité récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {commandes.slice(0, 5).map((commande) => (
                      <div key={commande.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">Commande #{commande.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {commande.client_nom}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {parseFloat(commande.montant_total).toLocaleString('fr-FR')} FCFA
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CommandeViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        commande={selectedCommande}
      />

      <CommandeAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        commande={selectedCommandeAction}
        agents={agents}
        onAssign={handleAssignConfirm}
      />

      <CommandeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        commande={selectedCommandeAction}
        onChangeStatus={handleStatusChangeConfirm}
      />
    </div>
  );
}
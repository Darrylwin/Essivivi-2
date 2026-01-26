"use client";

import { useState, useEffect } from "react";
import { AgentTable } from "@/components/agents/agent-table";
import { AgentDialog } from "@/components/agents/agent-dialog";
import { AgentDeleteDialog } from "@/components/agents/agent-delete-dialog";
import { useAgents } from "@/lib/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PlusIcon,
  SearchIcon,
  RefreshCwIcon,
  UsersIcon,
  UserPlusIcon,
  UserCheckIcon,
  UserXIcon,
  AlertCircleIcon,
  FilterIcon,
  BikeIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { Agent, AgentListItem, StatutAgent } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AgentsPage() {
  const {
    agents,
    agent,
    loading,
    error,
    fetchAgents,
    clearError,
  } = useAgents();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentListItem | Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatutAgent | "all">("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await fetchAgents();
      toast.success("Liste des agents actualisée");
    } catch (error) {
      toast.error("Erreur lors du chargement des agents");
    }
  };

  const handleCreate = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  const handleEdit = (agentItem: AgentListItem) => {
    setSelectedAgent(agentItem);
    setDialogOpen(true);
  };

  const handleDelete = (agentItem: AgentListItem) => {
    setSelectedAgent(agentItem);
    setDeleteDialogOpen(true);
  };

  const handleAgentCreated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Agent créé avec succès");
  };

  const handleAgentUpdated = () => {
    setDialogOpen(false);
    fetchData();
    toast.success("Agent mis à jour avec succès");
  };

  const handleAgentDeleted = () => {
    setDeleteDialogOpen(false);
    fetchData();
    toast.success("Agent supprimé avec succès");
  };

  // S'assurer que agents.results est toujours un tableau
  const safeAgents = agents?.results && Array.isArray(agents.results) ? agents.results : [];
  
  // Filtrer les agents
  const filteredAgents = safeAgents.filter((agentItem) => {
    // Filtre de recherche
    const matchesSearch = searchQuery === "" || 
      agentItem.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentItem.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentItem.numero_identification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agentItem.telephone.includes(searchQuery);
    
    // Filtre par statut
    const matchesStatus = statusFilter === "all" || agentItem.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculer les statistiques
  const activeCount = safeAgents.filter(a => a.statut === 'actif').length;
  const inactiveCount = safeAgents.filter(a => a.statut === 'inactif').length;
  const onTourCount = safeAgents.filter(a => a.statut === 'en_tournee').length;
  const withTricycleCount = safeAgents.filter(a => a.tricycle_plaque !== null).length;

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de chargement</h3>
          <p className="text-muted-foreground text-center mb-4">
            Impossible de charger les agents. Vérifiez votre connexion.
          </p>
          <Button onClick={() => { clearError(); fetchData(); }}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UsersIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Agents</h1>
              <p className="text-muted-foreground">
                Gérez vos agents de livraison et leurs affectations
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total agents</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : safeAgents.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Tous les agents enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <UserCheckIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : activeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Agents disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En tournée</CardTitle>
              <BikeIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : onTourCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Actuellement en livraison
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avec tricycle</CardTitle>
              <UserPlusIcon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : withTricycleCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Agents équipés
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Agents</CardTitle>
              <CardDescription>
                Liste de tous les agents de livraison
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCwIcon className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              
              <Button size="sm" onClick={handleCreate}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouvel agent
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom, téléphone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value: StatutAgent | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="actif">
                      <div className="flex items-center gap-2">
                        <UserCheckIcon className="h-4 w-4 text-green-500" />
                        Actifs
                      </div>
                    </SelectItem>
                    <SelectItem value="inactif">
                      <div className="flex items-center gap-2">
                        <UserXIcon className="h-4 w-4 text-red-500" />
                        Inactifs
                      </div>
                    </SelectItem>
                    <SelectItem value="en_tournee">
                      <div className="flex items-center gap-2">
                        <BikeIcon className="h-4 w-4 text-blue-500" />
                        En tournée
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${filteredAgents.length} agent(s) trouvé(s)`
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Total: {safeAgents.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && !agents ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Empty State */}
              {filteredAgents.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <UsersIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aucun agent trouvé</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchQuery || statusFilter !== "all" 
                      ? "Aucun agent ne correspond à vos critères de recherche."
                      : "Commencez par créer votre premier agent pour gérer votre équipe de livraison."}
                  </p>
                  {searchQuery || statusFilter !== "all" ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Effacer les filtres
                    </Button>
                  ) : (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Créer un agent
                    </Button>
                  )}
                </div>
              ) : (
                <AgentTable
                  agents={filteredAgents}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSuccess={selectedAgent ? handleAgentUpdated : handleAgentCreated}
      />

      <AgentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        agent={selectedAgent}
        onSuccess={handleAgentDeleted}
      />
    </div>
  );
}
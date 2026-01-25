"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgentTable } from "@/components/agents/agent-table";
import { AgentDialog } from "@/components/agents/agent-dialog";
import { AgentViewDialog } from "@/components/agents/agent-view-dialog";
import { AgentDeleteDialog } from "@/components/agents/agent-delete-dialog";
import { AgentPasswordDialog } from "@/components/agents/agent-password-dialog";
import { useUsers } from "@/lib/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilterIcon, RefreshCwIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AgentsPage() {
  const router = useRouter();
  const {
    agents,
    agentsCount,
    agentsLoading,
    agentsError,
    fetchAgents,
    fetchTricycles,
    tricycles,
    tricyclesLoading,
    clearErrors,
  } = useUsers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTricycle, setSelectedTricycle] = useState<string>("all");

  // Initial fetch
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchAgents(),
        fetchTricycles(),
      ]);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    }
  };

  const handleSearch = async () => {
    try {
      await fetchAgents({
        search: searchQuery,
        statut: statusFilter !== "all" ? statusFilter as any : undefined,
      });
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    }
  };

  const handleCreate = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  const handleView = (agent: any) => {
    setSelectedAgent(agent);
    setViewDialogOpen(true);
  };

  const handleEdit = (agent: any) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleDelete = (agent: any) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const handleChangePassword = (agent: any) => {
    setSelectedAgent(agent);
    setPasswordDialogOpen(true);
  };

  const handleAgentCreated = () => {
    setDialogOpen(false);
    fetchAgents();
    toast.success("Agent créé avec succès");
  };

  const handleAgentUpdated = () => {
    setDialogOpen(false);
    fetchAgents();
    toast.success("Agent mis à jour avec succès");
  };

  const handleAgentDeleted = () => {
    setDeleteDialogOpen(false);
    fetchAgents();
    toast.success("Agent supprimé avec succès");
  };

  const handlePasswordChanged = () => {
    setPasswordDialogOpen(false);
    toast.success("Mot de passe modifié avec succès");
  };

  const handleStatusFilter = async (value: string) => {
    setStatusFilter(value);
    try {
      await fetchAgents({
        statut: value !== "all" ? value as any : undefined,
        search: searchQuery || undefined,
      });
    } catch (error) {
      toast.error("Erreur lors du filtrage");
    }
  };

  const handleTricycleFilter = async (value: string) => {
    setSelectedTricycle(value);
    // Note: L'API ne supporte pas directement le filtre par tricycle
    // On peut filtrer côté client ou implémenter une logique différente
    if (value === "all") {
      fetchAgents();
    }
  };

  if (agentsError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">{agentsError}</div>
        <Button onClick={() => { clearErrors(); fetchData(); }}>
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
            <h1 className="text-2xl font-bold tracking-tight">Gestion des Agents</h1>
            <p className="text-muted-foreground">
              Gérez vos agents commerciaux et livreurs ({agentsCount} agents)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={agentsLoading || tricyclesLoading}
            >
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouvel agent
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher un agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="max-w-sm"
            />
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={agentsLoading}
            >
              <FilterIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="en_tournee">En tournée</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedTricycle} onValueChange={handleTricycleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tricycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tricycles</SelectItem>
                <SelectItem value="none">Sans tricycle</SelectItem>
                {Array.isArray(tricycles) && tricycles.map((tricycle) => (
                  <SelectItem key={tricycle.id} value={tricycle.id.toString()}>
                    {tricycle.plaque_immatriculation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Agents actifs</div>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.statut === "actif").length}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">En tournée</div>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.statut === "en_tournee").length}
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Tricycles assignés</div>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.tricycle_plaque).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <AgentTable
            agents={agents}
            loading={agentsLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onChangePassword={handleChangePassword}
          />
        </div>
      </div>

      {/* Dialogs */}
      <AgentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        tricycles={tricycles}
        onSuccess={selectedAgent ? handleAgentUpdated : handleAgentCreated}
      />

      <AgentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        agent={selectedAgent}
      />

      <AgentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        agent={selectedAgent}
        onSuccess={handleAgentDeleted}
      />

      <AgentPasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        agent={selectedAgent}
        onSuccess={handlePasswordChanged}
      />
    </div>
  );
}
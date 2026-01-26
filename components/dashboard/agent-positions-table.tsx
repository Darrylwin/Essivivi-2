"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Clock, 
  Navigation, 
  ExternalLink, 
  Filter,
  User,
  Calendar
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { PositionAgent, AgentEnTournee } from "@/lib/types";

interface AgentPositionsTableProps {
  positions: PositionAgent[];
  agentsEnTournee: AgentEnTournee[];
  loading?: boolean;
}

export function AgentPositionsTable({ 
  positions, 
  agentsEnTournee, 
  loading = false 
}: AgentPositionsTableProps) {
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("timestamp");

  // Traiter et filtrer les données
  const processedPositions = positions
    .filter(pos => {
      if (filterAgent === "all") return true;
      if (filterAgent === "in_tour") {
        return agentsEnTournee.some(a => a.agent_id === pos.agent);
      }
      return pos.agent.toString() === filterAgent;
    })
    .sort((a, b) => {
      if (sortBy === "timestamp") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === "agent") {
        return a.agent_nom.localeCompare(b.agent_nom);
      }
      return 0;
    });

  // Agents distincts pour le filtre
  const uniqueAgents = Array.from(
    new Map(positions.map(pos => [pos.agent, {
      id: pos.agent,
      name: `${pos.agent_nom} ${pos.agent_prenom}`,
      numero: pos.agent_numero
    }])).values()
  );

  // Formatage des données
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Positions GPS des agents
            </CardTitle>
            <CardDescription>
              {positions.length} position(s) enregistrée(s)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={filterAgent} onValueChange={setFilterAgent}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les agents</SelectItem>
                <SelectItem value="in_tour">En tournée uniquement</SelectItem>
                {uniqueAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Date récente</SelectItem>
                <SelectItem value="agent">Nom d&apos;agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {processedPositions.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Aucune position trouvée</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedPositions.slice(0, 20).map((position) => {
                  const isInTour = agentsEnTournee.some(a => a.agent_id === position.agent);
                  const timeAgo = getTimeAgo(position.timestamp);
                  
                  return (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {position.agent_nom} {position.agent_prenom}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {position.agent_numero}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>Lat: {parseFloat(position.latitude).toFixed(6)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Navigation className="h-3 w-3" />
                            <span>Lng: {parseFloat(position.longitude).toFixed(6)}</span>
                          </div>
                          {position.vitesse && (
                            <div className="text-xs text-muted-foreground">
                              Vitesse: {position.vitesse} km/h
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isInTour ? "default" : "outline"}>
                          {isInTour ? "En tournée" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatTime(position.timestamp)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(position.timestamp)} • {timeAgo}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir sur carte
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
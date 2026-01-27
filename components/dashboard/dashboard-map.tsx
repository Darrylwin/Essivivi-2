"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Map } from "lucide-react";
import type { PositionAgent, AgentEnTournee } from "@/lib/types";

// Déclaration globale pour Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface DashboardMapProps {
  positions: PositionAgent[];
  agentsEnTournee?: AgentEnTournee[];
  loading?: boolean;
  showHeatmap?: boolean;
  showTrails?: boolean;
}

export function DashboardMap({
  positions,
  agentsEnTournee = [],
  loading = false,
  showHeatmap = false,
  showTrails = false
}: DashboardMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Charger Leaflet dynamiquement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      try {
        // Charger Leaflet et son CSS
        const L = await import('leaflet');
        
        // Sauvegarder dans window pour l'utiliser ailleurs
        window.L = L.default || L;
        
        // Utiliser les URLs CDN pour les images
        delete (window.L.Icon.Default.prototype as any)._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        
        setLeafletLoaded(true);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    loadLeaflet();
  }, []);

  // Initialiser la carte quand Leaflet est chargé
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    
    const initMap = () => {
      try {
        // Default view: center on Togo (Lomé) with country-level zoom
        const map = L.map(mapContainerRef.current!).setView([6.1725, 1.2314], 7);
        mapRef.current = map;

        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        setMapReady(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    };

    const cleanup = initMap();
    return cleanup;
  }, [leafletLoaded]);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!mapRef.current || !mapReady || loading || !leafletLoaded || !window.L) return;

    const L = window.L;
    const map = mapRef.current;
    
    // Nettoyer les anciens marqueurs
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (positions.length === 0) return;

    // Créer un groupe pour les marqueurs
    const markers: any[] = [];
    const positionsByAgent: { [key: number]: PositionAgent[] } = {};

    // Regrouper les positions par agent
    positions.forEach(pos => {
      if (!positionsByAgent[pos.agent]) {
        positionsByAgent[pos.agent] = [];
      }
      positionsByAgent[pos.agent].push(pos);
    });

    // Créer les marqueurs et les tracés
    Object.entries(positionsByAgent).forEach(([agentId, agentPositions]) => {
      const positionsSorted = agentPositions.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Tracé de parcours
      if (showTrails && positionsSorted.length > 1 && L.Polyline) {
        const latlngs = positionsSorted.map(pos => 
          L.latLng(parseFloat(pos.latitude), parseFloat(pos.longitude))
        );
        
        L.polyline(latlngs, {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7,
          smoothFactor: 1
        }).addTo(map);
      }

      // Marqueur pour la dernière position
      const lastPos = positionsSorted[positionsSorted.length - 1];
      if (lastPos && L.marker) {
        const lat = parseFloat(lastPos.latitude);
        const lng = parseFloat(lastPos.longitude);
        const isInTour = agentsEnTournee.some(a => a.agent_id === lastPos.agent);
        
        // Créer une icône personnalisée avec HTML
        const customIcon = L.divIcon({
          html: `
            <div class="relative" style="transform: translate(-50%, -50%)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                isInTour 
                  ? 'bg-blue-500 border-2 border-white shadow-lg' 
                  : 'bg-gray-500 border-2 border-white'
              }">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  ${isInTour 
                    ? '<path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>'
                    : '<path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>'
                  }
                </svg>
              </div>
              ${isInTour 
                ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>'
                : ''
              }
            </div>
          `,
          className: 'leaflet-div-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 200px; padding: 8px">
              <h3 style="font-weight: bold; font-size: 0.875rem">${lastPos.agent_nom} ${lastPos.agent_prenom}</h3>
              <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 8px">${lastPos.agent_numero}</p>
              <div style="font-size: 0.75rem; display: grid; gap: 4px">
                <div style="display: flex; justify-content: space-between">
                  <span style="color: #6b7280">Heure:</span>
                  <span style="font-weight: 500">${new Date(lastPos.timestamp).toLocaleTimeString('fr-FR')}</span>
                </div>
                <div style="display: flex; justify-content: space-between">
                  <span style="color: #6b7280">Date:</span>
                  <span style="font-weight: 500">${new Date(lastPos.timestamp).toLocaleDateString('fr-FR')}</span>
                </div>
                ${lastPos.vitesse ? `
                <div style="display: flex; justify-content: space-between">
                  <span style="color: #6b7280">Vitesse:</span>
                  <span style="font-weight: 500">${lastPos.vitesse} km/h</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between">
                  <span style="color: #6b7280">Précision:</span>
                  <span style="font-weight: 500">${lastPos.precision || 'N/A'} m</span>
                </div>
              </div>
            </div>
          `);
        
        markers.push(marker);
      }
    });

    // Ajuster la vue si on a des marqueurs
    if (markers.length > 0 && L.featureGroup) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

  }, [positions, agentsEnTournee, mapReady, loading, leafletLoaded, showTrails]);

  if (loading) {
    return (
      <Card className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!leafletLoaded ? (
        <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <Map className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carte en cours de chargement...</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
          
          {/* Légende */}
          <div className="absolute bottom-4 left-4 rounded-lg p-3 shadow-lg z-[1000]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-xs">Agent en tournée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-xs">Agent inactif</span>
              </div>
              {showTrails && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-blue-500 rounded"></div>
                  <span className="text-xs">Trajet effectué</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="absolute top-4 right-4 rounded-lg p-3 shadow-lg z-[1000]">
            <div className="space-y-1">
              <div className="text-xs font-medium">Statistiques</div>
              <div className="text-xs">Agents: {new Set(positions.map(p => p.agent)).size}</div>
              <div className="text-xs">Points: {positions.length}</div>
              {agentsEnTournee.length > 0 && (
                <div className="text-xs">En tournée: {agentsEnTournee.length}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
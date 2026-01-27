/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinIcon } from "lucide-react";
import type { Commande } from "@/lib/types";

interface CommandeMapProps {
  commandes: Commande[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (commande: Commande) => void;
}

export function CommandeMap({
  commandes,
  center = [6.3724773, 2.3544781], // Cotonou par défaut
  zoom = 12,
  height = "400px",
  onMarkerClick,
}: CommandeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    const loadMap = async () => {
      try {
        // Dynamic import de Leaflet pour éviter le SSR
        const L = await import("leaflet");

        if (!mapInstanceRef.current) {
          // Initialize map
          mapInstanceRef.current = L.map(mapRef.current!).setView(center, zoom);

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);
        }

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Create custom icons
        const createIcon = (color: string) => L.divIcon({
          html: `
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          className: "custom-marker",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const statusColors = {
          en_attente: "#f97316", // orange
          acceptee: "#3b82f6", // blue
          en_cours: "#8b5cf6", // violet
          livree: "#10b981", // green
          annulee: "#ef4444", // red
        };

        // Add markers for each commande
        commandes.forEach((commande) => {
          const lat = parseFloat(commande.latitude_livraison);
          const lon = parseFloat(commande.longitude_livraison);

          if (isNaN(lat) || isNaN(lon)) return;

          const color = statusColors[commande.statut as keyof typeof statusColors] || "#6b7280";
          const icon = createIcon(color);

          const marker = L.marker([lat, lon], { icon })
            .addTo(mapInstanceRef.current!)
            .bindPopup(`
              <div style="min-width: 200px; padding: 8px;">
                <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #333;">
                  Commande #${commande.id}
                </h4>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                  ${commande.client_nom}
                </p>
                <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
                  ${commande.quantite_totale} unités • ${parseFloat(commande.montant_total).toLocaleString('fr-FR')} FCFA
                </p>
                <span style="display: inline-block; padding: 2px 8px; background: ${color}; color: white; border-radius: 12px; font-size: 11px;">
                  ${commande.statut}
                </span>
              </div>
            `);

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(commande));
          }

          markersRef.current.push(marker);
        });

        // Fit bounds to include all markers
        if (markersRef.current.length > 0) {
          const group = L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        }

      } catch (error) {
        console.error("Error loading map:", error);
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [commandes, center, zoom, onMarkerClick]);

  if (commandes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center" style={{ height }}>
          <MapPinIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune commande à afficher sur la carte</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div
          ref={mapRef}
          style={{ height }}
          className="rounded-lg overflow-hidden"
        />
      </CardContent>
    </Card>
  );
}
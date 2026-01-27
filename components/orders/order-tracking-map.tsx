"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPinIcon, TruckIcon, NavigationIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard";
import type { Map as LeafletMapType, Marker, Polyline, DivIcon } from "leaflet";

interface OrderTrackingMapProps {
  deliveryLocation: { lat: number; lng: number };
  orderId: number;
  agentId?: number;
}

export function OrderTrackingMap({
  deliveryLocation,
  orderId,
  agentId,
}: OrderTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMapType | null>(null);
  const deliveryMarkerRef = useRef<Marker | null>(null);
  const agentMarkerRef = useRef<Marker | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const isInitializedRef = useRef(false);
  
  const [loading, setLoading] = useState(true);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  
  const { fetchPositions, positions } = useTrackingDashboard();

  // Fetch agent position periodically
  const fetchAgentPosition = useCallback(async () => {
    if (!agentId) return;
    
    try {
      await fetchPositions({ agent_id: agentId });
    } catch (error) {
      console.error("Error fetching agent position:", error);
    }
  }, [agentId, fetchPositions]);

  useEffect(() => {
    if (agentId) {
      fetchAgentPosition();
      
      // Poll for position updates every 10 seconds
      const interval = setInterval(fetchAgentPosition, 10000);
      
      return () => clearInterval(interval);
    }
  }, [agentId, fetchAgentPosition]);

  // Update agent location when positions change
  useEffect(() => {
    if (positions && positions.length > 0) {
      const latestPosition = positions[0];
      setAgentLocation({
        lat: parseFloat(latestPosition.latitude),
        lng: parseFloat(latestPosition.longitude),
      });
    }
  }, [positions]);

  // Initialize map with Leaflet
  useEffect(() => {
    if (!mapRef.current || isInitializedRef.current) return;

    const loadMap = async () => {
      try {
        // Dynamic import de Leaflet pour éviter le SSR
        const L = await import("leaflet");

        // Marquer comme initialisé immédiatement
        isInitializedRef.current = true;

        // Fix for default marker icons in Leaflet
        const iconDefault = L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void };
        delete iconDefault._getIconUrl;
        
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map
        const map = L.map(mapRef.current!).setView(
          [deliveryLocation.lat, deliveryLocation.lng],
          13
        );

        // Add tile layer (OpenStreetMap - gratuit)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add delivery marker
        const deliveryIcon: DivIcon = L.divIcon({
          html: `
            <div style="
              background-color: #ef4444;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" style="transform: rotate(45deg);">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          `,
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const deliveryMarker = L.marker(
          [deliveryLocation.lat, deliveryLocation.lng],
          { icon: deliveryIcon }
        ).addTo(map);

        deliveryMarker.bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #333;">Point de livraison</h3>
            <p style="color: #666; font-size: 12px; margin-bottom: 4px;">Commande #${orderId}</p>
            <p style="font-size: 11px; color: #999;">
              ${deliveryLocation.lat.toFixed(6)}, ${deliveryLocation.lng.toFixed(6)}
            </p>
          </div>
        `).openPopup();

        deliveryMarkerRef.current = deliveryMarker;
        setLoading(false);
      } catch (error) {
        console.error("Error loading map:", error);
        setLoading(false);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [deliveryLocation, orderId]);

  // Add/Update agent marker and route
  useEffect(() => {
    if (!mapInstanceRef.current || !agentLocation) return;

    const updateAgentMarker = async () => {
      const L = await import("leaflet");

      // Remove old markers and route
      if (agentMarkerRef.current) {
        agentMarkerRef.current.remove();
      }
      if (routeLineRef.current) {
        routeLineRef.current.remove();
      }

      // Create agent marker icon
      const agentIcon: DivIcon = L.divIcon({
        html: `
          <div style="
            background-color: #3b82f6;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M5 17h14v2H5v-2zm7-12l6 7H6l6-7z"></path>
            </svg>
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              width: 12px;
              height: 12px;
              background-color: #10b981;
              border: 2px solid white;
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.1); }
            }
          </style>
        `,
        className: "agent-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const agentMarker = L.marker(
        [agentLocation.lat, agentLocation.lng],
        { icon: agentIcon }
      ).addTo(mapInstanceRef.current!);

      agentMarker.bindPopup(`
        <div style="padding: 8px; min-width: 180px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: #333;">Agent de livraison</h3>
          <p style="font-size: 11px; color: #10b981; margin-bottom: 4px;">● En ligne</p>
          <p style="font-size: 11px; color: #999;">
            ${agentLocation.lat.toFixed(6)}, ${agentLocation.lng.toFixed(6)}
          </p>
        </div>
      `);

      agentMarkerRef.current = agentMarker;

      // Draw route line
      const routeLine = L.polyline(
        [
          [agentLocation.lat, agentLocation.lng],
          [deliveryLocation.lat, deliveryLocation.lng],
        ],
        {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          dashArray: '10, 10',
        }
      ).addTo(mapInstanceRef.current!);

      routeLineRef.current = routeLine;

      // Calculate distance using Haversine formula
      const R = 6371; // Radius of the Earth in km
      const dLat = (deliveryLocation.lat - agentLocation.lat) * Math.PI / 180;
      const dLon = (deliveryLocation.lng - agentLocation.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(agentLocation.lat * Math.PI / 180) * Math.cos(deliveryLocation.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = R * c;

      setDistance(`${distanceKm.toFixed(2)} km`);
      
      // Estimate duration (assuming average speed of 30 km/h)
      const durationMinutes = Math.round((distanceKm / 30) * 60);
      setDuration(`${durationMinutes} min`);

      // Fit bounds to show both markers
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(agentLocation.lat, deliveryLocation.lat),
          Math.min(agentLocation.lng, deliveryLocation.lng)
        ],
        [
          Math.max(agentLocation.lat, deliveryLocation.lat),
          Math.max(agentLocation.lng, deliveryLocation.lng)
        ]
      ];
      
      mapInstanceRef.current?.fitBounds(bounds, { padding: [50, 50] });
    };

    updateAgentMarker();
  }, [agentLocation, deliveryLocation]);

  const handleCenterMap = () => {
    if (!mapInstanceRef.current) return;

    if (agentLocation) {
      const bounds: [[number, number], [number, number]] = [
        [
          Math.min(agentLocation.lat, deliveryLocation.lat),
          Math.min(agentLocation.lng, deliveryLocation.lng)
        ],
        [
          Math.max(agentLocation.lat, deliveryLocation.lat),
          Math.max(agentLocation.lng, deliveryLocation.lng)
        ]
      ];
      
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      mapInstanceRef.current.setView(
        [deliveryLocation.lat, deliveryLocation.lng],
        13
      );
    }
  };

  const handleRefresh = () => {
    fetchAgentPosition();
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-b-lg"
        style={{ minHeight: "500px" }}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-b-lg">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
          {agentLocation && (
            <div className="bg-white rounded-lg shadow-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-semibold">Agent en route</span>
              </div>
              {distance && duration && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <NavigationIcon className="h-3 w-3" />
                    <span>{distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏱️</span>
                    <span>~{duration}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!agentLocation && agentId && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Agent non localisé
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {agentId && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white shadow-lg hover:bg-gray-50"
              onClick={handleRefresh}
            >
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="bg-white shadow-lg hover:bg-gray-50"
            onClick={handleCenterMap}
          >
            <NavigationIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
          <span className="text-xs">Point de livraison</span>
        </div>
        {agentLocation && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              </div>
              <span className="text-xs">Agent en ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500 opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(to right, #3b82f6 0, #3b82f6 10px, transparent 10px, transparent 20px)' }} />
              <span className="text-xs">Itinéraire estimé</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
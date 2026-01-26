"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPinIcon, TruckIcon, NavigationIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrackingDashboard } from "@/lib/hooks/useTrackingDashboard";

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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [deliveryMarker, setDeliveryMarker] = useState<google.maps.Marker | null>(null);
  const [agentMarker, setAgentMarker] = useState<google.maps.Marker | null>(null);
  const [routeLine, setRouteLine] = useState<google.maps.Polyline | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentLocation, setAgentLocation] = useState<{ lat: number; lng: number } | null>(null);
  
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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const googleMap = new google.maps.Map(mapRef.current, {
      center: deliveryLocation,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    setMap(googleMap);
    setLoading(false);
  }, [deliveryLocation, map]);

  // Add/Update delivery marker
  useEffect(() => {
    if (!map) return;

    if (deliveryMarker) {
      deliveryMarker.setMap(null);
    }

    const marker = new google.maps.Marker({
      position: deliveryLocation,
      map,
      title: "Point de livraison",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#ef4444",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      },
      animation: google.maps.Animation.DROP,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">Point de livraison</h3>
          <p style="color: #666; font-size: 12px;">Commande #${orderId}</p>
          <p style="font-size: 12px; margin-top: 4px;">
            ${deliveryLocation.lat.toFixed(6)}, ${deliveryLocation.lng.toFixed(6)}
          </p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    setDeliveryMarker(marker);

    // Auto-open info window
    infoWindow.open(map, marker);
  }, [map, deliveryLocation, orderId, deliveryMarker]);

  // Add/Update agent marker and route
  useEffect(() => {
    if (!map || !agentLocation) return;

    // Remove old agent marker
    if (agentMarker) {
      agentMarker.setMap(null);
    }

    // Create agent marker
    const marker = new google.maps.Marker({
      position: agentLocation,
      map,
      title: "Position de l'agent",
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        rotation: 0,
      },
      animation: google.maps.Animation.DROP,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">Agent de livraison</h3>
          <p style="font-size: 12px; margin-top: 4px;">
            ${agentLocation.lat.toFixed(6)}, ${agentLocation.lng.toFixed(6)}
          </p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    setAgentMarker(marker);

    // Calculate and draw route
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: agentLocation,
        destination: deliveryLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          // Remove old route
          if (routeLine) {
            routeLine.setMap(null);
          }

          // Draw new route
          const path = result.routes[0].overview_path;
          const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#3b82f6",
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map,
          });

          setRouteLine(polyline);

          // Extract distance and duration
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance?.text || null);
          setDuration(leg.duration?.text || null);

          // Fit bounds to show both markers
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(agentLocation);
          bounds.extend(deliveryLocation);
          map.fitBounds(bounds);
        }
      }
    );
  }, [map, agentLocation, deliveryLocation, agentMarker, routeLine]);

  const handleCenterMap = () => {
    if (!map) return;

    if (agentLocation && deliveryLocation) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(agentLocation);
      bounds.extend(deliveryLocation);
      map.fitBounds(bounds);
    } else {
      map.setCenter(deliveryLocation);
      map.setZoom(13);
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
                    <span>{duration}</span>
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
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
          <span className="text-xs">Point de livraison</span>
        </div>
        {agentLocation && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 border-2 border-white" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
              <span className="text-xs">Agent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-blue-500" />
              <span className="text-xs">Itinéraire</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Add Google Maps script loader
if (typeof window !== "undefined" && !window.google) {
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
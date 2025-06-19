"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";

// Import Leaflet dynamically to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  className?: string;
  height?: number;
}

export function InteractiveMap({
  latitude,
  longitude,
  className = "",
  height = 300,
}: InteractiveMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Default coordinates (Madrid, Spain) if no coordinates provided
  const defaultLat = 40.4168;
  const defaultLng = -3.7038;

  const displayLat = latitude ?? defaultLat;
  const displayLng = longitude ?? defaultLng;

  useEffect(() => {
    // Fix for Leaflet icon issue in Next.js
    if (typeof window !== "undefined") {
      const loadLeafletIcons = async () => {
        const L = await import("leaflet");
        
        // Fix default icon issue
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "/marker-icon-2x.png",
          iconUrl: "/marker-icon.png",
          shadowUrl: "/marker-shadow.png",
        });
      };
      
      loadLeafletIcons();
    }
  }, []);

  useEffect(() => {
    // Pan to new coordinates when they change
    if (mapRef.current && latitude && longitude) {
      mapRef.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  if (typeof window === "undefined") {
    return (
      <div
        className={`bg-muted rounded-lg flex items-center justify-center ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-muted-foreground text-sm">Cargando mapa...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <MapContainer
        center={[displayLat, displayLng]}
        zoom={latitude && longitude ? 13 : 2}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {latitude && longitude && (
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Ubicación Seleccionada</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {latitude.toFixed(6)}
                  <br />
                  Lng: {longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {!latitude || !longitude ? (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center text-muted-foreground">
            <p className="text-sm font-medium">Selecciona coordenadas</p>
            <p className="text-xs">Para visualizar en el mapa</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

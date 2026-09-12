import { useEffect, useRef } from "react";
import L from "leaflet";
import { RecommendationItem } from "@tteum/contracts";
import { Navigation } from "lucide-react";

interface MapViewProps {
  userLocation: { lat: number; lng: number };
  recommendations: RecommendationItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  isCollapsed?: boolean;
}

export default function MapView({
  userLocation,
  recommendations,
  selectedIndex,
  onSelectIndex,
  isCollapsed = false,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const walkingRouteRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([userLocation.lat, userLocation.lng], 15);

      // VWorld Official Base Map Tile with Editorial Low-Saturation Filter
      L.tileLayer("/api/tiles/vworld/Base/{z}/{y}/{x}.png", {
        minZoom: 7,
        maxZoom: 19,
        className: "editorial-vworld-tile",
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update user location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: "user-loc-marker",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #E46F5D; opacity: 0.3; animation: pulse 2s infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #E46F5D; border: 2.5px solid #FAF8F3; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 100,
    }).addTo(map);
  }, [userLocation]);

  // Recenter/frame user and selected destination
  const frameSelectedRoute = (animated = true) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const target = recommendations[selectedIndex]?.place;
    if (!target) return;

    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lng],
      [target.lat, target.lng]
    );

    // Dynamic padding: top leaves room for status bar (130px), bottom leaves room for BottomSheet (320px or 110px)
    map.fitBounds(bounds, {
      paddingTopLeft: [50, 135],
      paddingBottomRight: [50, isCollapsed ? 115 : 325],
      maxZoom: 17,
      animate: animated,
      duration: 0.5,
    });
  };

  // Update recommendation markers with interactive callouts
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (recommendations.length === 0) return;

    recommendations.forEach((rec, idx) => {
      const isSelected = idx === selectedIndex;
      const markerHtml = `
        <div class="custom-tteum-marker ${isSelected ? "selected" : ""}" style="cursor: pointer; position: relative;">
          ${
            isSelected
              ? `<div class="marker-callout">
                  <span>${rec.place.name}</span>
                  <span class="callout-time">도보 ${rec.timeline.outboundMinutes}분</span>
                </div>`
              : ""
          }
          <div class="marker-pin" style="
            background: ${isSelected ? "var(--color-coral)" : "var(--color-ink)"};
            transform: ${isSelected ? "scale(1.18)" : "scale(1)"};
            border-color: #FAF8F3;
          ">
            ${idx + 1}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: "leaflet-custom-pin",
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([rec.place.lat, rec.place.lng], {
        icon,
        zIndexOffset: isSelected ? 600 : 200,
      })
        .addTo(map)
        .on("click", () => {
          onSelectIndex(idx);
        });

      markersRef.current.push(marker);
    });
  }, [recommendations, selectedIndex, onSelectIndex]);

  // Update walking polyline & re-frame view when selected destination or collapse changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !recommendations[selectedIndex]) return;

    const target = recommendations[selectedIndex].place;

    // Draw dashed walking polyline
    if (walkingRouteRef.current) {
      walkingRouteRef.current.remove();
    }

    walkingRouteRef.current = L.polyline(
      [
        [userLocation.lat, userLocation.lng],
        [target.lat, target.lng],
      ],
      {
        color: "#E46F5D",
        weight: 3.5,
        dashArray: "6, 8",
        opacity: 0.85,
        lineCap: "round",
      }
    ).addTo(map);

    frameSelectedRoute(true);
  }, [selectedIndex, isCollapsed, userLocation, recommendations]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Floating Recenter Route Button */}
      <button
        type="button"
        onClick={() => frameSelectedRoute(true)}
        title="경로 재정렬"
        aria-label="경로 재정렬"
        style={{
          position: "absolute",
          right: "16px",
          bottom: isCollapsed ? "105px" : "315px",
          zIndex: 25,
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          backgroundColor: "rgba(250, 248, 243, 0.96)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(32, 37, 34, 0.12)",
          boxShadow: "0 4px 14px rgba(32, 37, 34, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease",
          color: "var(--color-ink)",
        }}
      >
        <Navigation size={18} />
      </button>
    </div>
  );
}

import { useEffect, useRef } from "react";
import L from "leaflet";
import { RecommendationItem } from "@tteum/contracts";

interface MapViewProps {
  userLocation: { lat: number; lng: number };
  recommendations: RecommendationItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

export default function MapView({
  userLocation,
  recommendations,
  selectedIndex,
  onSelectIndex,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
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

    return () => {
      // Keep map alive across standard re-renders unless unmounted completely
    };
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

  // Update recommendation markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (recommendations.length === 0) return;

    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lng],
      [userLocation.lat, userLocation.lng]
    );

    recommendations.forEach((rec, idx) => {
      const isSelected = idx === selectedIndex;
      const markerHtml = `
        <div class="custom-tteum-marker ${isSelected ? "selected" : ""}" style="cursor: pointer;">
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

      const marker = L.marker([rec.place.lat, rec.place.lng], { icon })
        .addTo(map)
        .on("click", () => {
          onSelectIndex(idx);
        });

      bounds.extend([rec.place.lat, rec.place.lng]);
      markersRef.current.push(marker);
    });

    // Center to bounds with padding for bottom sheet
    map.fitBounds(bounds, {
      paddingTopLeft: [40, 40],
      paddingBottomRight: [40, 240], // leave room for recommendation card
      maxZoom: 16,
    });
  }, [recommendations, selectedIndex, onSelectIndex, userLocation]);

  // Pan to selected item
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !recommendations[selectedIndex]) return;

    const target = recommendations[selectedIndex].place;
    map.panTo([target.lat, target.lng], { animate: true, duration: 0.5 });
  }, [selectedIndex, recommendations]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    />
  );
}

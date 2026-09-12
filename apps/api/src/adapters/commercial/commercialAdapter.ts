import { CommercialDistrict, NearbyCafe } from "@tteum/contracts";
import { COMMERCIAL_FIXTURES } from "../../fixtures/commercialFixture.js";
import { config } from "../../config/env.js";

/**
 * Calculate distance in meters using Haversine formula
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Find commercial district & nearby cafes around coordinates
 */
export async function getNearbyCommercialAndCafes(params: {
  lat: number;
  lng: number;
  areaName?: string;
  maxDistanceMeters?: number;
}): Promise<{
  commercialDistrict: CommercialDistrict;
  nearbyCafes: NearbyCafe[];
}> {
  const { lat, lng, areaName = "", maxDistanceMeters = 800 } = params;

  // 1. Resolve fixture data matching area or closest fixture
  let matchedFixture = COMMERCIAL_FIXTURES[areaName];
  if (!matchedFixture) {
    // Try substring matching (e.g. "일원", "수서", "시청", "정동", "삼성")
    for (const [key, data] of Object.entries(COMMERCIAL_FIXTURES)) {
      if (areaName.includes(key) || key.includes(areaName)) {
        matchedFixture = data;
        break;
      }
    }
  }

  // Fallback to closest fixture or default Ilwon / CityHall
  if (!matchedFixture) {
    if (lat < 37.52) {
      matchedFixture = COMMERCIAL_FIXTURES["강남구 일원동"];
    } else {
      matchedFixture = COMMERCIAL_FIXTURES["시청·서소문"];
    }
  }

  // 2. Try optional live VWorld search POI if available and fast
  let liveCafes: NearbyCafe[] = [];
  if (config.vworld.apiKey) {
    try {
      const searchWord = areaName ? `${areaName.replace(/·/g, " ")} 카페` : "카페";
      const vworldUrl = `https://api.vworld.kr/req/search?service=search&request=search&version=2.0&crs=EPSG:4326&size=5&page=1&query=${encodeURIComponent(
        searchWord
      )}&type=PLACE&format=json&key=${config.vworld.apiKey}`;
      const res = await fetch(vworldUrl, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        const items = data?.response?.result?.items || [];
        for (const item of items) {
          const itemLat = parseFloat(item.point?.y);
          const itemLng = parseFloat(item.point?.x);
          if (!isNaN(itemLat) && !isNaN(itemLng)) {
            const dist = calculateDistanceMeters(lat, lng, itemLat, itemLng);
            if (dist <= maxDistanceMeters) {
              const walkingMins = Math.max(1, Math.ceil(dist / 70));
              liveCafes.push({
                id: `vworld-cafe-${item.id || Math.random().toString(36).substring(2, 7)}`,
                name: item.title?.replace(/<[^>]*>?/gm, "") || "로컬 카페",
                category: "소상공인 카페",
                distanceMeters: dist,
                walkingMinutes: walkingMins,
                lat: itemLat,
                lng: itemLng,
                address: item.address?.road || item.address?.parcel || "",
                businessType: "소상공인 독립점포",
                quietScore: "아늑함",
              });
            }
          }
        }
      }
    } catch {
      // Graceful fallback to fixture cafes
    }
  }

  // 3. Map fixture cafes with calculated real distance from this place
  const fixtureCafes: NearbyCafe[] = matchedFixture.cafes.map((c) => {
    const dist = calculateDistanceMeters(lat, lng, c.lat, c.lng);
    const walkingMins = Math.max(1, Math.ceil(dist / 70));
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      distanceMeters: dist,
      walkingMinutes: walkingMins,
      lat: c.lat,
      lng: c.lng,
      address: c.address,
      signatureMenu: c.signatureMenu,
      businessType: c.businessType,
      quietScore: c.quietScore,
      openHours: c.openHours,
    };
  });

  // Combine and de-duplicate by name
  const combined = [...liveCafes, ...fixtureCafes];
  const uniqueMap = new Map<string, NearbyCafe>();
  for (const c of combined) {
    if (!uniqueMap.has(c.name)) {
      uniqueMap.set(c.name, c);
    }
  }

  // Sort by proximity
  const sortedCafes = Array.from(uniqueMap.values())
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, 3);

  return {
    commercialDistrict: matchedFixture.district,
    nearbyCafes: sortedCafes,
  };
}

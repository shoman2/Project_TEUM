import { FastifyPluginAsync } from "fastify";
import { config } from "../config/env.js";
import { getSeoulCitySnapshot } from "../adapters/seoul/seoulAdapter.js";

export const seoulRoutes: FastifyPluginAsync = async (fastify) => {
  // Preset areas supported in TEUM
  fastify.get("/api/areas", async (_req, _reply) => {
    return {
      areas: [
        { name: "서울광장·시청", center: { lat: 37.5663, lng: 126.9779 } },
        { name: "광화문·세종대로", center: { lat: 37.5714, lng: 126.9768 } },
        { name: "을지로", center: { lat: 37.5668, lng: 126.983 } },
        { name: "인사동·북촌", center: { lat: 37.5765, lng: 126.9847 } },
      ],
    };
  });

  // Snapshot for specific area
  fastify.get("/api/seoul/city/:areaName", async (req, reply) => {
    const { areaName } = req.params as { areaName: string };
    if (!areaName) {
      return reply.status(400).send({ message: "지역명이 필요합니다." });
    }

    const result = await getSeoulCitySnapshot(decodeURIComponent(areaName));
    return result;
  });

  // Reverse geocoding endpoint via VWorld & Nominatim fallbacks
  fastify.get("/api/location/reverse", async (req, reply) => {
    const { lat, lng } = req.query as { lat?: string; lng?: string };
    if (!lat || !lng) {
      return reply.status(400).send({ message: "lat and lng are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // 1. Try VWorld Geocoder API
    if (config.vworld.apiKey) {
      const vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${longitude},${latitude}&format=json&type=both&key=${config.vworld.apiKey}`;
      try {
        const res = await fetch(vworldUrl, { signal: AbortSignal.timeout(2000) });
        const text = await res.text();
        if (text.startsWith("{")) {
          const data = JSON.parse(text);
          const results = data?.response?.result;
          if (results && results.length > 0) {
            const item = results[0];
            const structure = item.structure;
            const full = item.text || "";
            const level2 = structure?.level2 || "";
            const level4L = structure?.level4L || structure?.level4A || "";
            const label = level2 && level4L ? `${level2} ${level4L}` : full.split(" ").slice(1, 3).join(" ") || "현재 위치";
            return { label, fullAddress: full, source: "vworld" };
          }
        }
      } catch {
        // Fall through to Nominatim
      }
    }

    // 2. Try Nominatim (OpenStreetMap) fallback - works globally without IP geo-blocks
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=ko`;
      const res = await fetch(osmUrl, {
        headers: { "User-Agent": "TTEUM-Seoul/1.0 (prototype)" },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data?.address;
        if (addr) {
          const borough = addr.borough || addr.suburb || addr.city_district || "";
          const neighborhood = addr.quarter || addr.suburb || addr.neighbourhood || addr.road || "";
          const label = borough && neighborhood ? `${borough} ${neighborhood}` : borough || neighborhood || data.name || "서울";
          return { label, fullAddress: data.display_name || "", source: "nominatim" };
        }
      }
    } catch {
      // Fall through to geographic proximity
    }

    // 3. Proximity lookup against key Seoul centers
    const seoulDistricts = [
      { name: "중구 태평로·명동", lat: 37.5663, lng: 126.9779 },
      { name: "종로구 광화문·세종대로", lat: 37.5714, lng: 126.9768 },
      { name: "중구 을지로", lat: 37.5668, lng: 126.983 },
      { name: "종로구 인사동·북촌", lat: 37.5765, lng: 126.9847 },
      { name: "영등포구 여의도", lat: 37.5284, lng: 126.9246 },
      { name: "강남구 역삼·테헤란로", lat: 37.4979, lng: 127.0276 },
      { name: "성동구 성수동·서울숲", lat: 37.5445, lng: 127.044 },
      { name: "마포구 홍대·연남", lat: 37.5563, lng: 126.9236 },
    ];

    let nearest = seoulDistricts[0];
    let minD = Infinity;
    for (const d of seoulDistricts) {
      const dist = Math.hypot(latitude - d.lat, longitude - d.lng);
      if (dist < minD) {
        minD = dist;
        nearest = d;
      }
    }

    if (minD < 0.1) {
      return { label: nearest.name, fullAddress: `서울특별시 ${nearest.name} 부근`, source: "proximity" };
    }

    return { label: "현재 위치", fullAddress: `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}`, source: "coords" };
  });

  // Approximate IP location endpoint (Vercel edge headers or fallback)
  fastify.get("/api/location/ip", async (req, _reply) => {
    const vLat = req.headers["x-vercel-ip-latitude"];
    const vLng = req.headers["x-vercel-ip-longitude"];
    const vCity = req.headers["x-vercel-ip-city"];

    if (vLat && vLng) {
      const lat = parseFloat(vLat as string);
      const lng = parseFloat(vLng as string);
      return {
        lat,
        lng,
        city: typeof vCity === "string" ? decodeURIComponent(vCity) : "서울",
        source: "vercel-edge",
      };
    }

    return {
      lat: 37.5663,
      lng: 126.9779,
      city: "서울시청",
      source: "default",
    };
  });
};


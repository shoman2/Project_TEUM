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

  // Reverse geocoding endpoint via VWorld
  fastify.get("/api/location/reverse", async (req, reply) => {
    const { lat, lng } = req.query as { lat?: string; lng?: string };
    if (!lat || !lng) {
      return reply.status(400).send({ message: "lat and lng are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (config.vworld.apiKey) {
      const vworldUrl = `https://api.vworld.kr/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${longitude},${latitude}&format=json&type=both&key=${config.vworld.apiKey}`;
      try {
        const res = await fetch(vworldUrl);
        const data = await res.json();
        const results = data?.response?.result;
        if (results && results.length > 0) {
          const item = results[0];
          // Extract structure: city, district, dong
          const structure = item.structure;
          const text = item.text || "";
          const level2 = structure?.level2 || ""; // e.g. 중구
          const level4L = structure?.level4L || structure?.level4A || ""; // e.g. 정동
          const label = level2 && level4L ? `${level2} ${level4L}` : text.split(" ").slice(1, 3).join(" ") || "현재 위치";
          return { label, fullAddress: text };
        }
        if ((req.query as any).debug) {
          return { debugData: data, hasKey: Boolean(config.vworld.apiKey), keyLength: config.vworld.apiKey.length };
        }
      } catch (err: any) {
        if ((req.query as any).debug) {
          return { error: err.message, hasKey: Boolean(config.vworld.apiKey) };
        }
      }
    }

    return { label: "현재 위치", fullAddress: `위도 ${latitude.toFixed(4)}, 경도 ${longitude.toFixed(4)}` };
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


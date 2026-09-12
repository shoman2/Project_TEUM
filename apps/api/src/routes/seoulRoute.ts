import { FastifyPluginAsync } from "fastify";
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
};

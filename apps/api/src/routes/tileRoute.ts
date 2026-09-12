import { FastifyPluginAsync } from "fastify";
import { config } from "../config/env.js";

export const tileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/tiles/vworld/:layer/:z/:y/:x", async (req, reply) => {
    const { layer, z, y, x } = req.params as {
      layer: string;
      z: string;
      y: string;
      x: string;
    };

    // Clean .png extension from x if present
    const cleanX = x.replace(/\.png$/, "");
    const targetLayer = layer === "Base" ? "Base" : "white";

    if (!config.vworld.apiKey) {
      // Fallback to OSM
      return reply.redirect(`https://tile.openstreetmap.org/${z}/${cleanX}/${y}.png`);
    }

    const vworldUrl = `https://api.vworld.kr/req/wmts/1.0.0/${config.vworld.apiKey}/${targetLayer}/${z}/${y}/${cleanX}.png`;

    try {
      const upstream = await fetch(vworldUrl);
      if (!upstream.ok) {
        // Fallback to OSM on upstream error
        return reply.redirect(`https://tile.openstreetmap.org/${z}/${cleanX}/${y}.png`);
      }

      const contentType = upstream.headers.get("content-type") || "image/png";
      if (!contentType.includes("image")) {
        // If VWorld returns XML error (out of boundary etc.), redirect to OSM
        return reply.redirect(`https://tile.openstreetmap.org/${z}/${cleanX}/${y}.png`);
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());

      reply
        .header("Content-Type", contentType)
        .header("Cache-Control", "public, max-age=259200, immutable")
        .send(buffer);
    } catch {
      reply.redirect(`https://tile.openstreetmap.org/${z}/${cleanX}/${y}.png`);
    }
  });
};

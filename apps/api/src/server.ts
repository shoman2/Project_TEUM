import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config/env.js";
import { recommendationRoutes } from "./routes/recommendationRoute.js";
import { sessionRoutes } from "./routes/sessionRoute.js";
import { seoulRoutes } from "./routes/seoulRoute.js";
import { tileRoutes } from "./routes/tileRoute.js";

export async function createServer() {
  const fastify = Fastify({
    logger: {
      level: config.env === "development" ? "info" : "warn",
    },
  });

  await fastify.register(cors, {
    origin: [config.webOrigin, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // Health check route
  fastify.get("/api/health", async (_req, _reply) => {
    return {
      status: "ok",
      service: "tteum-api",
      timestamp: new Date().toISOString(),
      seoulApiConfigured: Boolean(config.seoul.apiKey && config.seoul.apiKey !== "replace_me"),
      geminiConfigured: Boolean(config.gemini.apiKey && config.gemini.apiKey !== "replace_me"),
    };
  });

  // Register domain routes
  await fastify.register(recommendationRoutes);
  await fastify.register(sessionRoutes);
  await fastify.register(seoulRoutes);
  await fastify.register(tileRoutes);

  return fastify;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const server = await createServer();
  try {
    await server.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`[TTEUM API] Server running at http://localhost:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

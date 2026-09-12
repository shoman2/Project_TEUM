import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading from root or current dir
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3001),
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:5173",

  dbPath: process.env.DB_PATH || "./data/tteum.db",

  seoul: {
    apiKey: (process.env.SEOUL_API_KEY || process.env.SEOUL_OPENAPI_KEY || "").trim(),
    baseUrl: (process.env.SEOUL_API_BASE_URL || "http://openapi.seoul.go.kr:8088").trim(),
    service: (process.env.SEOUL_CITYDATA_SERVICE || "citydata").trim(),
    cacheSeconds: Number(process.env.CACHE_CITYDATA_SECONDS || 180),
    eventsCacheSeconds: Number(process.env.CACHE_EVENTS_SECONDS || 21600),
    timeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 8000),
  },

  vworld: {
    apiKey: (process.env.VWORLD_API_KEY || "").trim(),
  },

  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
    model: (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
    enabled: process.env.GEMINI_ENABLED !== "false",
    timeoutMs: 2500, // as per handoff section 22
  },
};

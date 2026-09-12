import { SeoulCitySnapshot } from "@tteum/contracts";
import { config } from "../../config/env.js";
import { SEOUL_CITYDATA_FIXTURES } from "../../fixtures/seoulCityDataFixture.js";

interface CacheItem<T> {
  data: T;
  cachedAt: number;
}

const memoryCache = new Map<string, CacheItem<SeoulCitySnapshot>>();

/**
 * Fetch with timeout helper
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Normalize Seoul City Data raw response to SeoulCitySnapshot
 */
function normalizeSeoulResponse(areaName: string, raw: any): SeoulCitySnapshot {
  const cityData = raw?.["CITYDATA"] || raw?.["CityData"] || {};
  const livePpl = cityData?.["LIVE_PPLTN_STTS"]?.[0] || {};
  const weather = cityData?.["WEATHER_STTS"]?.[0] || {};
  const rawEvents = cityData?.["EVENT_STTS"] || [];

  // Map crowd level: '여유' -> relaxed, '보통' -> normal, '약간 붐빔' -> busy, '붐빔' -> very_busy
  let level: "relaxed" | "normal" | "busy" | "very_busy" | "unknown" = "unknown";
  const crowdStr = livePpl["AREA_CONGEST_LVL"] || "";
  if (crowdStr.includes("여유")) level = "relaxed";
  else if (crowdStr.includes("보통")) level = "normal";
  else if (crowdStr.includes("약간 붐빔")) level = "busy";
  else if (crowdStr.includes("붐빔")) level = "very_busy";
  else level = "normal";

  return {
    areaName,
    capturedAt: livePpl["PPLTN_TIME"] || new Date().toISOString(),
    population: {
      level,
      min: Number(livePpl["AREA_PPLTN_MIN"] || 0) || undefined,
      max: Number(livePpl["AREA_PPLTN_MAX"] || 0) || undefined,
      message: livePpl["AREA_CONGEST_MSG"] || undefined,
    },
    weather: {
      temperatureC: Number(weather["TEMP"] || 22),
      precipitationType: weather["PRECPT_TYPE"] || "none",
      precipitationMessage: weather["PRECIPITATION"] || "비 없음",
      pm25: Number(weather["PM25"] || 15),
      pm10: Number(weather["PM10"] || 30),
    },
    events: rawEvents.map((e: any) => ({
      title: e["EVENT_NM"] || "",
      place: e["EVENT_PLACE"] || "",
      date: e["EVENT_PERIOD"] || "",
      target: e["EVENT_TARGET"] || "",
      fee: e["PAY_AT"] || "",
      url: e["URL"] || "",
    })),
    source: "seoul-citydata",
    stale: false,
  };
}

/**
 * Get snapshot for an area with caching and fallbacks
 */
export async function getSeoulCitySnapshot(
  areaName: string
): Promise<{ snapshot: SeoulCitySnapshot; status: "live" | "stale" | "demo" }> {
  const cacheKey = `seoul_city_${areaName}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // 1. Valid Cache Hit
  if (cached && now - cached.cachedAt < config.seoul.cacheSeconds * 1000) {
    return { snapshot: cached.data, status: "live" };
  }

  // If no API key configured, use demo fixtures gracefully
  if (!config.seoul.apiKey || config.seoul.apiKey === "replace_me") {
    const fixture = SEOUL_CITYDATA_FIXTURES[areaName] || SEOUL_CITYDATA_FIXTURES["서울광장·시청"];
    return {
      snapshot: { ...fixture, areaName, capturedAt: new Date().toISOString() },
      status: "demo",
    };
  }

  // 2. Fetch from Seoul OpenAPI
  const encodedArea = encodeURIComponent(areaName);
  const url = `${config.seoul.baseUrl}/${config.seoul.apiKey}/json/${config.seoul.service}/1/5/${encodedArea}`;

  let attempts = 0;
  while (attempts < 2) {
    attempts++;
    try {
      const res = await fetchWithTimeout(url, config.seoul.timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Check inner resultCode
      if (data?.RESULT?.CODE && data.RESULT.CODE !== "INFO-000") {
        throw new Error(`Seoul API inner error: ${data.RESULT.CODE}`);
      }

      const normalized = normalizeSeoulResponse(areaName, data);
      memoryCache.set(cacheKey, { data: normalized, cachedAt: now });
      return { snapshot: normalized, status: "live" };
    } catch (err) {
      if (attempts < 2) {
        // Exponential backoff wait 500ms
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }

  // 3. Fallback: if cache exists, return as stale
  if (cached) {
    return {
      snapshot: { ...cached.data, stale: true },
      status: "stale",
    };
  }

  // 4. Fallback: demo fixture if all else fails
  const fixture = SEOUL_CITYDATA_FIXTURES[areaName] || SEOUL_CITYDATA_FIXTURES["서울광장·시청"];
  return {
    snapshot: { ...fixture, areaName, capturedAt: new Date().toISOString(), stale: true },
    status: "demo",
  };
}

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

const AREA_TO_HOTSPOT: Record<string, string> = {
  "강남구 일원동": "양재역",
  "일원동": "양재역",
  "수서동": "양재역",
  "개포동": "양재역",
  "삼성동": "강남 MICE 관광특구",
  "시청·서소문": "서울역",
  "서울광장·시청": "서울역",
  "광화문·정동": "광화문·덕수궁",
  "광화문": "광화문·덕수궁",
  "을지로·명동": "서울역",
  "을지로": "서울역",
  "명동": "서울역",
  "여의도": "여의도",
};

  // 2. Fetch from Seoul OpenAPI
  const targetHotspot = AREA_TO_HOTSPOT[areaName] || areaName;
  const hotspotsToTry = [targetHotspot];
  if (areaName.includes("강남") || areaName.includes("일원") || areaName.includes("수서") || areaName.includes("개포")) {
    if (!hotspotsToTry.includes("강남역")) hotspotsToTry.push("강남역");
    if (!hotspotsToTry.includes("양재역")) hotspotsToTry.push("양재역");
  } else {
    if (!hotspotsToTry.includes("광화문·덕수궁")) hotspotsToTry.push("광화문·덕수궁");
  }

  for (const hotspot of hotspotsToTry) {
    try {
      const encodedArea = encodeURIComponent(hotspot);
      const url = `${config.seoul.baseUrl}/${config.seoul.apiKey}/json/${config.seoul.service}/1/5/${encodedArea}`;
      const res = await fetchWithTimeout(url, config.seoul.timeoutMs);
      if (!res.ok) continue;
      const data = await res.json();

      if (data?.RESULT?.CODE && data.RESULT.CODE !== "INFO-000") {
        continue;
      }

      if (data?.CITYDATA) {
        const normalized = normalizeSeoulResponse(areaName, data);
        memoryCache.set(cacheKey, { data: normalized, cachedAt: now });
        return { snapshot: normalized, status: "live" };
      }
    } catch {
      // Continue to next fallback hotspot
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

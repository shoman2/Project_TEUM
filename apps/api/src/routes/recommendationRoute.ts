import { FastifyPluginAsync } from "fastify";
import {
  RecommendationRequestSchema,
  RecommendationResponse,
  RecommendationItem,
} from "@tteum/contracts";
import { PLACE_SEEDS } from "../domain/placeSeeds.js";
import { evaluateCandidates } from "../domain/scoringEngine.js";
import { getSeoulCitySnapshot } from "../adapters/seoul/seoulAdapter.js";
import { generateEditorialNarration } from "../adapters/gemini/geminiEditor.js";
import { sessionRepository } from "../repositories/sessionRepository.js";

export const recommendationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/recommendations", async (req, reply) => {
    const parseResult = RecommendationRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        message: "유효하지 않은 요청 데이터입니다.",
        errors: parseResult.error.format(),
      });
    }

    const { location, gapMinutes, mood, budgetWon, destination, now } = parseResult.data;
    const startTime = Date.now();
    const currentDate = now ? new Date(now) : new Date();

    // 1. Fetch Seoul city data for major central areas to populate crowd map
    const targetAreas = ["서울광장·시청", "광화문", "을지로"];
    const crowdMap: Record<string, "relaxed" | "normal" | "busy" | "very_busy" | "unknown"> = {};
    let overallStatus: "live" | "stale" | "demo" = "demo";

    const snapshots = await Promise.allSettled(
      targetAreas.map((area) => getSeoulCitySnapshot(area))
    );

    for (const res of snapshots) {
      if (res.status === "fulfilled") {
        const { snapshot, status } = res.value;
        crowdMap[snapshot.areaName] = snapshot.population.level;
        if (status === "live") overallStatus = "live";
        else if (status === "stale" && overallStatus !== "live") overallStatus = "stale";
      }
    }

    // 2. Deterministic candidate evaluation & ranking
    const evaluated = evaluateCandidates(PLACE_SEEDS, {
      userLocation: location,
      destination: destination || null,
      gapMinutes,
      mood,
      budgetWon: budgetWon || 10000,
      now: currentDate,
      crowdMap,
      isStaleData: overallStatus === "stale",
    });

    if (evaluated.length === 0) {
      sessionRepository.logEvent("anon", "empty_result_shown", {
        gapMinutes,
        mood,
        reason: "no_valid_time_completion",
      });

      const emptyResponse: RecommendationResponse = {
        requestId: "req_" + Math.random().toString(36).substring(2, 10),
        generatedAt: new Date().toISOString(),
        dataStatus: overallStatus,
        recommendations: [],
        message: "지금은 서두르지 않는 편이 좋습니다. 이동 여유를 포함하면 안전하게 완결되는 틈을 찾지 못했습니다.",
      };
      return emptyResponse;
    }

    // 3. Gemini editorial text generation with fallback
    const recommendations: RecommendationItem[] = await Promise.all(
      evaluated.map(async (cand) => {
        const narration = await generateEditorialNarration({
          placeName: cand.place.name,
          areaName: cand.place.areaName,
          mood,
          stayMinutes: cand.timeline.stayMinutes,
          outboundMinutes: cand.timeline.outboundMinutes,
          returnMinutes: cand.timeline.returnMinutes,
          safetyBufferMinutes: cand.timeline.safetyBufferMinutes,
          crowdLevel: cand.crowdLevel,
          costWon: cand.place.estimatedCostWon,
          facts: cand.facts,
        });

        const validUntilDate = new Date(Date.now() + cand.timeline.totalMinutes * 60 * 1000);

        return {
          id: cand.place.id,
          title: narration.title,
          line: narration.line,
          place: {
            name: cand.place.name,
            lat: cand.place.latitude,
            lng: cand.place.longitude,
            type: cand.place.type,
            areaName: cand.place.areaName,
            indoor: cand.place.indoor,
            estimatedCostWon: cand.place.estimatedCostWon,
          },
          timeline: cand.timeline,
          facts: narration.reasons,
          validUntil: validUntilDate.toISOString(),
          score: cand.score,
          sourceUpdatedAt: cand.place.verifiedAt,
          crowdLevel: cand.crowdLevel,
        };
      })
    );

    const latencyMs = Date.now() - startTime;
    sessionRepository.logEvent("anon", "recommendations_shown", {
      count: recommendations.length,
      dataStatus: overallStatus,
      latencyMs,
      gapMinutes,
      mood,
    });

    const response: RecommendationResponse = {
      requestId: "req_" + Math.random().toString(36).substring(2, 10),
      generatedAt: new Date().toISOString(),
      dataStatus: overallStatus,
      recommendations,
    };

    return response;
  });
};

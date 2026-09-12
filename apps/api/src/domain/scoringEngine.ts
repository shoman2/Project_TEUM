import {
  PlaceSeed,
  Mood,
  Location,
  Timeline,
} from "@tteum/contracts";
import { computeTimeline } from "./timeEngine.js";

export interface EvaluatedCandidate {
  place: PlaceSeed;
  timeline: Timeline;
  availableStayMinutes: number;
  score: number;
  facts: string[];
  crowdLevel: "relaxed" | "normal" | "busy" | "very_busy" | "unknown";
  stale: boolean;
}

export interface CandidateEvaluationContext {
  userLocation: Location;
  destination: Location | null;
  gapMinutes: number;
  mood: Mood;
  budgetWon: number;
  now: Date;
  crowdMap: Record<string, "relaxed" | "normal" | "busy" | "very_busy" | "unknown">;
  isStaleData: boolean;
}

/**
 * Deterministic recommendation engine (Handoff section 18)
 */
export function evaluateCandidates(
  candidates: PlaceSeed[],
  context: CandidateEvaluationContext
): EvaluatedCandidate[] {
  const evaluated: EvaluatedCandidate[] = [];

  const currentHour = context.now.getHours();
  const currentMinute = context.now.getMinutes();
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  for (const place of candidates) {
    // 1. Hard Filter: Coordinates check
    if (!place.latitude || !place.longitude) continue;

    // 2. Hard Filter: Budget check
    if (place.estimatedCostWon > context.budgetWon) continue;

    // 3. Hard Filter: Operational hours check
    if (place.openTime && place.closeTime) {
      const [openH, openM] = place.openTime.split(":").map(Number);
      const [closeH, closeM] = place.closeTime.split(":").map(Number);
      const openTotal = openH * 60 + openM;
      let closeTotal = closeH * 60 + closeM;
      if (closeTotal === 0) closeTotal = 24 * 60; // 24:00

      // If already closed or will close before estimated arrival + minStay
      const estArrival = currentTotalMinutes + 15; // rough outbound buffer
      if (currentTotalMinutes < openTotal || estArrival + place.minStayMinutes > closeTotal) {
        continue;
      }
    }

    // 4. Hard Filter: Crowd check
    const crowdLevel = context.crowdMap[place.areaName] || "relaxed";
    if (crowdLevel === "very_busy") continue;

    // 5. Hard Filter: Time feasibility
    const { timeline, availableStayMinutes } = computeTimeline(
      context.userLocation,
      { lat: place.latitude, lng: place.longitude },
      context.destination,
      context.gapMinutes,
      place.idealStayMinutes
    );

    if (availableStayMinutes < place.minStayMinutes) {
      continue; // Not enough time to experience properly
    }

    // Scoring weights:
    // score = 0.30*contextFit + 0.25*feasibility + 0.20*comfort + 0.15*novelty + 0.10*budgetFit
    const contextFit = place.moods.includes(context.mood) ? 1.0 : 0.45;

    // Feasibility: how close available stay is to ideal stay
    const feasibility = Math.min(1.0, availableStayMinutes / place.idealStayMinutes);

    // Comfort: crowd factor
    const comfort = crowdLevel === "relaxed" ? 1.0 : crowdLevel === "normal" ? 0.7 : 0.35;

    // Novelty
    const novelty = 0.8;

    // Budget fit
    const budgetFit = 1.0 - Math.min(1.0, place.estimatedCostWon / Math.max(1, context.budgetWon));

    let score =
      0.3 * contextFit +
      0.25 * feasibility +
      0.2 * comfort +
      0.15 * novelty +
      0.1 * budgetFit;

    // Penalties
    if (crowdLevel === "busy") score -= 0.15;
    if (timeline.outboundMinutes > 15) score -= 0.1; // travel fatigue
    if (context.isStaleData) score -= 0.1;

    score = Math.max(0, Math.min(1, score));

    // Deterministic factual evidence (at least 2 items per Handoff section 4.5)
    const facts: string[] = [];
    if (crowdLevel === "relaxed") {
      facts.push("현재 주변 혼잡도가 여유롭습니다.");
    } else {
      facts.push("도심 속 안정적인 휴식이 가능합니다.");
    }

    if (place.estimatedCostWon === 0) {
      facts.push("예상 비용 없이 무료로 이용 가능합니다.");
    } else {
      facts.push(`예상 비용 약 ${place.estimatedCostWon.toLocaleString()}원입니다.`);
    }

    facts.push(`출발 및 복귀를 포함해 ${timeline.totalMinutes}분 안에 완결됩니다.`);

    evaluated.push({
      place,
      timeline,
      availableStayMinutes,
      score: Math.round(score * 100) / 100,
      facts,
      crowdLevel,
      stale: context.isStaleData,
    });
  }

  // Tie-breaking rules (Handoff section 18):
  // 1. Lower risk of time overrun (higher safety ratio)
  // 2. Lower crowd
  // 3. Shorter walking distance
  evaluated.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.02) {
      return b.score - a.score;
    }
    // Tie-break by outbound walking minutes
    return a.timeline.outboundMinutes - b.timeline.outboundMinutes;
  });

  // Top 3 maximum
  return evaluated.slice(0, 3);
}

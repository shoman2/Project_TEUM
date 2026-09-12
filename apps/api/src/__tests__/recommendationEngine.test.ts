import { describe, it, expect } from "vitest";
import {
  calculateHaversineMeters,
  estimateWalkingMinutes,
  calculateSafetyBufferMinutes,
  computeTimeline,
} from "../domain/timeEngine.js";
import { evaluateCandidates } from "../domain/scoringEngine.js";
import { PlaceSeed } from "@tteum/contracts";
import { getTemplateNarration } from "../adapters/gemini/geminiEditor.js";

describe("TimeEngine Tests", () => {
  it("should calculate correct safety buffer (min 8 or 12%)", () => {
    expect(calculateSafetyBufferMinutes(15)).toBe(8);
    expect(calculateSafetyBufferMinutes(30)).toBe(8);
    expect(calculateSafetyBufferMinutes(60)).toBe(8);
    expect(calculateSafetyBufferMinutes(90)).toBe(11); // 90 * 0.12 = 10.8 -> 11
  });

  it("should estimate conservative walking minutes with buffer", () => {
    // ~750m distance
    const pointA = { lat: 37.5663, lng: 126.9779 };
    const pointB = { lat: 37.573, lng: 126.9779 };
    const meters = calculateHaversineMeters(pointA, pointB);
    expect(meters).toBeGreaterThan(600);

    const mins = estimateWalkingMinutes(pointA, pointB);
    // (meters * 1.25 / 75) + 3
    expect(mins).toBeGreaterThanOrEqual(13);
  });

  it("should compute accurate timeline with roundtrip and buffer", () => {
    const start = { lat: 37.5663, lng: 126.9779 };
    const place = { lat: 37.567, lng: 126.9785 }; // close place (~100m)
    const { timeline, availableStayMinutes } = computeTimeline(
      start,
      place,
      null, // return to start
      60,
      30
    );

    expect(timeline.totalMinutes).toBeLessThanOrEqual(60);
    expect(timeline.safetyBufferMinutes).toBe(8);
    expect(timeline.stayMinutes).toBe(30);
    expect(availableStayMinutes).toBeGreaterThan(0);
  });
});

describe("Scoring & Hard Filter Tests", () => {
  const mockSeed: PlaceSeed = {
    id: "test-place",
    name: "테스트 고궁",
    areaName: "시청",
    latitude: 37.5663,
    longitude: 126.9779,
    type: "park",
    moods: ["empty", "walk"],
    indoor: false,
    minStayMinutes: 20,
    idealStayMinutes: 30,
    maxStayMinutes: 45,
    estimatedCostWon: 0,
    openTime: "09:00",
    closeTime: "18:00",
    verifiedAt: "2026-09-12",
  };

  it("should filter out place if available stay is less than minStayMinutes (e.g. 15min gap)", () => {
    // 15 min gap with 8 min safety buffer leaves at most 7 mins minus travel time
    const results = evaluateCandidates([mockSeed], {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 15,
      mood: "empty",
      budgetWon: 10000,
      now: new Date("2026-09-12T14:00:00+09:00"),
      crowdMap: { 시청: "relaxed" },
      isStaleData: false,
    });

    expect(results.length).toBe(0);
  });

  it("should filter out place if closed or closing soon", () => {
    // Visiting at 19:00 when place closes at 18:00
    const results = evaluateCandidates([mockSeed], {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 60,
      mood: "empty",
      budgetWon: 10000,
      now: new Date("2026-09-12T19:00:00+09:00"),
      crowdMap: { 시청: "relaxed" },
      isStaleData: false,
    });

    expect(results.length).toBe(0);
  });

  it("should filter out very_busy places", () => {
    const results = evaluateCandidates([mockSeed], {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 60,
      mood: "empty",
      budgetWon: 10000,
      now: new Date("2026-09-12T14:00:00+09:00"),
      crowdMap: { 시청: "very_busy" },
      isStaleData: false,
    });

    expect(results.length).toBe(0);
  });

  it("should apply stale data penalty when data is stale", () => {
    const liveResults = evaluateCandidates([mockSeed], {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 60,
      mood: "empty",
      budgetWon: 10000,
      now: new Date("2026-09-12T14:00:00+09:00"),
      crowdMap: { 시청: "relaxed" },
      isStaleData: false,
    });

    const staleResults = evaluateCandidates([mockSeed], {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 60,
      mood: "empty",
      budgetWon: 10000,
      now: new Date("2026-09-12T14:00:00+09:00"),
      crowdMap: { 시청: "relaxed" },
      isStaleData: true,
    });

    expect(liveResults[0].score).toBeGreaterThan(staleResults[0].score);
  });
});

describe("Gemini Template Fallback Test", () => {
  it("should produce editorial fallback matching specifications", () => {
    const narration = getTemplateNarration(30, "empty", "정동", [
      "혼잡도 여유",
      "비용 0원",
    ]);

    expect(narration.title).toContain("30분");
    expect(narration.title).toContain("비움");
    expect(narration.line).toContain("정동");
    expect(narration.reasons.length).toBe(2);
  });
});

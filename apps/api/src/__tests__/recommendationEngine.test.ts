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
    const narration = getTemplateNarration("정동전망대", 30, "empty", "정동", [
      "혼잡도 여유",
      "비용 0원",
    ]);

    expect(narration.title).toContain("30분");
    expect(narration.title).toContain("정동전망대");
    expect(narration.line).toContain("정동");
    expect(narration.reasons.length).toBe(2);
  });

  it("should strictly reject closed places like Hwangudan at 21:50", () => {
    const nightDate = new Date("2026-09-12T21:50:00+09:00");
    const candidates = [
      {
        id: "hwangudan-test",
        name: "환구단과 석고",
        areaName: "소공동",
        latitude: 37.5650,
        longitude: 126.9798,
        type: "walk" as const,
        moods: ["empty" as const],
        indoor: false,
        minStayMinutes: 10,
        idealStayMinutes: 20,
        maxStayMinutes: 35,
        estimatedCostWon: 0,
        openTime: "09:00",
        closeTime: "21:00",
        nightSafe: false,
        verifiedAt: "2026-09-12",
      },
      {
        id: "deoksu-test",
        name: "덕수궁 돌담길",
        areaName: "시청",
        latitude: 37.5658,
        longitude: 126.9752,
        type: "walk" as const,
        moods: ["empty" as const],
        indoor: false,
        minStayMinutes: 15,
        idealStayMinutes: 25,
        maxStayMinutes: 45,
        estimatedCostWon: 0,
        openTime: "00:00",
        closeTime: "24:00",
        nightSafe: true,
        verifiedAt: "2026-09-12",
      },
    ];

    const results = evaluateCandidates(candidates, {
      userLocation: { lat: 37.5663, lng: 126.9779 },
      destination: null,
      gapMinutes: 60,
      mood: "empty",
      budgetWon: 10000,
      now: nightDate,
      crowdMap: { 소공동: "relaxed", 시청: "relaxed" },
      isStaleData: false,
    });

    const placeIds = results.map((r) => r.place.id);
    expect(placeIds).not.toContain("hwangudan-test");
    expect(placeIds).toContain("deoksu-test");
  });
});

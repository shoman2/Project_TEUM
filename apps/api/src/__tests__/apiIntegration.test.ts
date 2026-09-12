import { describe, it, expect, beforeAll } from "vitest";
import { createServer } from "../server.js";
import { FastifyInstance } from "fastify";

describe("API Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
    await app.ready();
  });

  it("GET /api/health should return ok and config statuses", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/health",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("tteum-api");
  });

  it("GET /api/areas should return supported preset central areas", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/areas",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.areas.length).toBeGreaterThanOrEqual(4);
  });

  it("POST /api/recommendations should return at most 3 valid recommendations", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        location: { lat: 37.5663, lng: 126.9779 },
        gapMinutes: 60,
        mood: "empty",
        now: "2026-09-12T18:12:00+09:00",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.recommendations).toBeDefined();
    expect(body.recommendations.length).toBeGreaterThan(0);
    expect(body.recommendations.length).toBeLessThanOrEqual(3);

    const first = body.recommendations[0];
    expect(first.title).toBeDefined();
    expect(first.line).toBeDefined();
    expect(first.timeline.totalMinutes).toBeLessThanOrEqual(60);
    expect(first.facts.length).toBeGreaterThanOrEqual(2);
    expect(first.commercialDistrict).toBeDefined();
    expect(first.commercialDistrict.districtName).toBeDefined();
    expect(first.nearbyCafes).toBeDefined();
    expect(first.nearbyCafes.length).toBeGreaterThan(0);
    expect(first.nearbyCafes[0].name).toBeDefined();
    expect(first.nearbyCafes[0].walkingMinutes).toBeGreaterThan(0);
  });

  it("GET /api/commercial/cafes should return nearby cafes for Ilwon-dong coordinates", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/commercial/cafes?lat=37.4835&lng=127.0845&areaName=강남구%20일원동",
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.commercialDistrict).toBeDefined();
    expect(body.commercialDistrict.districtName).toContain("일원동");
    expect(body.nearbyCafes.length).toBeGreaterThan(0);
    expect(body.nearbyCafes[0].category).toBeDefined();
  });

  it("POST /api/recommendations with 15min should return honest empty result", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/recommendations",
      payload: {
        location: { lat: 37.5000, lng: 127.0000 }, // far south of the Han River
        gapMinutes: 15,
        mood: "empty",
        now: "2026-09-12T18:12:00+09:00",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.recommendations.length).toBe(0);
    expect(body.message).toContain("지금은 서두르지 않는 편이 좋습니다");
  });

  it("POST /api/sessions/start, complete, abandon lifecycle", async () => {
    // 1. Start
    const startRes = await app.inject({
      method: "POST",
      url: "/api/sessions/start",
      payload: {
        recommendationId: "deoksugung-stonewall",
        placeId: "deoksugung-stonewall",
        placeName: "덕수궁 돌담길",
        predictedMinutes: 60,
        anonymousId: "test_anon_1",
      },
    });
    expect(startRes.statusCode).toBe(200);
    const { sessionId } = JSON.parse(startRes.body);
    expect(sessionId).toBeDefined();

    // 2. Complete
    const compRes = await app.inject({
      method: "POST",
      url: `/api/sessions/${sessionId}/complete`,
      payload: {
        actualMinutes: 45,
        reflection: "repeat",
        anonymousId: "test_anon_1",
      },
    });
    expect(compRes.statusCode).toBe(200);
    expect(JSON.parse(compRes.body).success).toBe(true);

    // 3. Abandon another session
    const startRes2 = await app.inject({
      method: "POST",
      url: "/api/sessions/start",
      payload: {
        recommendationId: "cheonggye-plaza-spring",
        placeId: "cheonggye-plaza-spring",
        placeName: "청계광장",
        predictedMinutes: 30,
        anonymousId: "test_anon_2",
      },
    });
    const { sessionId: sessionId2 } = JSON.parse(startRes2.body);

    const abandonRes = await app.inject({
      method: "POST",
      url: `/api/sessions/${sessionId2}/abandon`,
      payload: {
        elapsedMinutes: 10,
        reason: "not_enough_time",
        anonymousId: "test_anon_2",
      },
    });
    expect(abandonRes.statusCode).toBe(200);
    expect(JSON.parse(abandonRes.body).success).toBe(true);
  });
});

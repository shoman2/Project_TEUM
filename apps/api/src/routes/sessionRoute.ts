import { FastifyPluginAsync } from "fastify";
import {
  SessionStartRequestSchema,
  SessionCompleteRequestSchema,
  SessionAbandonRequestSchema,
} from "@tteum/contracts";
import { sessionRepository } from "../repositories/sessionRepository.js";

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  // Start session
  fastify.post("/api/sessions/start", async (req, reply) => {
    const parsed = SessionStartRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "유효하지 않은 요청입니다." });
    }

    const { recommendationId, placeId, placeName, predictedMinutes, anonymousId } = parsed.data;
    const sessionId = "sess_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

    const session = sessionRepository.createSession({
      id: sessionId,
      anonymousId,
      recommendationId,
      placeId,
      placeName,
      predictedMinutes,
      status: "started",
    });

    sessionRepository.logEvent(anonymousId, "gap_started", {
      sessionId,
      recommendationId,
      placeName,
      predictedMinutes,
    });

    return { sessionId: session.id };
  });

  // Complete session
  fastify.post("/api/sessions/:id/complete", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = SessionCompleteRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "유효하지 않은 요청입니다." });
    }

    const { actualMinutes, reflection, anonymousId } = parsed.data;
    sessionRepository.completeSession(id, actualMinutes, reflection);

    sessionRepository.logEvent(anonymousId, "gap_completed", {
      sessionId: id,
      actualMinutes,
      reflection,
    });

    return { success: true };
  });

  // Abandon session
  fastify.post("/api/sessions/:id/abandon", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = SessionAbandonRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: "유효하지 않은 요청입니다." });
    }

    const { elapsedMinutes, reason, anonymousId } = parsed.data;
    sessionRepository.abandonSession(id, elapsedMinutes, reason);

    sessionRepository.logEvent(anonymousId, "gap_abandoned", {
      sessionId: id,
      elapsedMinutes,
      reason,
    });

    return { success: true };
  });
};

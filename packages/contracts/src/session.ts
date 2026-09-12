import { z } from "zod";

export const SessionStartRequestSchema = z.object({
  recommendationId: z.string(),
  placeId: z.string(),
  placeName: z.string(),
  predictedMinutes: z.number(),
  anonymousId: z.string(),
});
export type SessionStartRequest = z.infer<typeof SessionStartRequestSchema>;

export const SessionCompleteRequestSchema = z.object({
  actualMinutes: z.number(),
  reflection: z.enum(["regret", "okay", "repeat"]), // 아쉬움 / 괜찮음 / 다시 하고 싶음
  anonymousId: z.string(),
});
export type SessionCompleteRequest = z.infer<typeof SessionCompleteRequestSchema>;

export const SessionAbandonReasonSchema = z.enum([
  "not_enough_time", // 시간이 부족했어요
  "too_far",         // 생각보다 멀었어요
  "too_crowded",     // 너무 붐볐어요
  "place_closed",    // 장소가 닫혀 있었어요
  "different_mood",  // 지금의 기분과 달랐어요
]);
export type SessionAbandonReason = z.infer<typeof SessionAbandonReasonSchema>;

export const SessionAbandonRequestSchema = z.object({
  elapsedMinutes: z.number(),
  reason: SessionAbandonReasonSchema,
  anonymousId: z.string(),
});
export type SessionAbandonRequest = z.infer<typeof SessionAbandonRequestSchema>;

export const AnalyticsEventSchema = z.object({
  id: z.string(),
  anonymousId: z.string(),
  eventName: z.enum([
    "gap_search_started",
    "recommendations_shown",
    "recommendation_opened",
    "gap_started",
    "gap_completed",
    "gap_abandoned",
    "empty_result_shown",
  ]),
  payload: z.record(z.unknown()),
  createdAt: z.string(),
});
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

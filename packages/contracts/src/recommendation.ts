import { z } from "zod";

export const MoodSchema = z.enum(["empty", "walk", "discover", "stay"]);
export type Mood = z.infer<typeof MoodSchema>;

export const LocationSchema = z.object({
  lat: z.number().min(33).max(43),
  lng: z.number().min(124).max(132),
});
export type Location = z.infer<typeof LocationSchema>;

export const PlaceSeedSchema = z.object({
  id: z.string(),
  name: z.string(),
  areaName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  type: z.enum(["walk", "park", "library", "exhibition", "view", "cafe"]),
  moods: z.array(MoodSchema),
  indoor: z.boolean(),
  minStayMinutes: z.number(),
  idealStayMinutes: z.number(),
  maxStayMinutes: z.number(),
  estimatedCostWon: z.number(),
  openTime: z.string().optional(), // "09:00"
  closeTime: z.string().optional(), // "21:00"
  closedDays: z.array(z.string()).optional(),
  verifiedAt: z.string(),
  sourceUrl: z.string().optional(),
  accessibility: z.object({
    wheelchair: z.boolean().optional(),
    toilet: z.boolean().optional(),
    seating: z.boolean().optional(),
  }).optional(),
});
export type PlaceSeed = z.infer<typeof PlaceSeedSchema>;

export const TimelineSchema = z.object({
  outboundMinutes: z.number(),
  stayMinutes: z.number(),
  returnMinutes: z.number(),
  safetyBufferMinutes: z.number(),
  totalMinutes: z.number(),
});
export type Timeline = z.infer<typeof TimelineSchema>;

export const RecommendationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  line: z.string(),
  place: z.object({
    name: z.string(),
    lat: z.number(),
    lng: z.number(),
    type: z.string(),
    areaName: z.string(),
    indoor: z.boolean(),
    estimatedCostWon: z.number(),
  }),
  timeline: TimelineSchema,
  facts: z.array(z.string()),
  validUntil: z.string(),
  score: z.number(),
  sourceUpdatedAt: z.string(),
  crowdLevel: z.enum(["relaxed", "normal", "busy", "very_busy", "unknown"]),
});
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

export const RecommendationRequestSchema = z.object({
  location: LocationSchema,
  gapMinutes: z.number().min(10).max(180),
  mood: MoodSchema,
  budgetWon: z.number().optional(),
  destination: LocationSchema.nullable().optional(),
  now: z.string().optional(), // ISO-8601 string
});
export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;

export const RecommendationResponseSchema = z.object({
  requestId: z.string(),
  generatedAt: z.string(),
  dataStatus: z.enum(["live", "stale", "demo"]),
  recommendations: z.array(RecommendationItemSchema),
  message: z.string().optional(),
});
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

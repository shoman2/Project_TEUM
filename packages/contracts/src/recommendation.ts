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
  nightSafe: z.boolean().optional(),
});
export type PlaceSeed = z.infer<typeof PlaceSeedSchema>;

export const TimelineSchema = z.object({
  outboundMinutes: z.number(),
  stayMinutes: z.number(),
  returnMinutes: z.number(),
  safetyBufferMinutes: z.number(),
  totalMinutes: z.number(),
  remainingBufferMinutes: z.number().optional(),
});
export type Timeline = z.infer<typeof TimelineSchema>;

export const NearbyCafeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(), // "독립 로스터리" | "전통 찻집" | "북카페 & 쉼터" | "동네 디저트 공방" | "로컬 에스프레소 바"
  distanceMeters: z.number(),
  walkingMinutes: z.number(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  signatureMenu: z.string().optional(),
  businessType: z.string().optional(), // "소상공인 독립점포"
  quietScore: z.string().optional(), // "조용함" | "아늑함" | "대화하기 좋음"
  openHours: z.string().optional(), // "09:00 ~ 21:30"
});
export type NearbyCafe = z.infer<typeof NearbyCafeSchema>;

export const CommercialDistrictSchema = z.object({
  districtName: z.string(), // "일원동 맛골목 골목상권"
  districtType: z.string(), // "골목상권" | "발달상권" | "관광특구" | "주거배후상권"
  smallBusinessRatio: z.string(), // "소상공인 비율 84%"
  vibeTag: z.string(), // "호젓한 주거골목" | "문화예술 직장상권"
  footTraffic: z.string().optional(), // "시간당 4,800명 유동"
  densityMessage: z.string().optional(),
});
export type CommercialDistrict = z.infer<typeof CommercialDistrictSchema>;

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
  provenanceMessage: z.string().optional(),
  nearbyCafes: z.array(NearbyCafeSchema).optional(),
  commercialDistrict: CommercialDistrictSchema.optional(),
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

export const CitySummarySchema = z.object({
  areaName: z.string().optional(),
  crowdLevel: z.enum(["relaxed", "normal", "busy", "very_busy", "unknown"]).optional(),
  crowdMessage: z.string().optional(),
  populationRange: z.string().optional(),
  temperatureC: z.number().optional(),
  precipitationMessage: z.string().optional(),
  airQuality: z.string().optional(),
  capturedAt: z.string().optional(),
  commercialDistrict: CommercialDistrictSchema.optional(),
  totalCafesCount: z.number().optional(),
});
export type CitySummary = z.infer<typeof CitySummarySchema>;

export const RecommendationResponseSchema = z.object({
  requestId: z.string(),
  generatedAt: z.string(),
  dataStatus: z.enum(["live", "stale", "demo"]),
  recommendations: z.array(RecommendationItemSchema),
  message: z.string().optional(),
  citySummary: CitySummarySchema.optional(),
});
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;


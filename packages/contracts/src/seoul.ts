import { z } from "zod";

export const NormalizedEventSchema = z.object({
  title: z.string(),
  place: z.string().optional(),
  date: z.string().optional(),
  target: z.string().optional(),
  fee: z.string().optional(),
  url: z.string().optional(),
});
export type NormalizedEvent = z.infer<typeof NormalizedEventSchema>;

export const SeoulCitySnapshotSchema = z.object({
  areaCode: z.string().optional(),
  areaName: z.string(),
  capturedAt: z.string(),
  population: z.object({
    level: z.enum(["relaxed", "normal", "busy", "very_busy", "unknown"]),
    min: z.number().optional(),
    max: z.number().optional(),
    message: z.string().optional(),
  }),
  weather: z.object({
    temperatureC: z.number().optional(),
    precipitationType: z.string().optional(),
    precipitationMessage: z.string().optional(),
    pm25: z.number().optional(),
    pm10: z.number().optional(),
  }).optional(),
  transit: z.object({
    subway: z.array(z.unknown()).optional(),
    bus: z.array(z.unknown()).optional(),
  }).optional(),
  bikes: z.array(z.unknown()).optional(),
  parking: z.array(z.unknown()).optional(),
  events: z.array(NormalizedEventSchema),
  source: z.literal("seoul-citydata"),
  stale: z.boolean(),
});
export type SeoulCitySnapshot = z.infer<typeof SeoulCitySnapshotSchema>;

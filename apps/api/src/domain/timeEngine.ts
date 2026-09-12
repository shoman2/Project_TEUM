import { Location, Timeline } from "@tteum/contracts";

/**
 * Calculate Haversine distance in meters between two lat/lng points
 */
export function calculateHaversineMeters(
  point1: Location,
  point2: Location
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * MVP Walking duration estimation (Handoff section 17)
 * 1. Haversine distance
 * 2. Detour factor 1.25
 * 3. Walking speed 75m/min
 * 4. Fixed crossing/buffer 3 min
 */
export function estimateWalkingMinutes(
  from: Location,
  to: Location
): number {
  const meters = calculateHaversineMeters(from, to);
  return Math.ceil((meters * 1.25) / 75) + 3;
}

/**
 * Safety buffer calculation (Handoff section 17)
 * safetyBuffer = max(8분, 전체 가용시간의 12%)
 */
export function calculateSafetyBufferMinutes(gapMinutes: number): number {
  return Math.max(8, Math.round(gapMinutes * 0.12));
}

/**
 * Compute the complete timeline for an experience
 */
export function computeTimeline(
  startLoc: Location,
  placeLoc: Location,
  destinationLoc: Location | null,
  gapMinutes: number,
  idealStayMinutes: number
): { timeline: Timeline; availableStayMinutes: number } {
  const outboundMinutes = estimateWalkingMinutes(startLoc, placeLoc);
  const returnLoc = destinationLoc || startLoc;
  const returnMinutes = estimateWalkingMinutes(placeLoc, returnLoc);
  const safetyBufferMinutes = calculateSafetyBufferMinutes(gapMinutes);

  const availableStayMinutes =
    gapMinutes - outboundMinutes - returnMinutes - safetyBufferMinutes;

  // Actual planned stay within the gap
  const stayMinutes = Math.max(0, Math.min(idealStayMinutes, availableStayMinutes));
  const totalMinutes = outboundMinutes + stayMinutes + returnMinutes + safetyBufferMinutes;

  return {
    timeline: {
      outboundMinutes,
      stayMinutes,
      returnMinutes,
      safetyBufferMinutes,
      totalMinutes,
    },
    availableStayMinutes,
  };
}

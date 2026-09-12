import {
  RecommendationRequest,
  RecommendationResponse,
  SessionStartRequest,
  SessionCompleteRequest,
  SessionAbandonRequest,
} from "@tteum/contracts";

export async function getRecommendations(
  req: RecommendationRequest
): Promise<RecommendationResponse> {
  const res = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "추천 정보를 가져오지 못했습니다.");
  }

  return res.json();
}

export async function startSessionApi(
  req: SessionStartRequest
): Promise<{ sessionId: string }> {
  const res = await fetch("/api/sessions/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("세션 시작에 실패했습니다.");
  return res.json();
}

export async function completeSessionApi(
  sessionId: string,
  req: SessionCompleteRequest
): Promise<void> {
  const res = await fetch(`/api/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("세션 완료 기록에 실패했습니다.");
}

export async function abandonSessionApi(
  sessionId: string,
  req: SessionAbandonRequest
): Promise<void> {
  const res = await fetch(`/api/sessions/${sessionId}/abandon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("세션 중단 기록에 실패했습니다.");
}

export async function reverseGeocodeApi(
  lat: number,
  lng: number
): Promise<{ label: string; fullAddress: string }> {
  try {
    const res = await fetch(`/api/location/reverse?lat=${lat}&lng=${lng}`);
    if (!res.ok) return { label: "현재 위치", fullAddress: "" };
    return res.json();
  } catch {
    return { label: "현재 위치", fullAddress: "" };
  }
}

export async function getIpLocationApi(): Promise<{ lat: number; lng: number; city: string; source: string }> {
  try {
    const res = await fetch("/api/location/ip");
    if (!res.ok) return { lat: 37.5663, lng: 126.9779, city: "서울시청", source: "fallback" };
    return res.json();
  } catch {
    return { lat: 37.5663, lng: 126.9779, city: "서울시청", source: "fallback" };
  }
}



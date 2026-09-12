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

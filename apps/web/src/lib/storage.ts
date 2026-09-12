export function getAnonymousId(): string {
  let anonId = localStorage.getItem("tteum_anon_id");
  if (!anonId) {
    anonId = "user_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("tteum_anon_id", anonId);
  }
  return anonId;
}

export function getReclaimedMinutes(): number {
  const mins = localStorage.getItem("tteum_reclaimed_minutes");
  return mins ? parseInt(mins, 10) : 0;
}

export function addReclaimedMinutes(minutes: number): number {
  const current = getReclaimedMinutes();
  const next = current + minutes;
  localStorage.setItem("tteum_reclaimed_minutes", next.toString());
  return next;
}

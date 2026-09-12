import { useState, useEffect } from "react";
import { RecommendationItem, SessionAbandonReason } from "@tteum/contracts";
import Header from "../components/Header.js";
import { Check, X, ExternalLink } from "lucide-react";

interface S06ActiveSessionProps {
  item: RecommendationItem;
  onComplete: (actualMinutes: number) => void;
  onAbandon: (elapsedMinutes: number, reason: SessionAbandonReason) => void;
}

const ABANDON_REASONS: Array<{ key: SessionAbandonReason; label: string }> = [
  { key: "not_enough_time", label: "시간이 부족했어요" },
  { key: "too_far", label: "생각보다 멀었어요" },
  { key: "too_crowded", label: "너무 붐볐어요" },
  { key: "place_closed", label: "장소가 닫혀 있었어요" },
  { key: "different_mood", label: "지금의 기분과 달랐어요" },
];

export default function S06ActiveSession({ item, onComplete, onAbandon }: S06ActiveSessionProps) {
  const totalSeconds = item.timeline.totalMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
  const displayMinutes = Math.floor(secondsLeft / 60);
  const displaySeconds = secondsLeft % 60;

  // External Map Links (Kakao / Naver)
  const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(item.place.name)},${item.place.lat},${item.place.lng}`;
  const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(item.place.name)}`;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header areaLabel={item.place.name} />

      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* Phase Badge */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "var(--radius-chip)",
                backgroundColor: "rgba(228, 111, 93, 0.12)",
                color: "var(--color-coral)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-coral)",
                }}
              />
              틈 진행 중
            </span>
          </div>

          {/* Countdown Clock */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "56px",
                fontWeight: 700,
                lineHeight: 1.1,
                color: "var(--color-ink)",
                letterSpacing: "-0.04em",
                marginBottom: "8px",
              }}
            >
              {displayMinutes}:{displaySeconds.toString().padStart(2, "0")}
            </div>
            <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>
              남은 전체 시간 (복귀 여유 포함)
            </p>
          </div>

          {/* Place & Experience Box */}
          <div
            className="card-paper"
            style={{
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h2 className="font-serif" style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
              {item.title}
            </h2>
            <p className="text-caption" style={{ color: "var(--color-ink-muted)", marginBottom: "16px" }}>
              {item.place.areaName} · {item.place.name}
            </p>

            <div style={{ display: "flex", gap: "8px" }}>
              <a
                href={kakaoMapUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#FEE500",
                  color: "#191919",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>카카오맵</span>
                <ExternalLink size={13} />
              </a>

              <a
                href={naverMapUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor: "#03C75A",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <span>네이버지도</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            className="btn-primary"
            onClick={() => onComplete(elapsedMinutes)}
            id="btn-complete-session"
          >
            <Check size={18} />
            <span>잘 보냈어요 (틈 완료)</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => setIsAbandonModalOpen(true)}
            id="btn-abandon-session"
          >
            <X size={18} />
            <span>중간에 그만둘래요</span>
          </button>
        </div>
      </main>

      {/* Abandon Reason Modal */}
      {isAbandonModalOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(32, 37, 34, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--color-paper)",
              borderTopLeftRadius: "var(--radius-sheet)",
              borderTopRightRadius: "var(--radius-sheet)",
              padding: "24px 20px 32px",
              boxShadow: "var(--shadow-sheet)",
            }}
          >
            <h3 className="font-serif" style={{ fontSize: "20px", marginBottom: "8px" }}>
              어떤 점이 아쉬웠나요?
            </h3>
            <p className="text-caption" style={{ color: "var(--color-ink-muted)", marginBottom: "20px" }}>
              한 번의 탭으로 다음 추천을 더 정확히 만듭니다.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {ABANDON_REASONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => onAbandon(elapsedMinutes, r.key)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    backgroundColor: "var(--color-ivory)",
                    border: "1px solid var(--color-mist)",
                    textAlign: "left",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: "var(--color-ink)",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              className="btn-secondary"
              onClick={() => setIsAbandonModalOpen(false)}
            >
              계속 진행하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { RecommendationItem } from "@tteum/contracts";
import { ChevronRight, ShieldCheck, Footprints, Clock } from "lucide-react";

interface BottomSheetProps {
  recommendations: RecommendationItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenDetail: (item: RecommendationItem) => void;
}

export default function BottomSheet({
  recommendations,
  selectedIndex,
  onSelectIndex,
  onOpenDetail,
}: BottomSheetProps) {
  if (recommendations.length === 0) return null;

  const current = recommendations[selectedIndex] || recommendations[0];

  const getCrowdLabel = (level: string) => {
    switch (level) {
      case "relaxed":
        return { text: "혼잡도 여유", color: "var(--color-sage)" };
      case "normal":
        return { text: "혼잡도 보통", color: "var(--color-dusk)" };
      case "busy":
        return { text: "약간 붐빔", color: "var(--color-coral)" };
      default:
        return { text: "상태 안정", color: "var(--color-ink-muted)" };
    }
  };

  const crowd = getCrowdLabel(current.crowdLevel);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 16px 24px",
        background: "linear-gradient(to top, rgba(244, 241, 233, 0.98) 80%, rgba(244, 241, 233, 0))",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Indicator Dots if multiple recommendations */}
      {recommendations.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "4px" }}>
          {recommendations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              aria-label={`추천 ${idx + 1} 보기`}
              style={{
                width: idx === selectedIndex ? "20px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor: idx === selectedIndex ? "var(--color-ink)" : "var(--color-mist)",
                transition: "all var(--transition-fast)",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Selected Card */}
      <div
        className="card-paper animate-fade-in"
        onClick={() => onOpenDetail(current)}
        style={{
          padding: "20px",
          cursor: "pointer",
          transition: "transform var(--transition-fast)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                backgroundColor: "var(--color-ink)",
                color: "var(--color-paper)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {selectedIndex + 1}
            </span>
            <span className="text-caption" style={{ color: "var(--color-ink-muted)", fontWeight: 500 }}>
              {current.place.areaName} · {current.place.name}
            </span>
          </div>

          <div
            style={{
              padding: "3px 8px",
              borderRadius: "var(--radius-chip)",
              backgroundColor: "rgba(32, 37, 34, 0.05)",
              color: crowd.color,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {crowd.text}
          </div>
        </div>

        {/* Title & Line */}
        <h2
          className="font-serif"
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--color-ink)",
            marginBottom: "6px",
            letterSpacing: "-0.02em",
          }}
        >
          {current.title}
        </h2>
        <p
          className="text-body"
          style={{
            fontSize: "14px",
            color: "var(--color-ink-muted)",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          {current.line}
        </p>

        {/* Timeline bar snapshot */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            backgroundColor: "var(--color-ivory)",
            borderRadius: "12px",
            marginBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="text-meta">
            <Footprints size={14} color="var(--color-dusk)" />
            <span>도보 {current.timeline.outboundMinutes}분</span>
          </div>
          <span style={{ color: "var(--color-mist)" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="text-meta">
            <Clock size={14} color="var(--color-coral)" />
            <span style={{ fontWeight: 600 }}>체류 {current.timeline.stayMinutes}분</span>
          </div>
          <span style={{ color: "var(--color-mist)" }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }} className="text-meta">
            <ShieldCheck size={14} color="var(--color-sage)" />
            <span>여유 {current.timeline.safetyBufferMinutes}분</span>
          </div>
        </div>

        {/* Action cue */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
            총 {current.timeline.totalMinutes}분 안에 완결
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--color-coral)",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <span>이 틈 시작하기</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}

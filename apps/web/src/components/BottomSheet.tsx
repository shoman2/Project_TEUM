import { RecommendationItem } from "@tteum/contracts";
import { ChevronRight, ShieldCheck, Footprints, Clock, ChevronUp, ChevronDown } from "lucide-react";

interface BottomSheetProps {
  recommendations: RecommendationItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenDetail: (item: RecommendationItem) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function BottomSheet({
  recommendations,
  selectedIndex,
  onSelectIndex,
  onOpenDetail,
  isCollapsed = false,
  onToggleCollapse,
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
        padding: isCollapsed ? "8px 16px 16px" : "12px 16px 22px",
        background: isCollapsed
          ? "rgba(244, 241, 233, 0.95)"
          : "linear-gradient(to top, rgba(244, 241, 233, 0.98) 85%, rgba(244, 241, 233, 0))",
        backdropFilter: isCollapsed ? "blur(8px)" : undefined,
        WebkitBackdropFilter: isCollapsed ? "blur(8px)" : undefined,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "all 0.25s ease",
        pointerEvents: "none",
      }}
    >
      {/* Drag Handle / Toggle Button */}
      <div
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        aria-label={isCollapsed ? "상세 카드 펼치기" : "지도 넓게 보기 (카드 접기)"}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "6px 0 8px",
          cursor: "pointer",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "5px",
            borderRadius: "3px",
            backgroundColor: "rgba(32, 37, 34, 0.35)",
          }}
        />
      </div>

      {/* Indicator Dots if multiple recommendations */}
      {recommendations.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "2px", pointerEvents: "auto" }}>
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
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      )}

      {isCollapsed ? (
        /* Compact Peek Card when collapsed */
        <div
          className="card-paper animate-fade-in"
          onClick={onToggleCollapse}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                backgroundColor: "var(--color-coral)",
                color: "var(--color-paper)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {selectedIndex + 1}
            </span>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-ink)", marginRight: "6px" }}>
                {current.place.name}
              </span>
              <span className="text-caption" style={{ color: "var(--color-coral)", fontWeight: 600 }}>
                도보 {current.timeline.outboundMinutes}분 · {current.timeline.totalMinutes}분 완결
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-dusk)", fontSize: "12px", fontWeight: 600 }}>
            <span>펼치기</span>
            <ChevronUp size={16} />
          </div>
        </div>
      ) : (
        /* Full Expanded Card */
        <div
          className="card-paper animate-fade-in"
          style={{
            padding: "18px 20px 20px",
            cursor: "pointer",
            transition: "transform var(--transition-fast)",
            pointerEvents: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={() => onOpenDetail(current)}>
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

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
              {onToggleCollapse && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  title="지도 넓게 보기"
                  aria-label="지도 넓게 보기"
                  style={{
                    background: "none",
                    border: "none",
                    padding: "2px",
                    cursor: "pointer",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <ChevronDown size={18} />
                </button>
              )}
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
      )}
    </div>
  );
}

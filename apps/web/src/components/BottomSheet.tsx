import { RecommendationItem } from "@tteum/contracts";
import { ChevronRight, ShieldCheck, ChevronUp, ChevronDown, Store, Coffee } from "lucide-react";

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
        return { text: "혼잡도 여유", color: "#445942", dot: "#5B8C51" };
      case "normal":
        return { text: "혼잡도 보통", color: "var(--color-dusk)", dot: "#526779" };
      case "busy":
        return { text: "약간 붐빔", color: "var(--color-coral)", dot: "#E46F5D" };
      default:
        return { text: "상태 안정", color: "var(--color-ink-muted)", dot: "#8E998F" };
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
        padding: isCollapsed ? "8px 16px 16px" : "12px 16px 20px",
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-ink)" }}>
                  {current.place.name}
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(32, 37, 34, 0.05)",
                    color: crowd.color,
                    fontSize: "10px",
                    fontWeight: 700,
                  }}
                >
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: crowd.dot }}></span>
                  {crowd.text}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <span className="text-caption" style={{ color: "var(--color-coral)", fontWeight: 600 }}>
                  도보 {current.timeline.outboundMinutes}분 · {current.timeline.totalMinutes}분 완결
                </span>
                {current.nearbyCafes && current.nearbyCafes.length > 0 && (
                  <span style={{ fontSize: "10px", color: "var(--color-dusk)", fontWeight: 600 }}>
                    • ☕ 주변 카페 {current.nearbyCafes.length}곳
                  </span>
                )}
              </div>
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
            padding: "16px 18px 18px",
            cursor: "pointer",
            transition: "transform var(--transition-fast)",
            pointerEvents: "auto",
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }} onClick={() => onOpenDetail(current)}>
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

              {/* Commercial District Small Business Badge */}
              {current.commercialDistrict && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 7px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(82, 103, 121, 0.08)",
                    color: "var(--color-dusk)",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                  title="서울시 골목상권 데이터 연계"
                >
                  <Store size={10} />
                  <span>{current.commercialDistrict.districtName}</span>
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 9px",
                  borderRadius: "var(--radius-chip)",
                  backgroundColor: "rgba(32, 37, 34, 0.05)",
                  color: crowd.color,
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: crowd.dot }}></span>
                <span>{crowd.text}</span>
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

        {/* Visual Connected Timeline Stepper Bar */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", letterSpacing: "0.04em" }}>
              시간의 설계 (TIMELINE)
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-ink)" }}>
                총 {current.timeline.totalMinutes}분 완결
              </span>
              {current.timeline.remainingBufferMinutes && current.timeline.remainingBufferMinutes > 0 ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "6px",
                    backgroundColor: "rgba(82, 103, 121, 0.12)",
                    color: "var(--color-dusk)",
                  }}
                  title="지정하신 틈새 시간 중 남은 사전 여유 버퍼"
                >
                  +{current.timeline.remainingBufferMinutes}분 복귀 여유
                </span>
              ) : null}
            </div>
          </div>

          {/* Connected Time Ribbon */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `${Math.max(1, current.timeline.outboundMinutes)}fr ${Math.max(2, current.timeline.stayMinutes)}fr ${Math.max(1, current.timeline.returnMinutes)}fr ${Math.max(1, current.timeline.safetyBufferMinutes)}fr`,
              gap: "3px",
              height: "30px",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "rgba(32, 37, 34, 0.04)",
              padding: "2px",
            }}
          >
            {/* Outbound */}
            <div
              title={`출발 도보: ${current.timeline.outboundMinutes}분`}
              style={{
                backgroundColor: "rgba(82, 103, 121, 0.15)",
                color: "var(--color-dusk)",
                borderRadius: "6px 0 0 6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0 4px",
              }}
            >
              도보 {current.timeline.outboundMinutes}m
            </div>

            {/* Stay */}
            <div
              title={`현장 체류: ${current.timeline.stayMinutes}분`}
              style={{
                backgroundColor: "var(--color-coral)",
                color: "#FAF8F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0 4px",
                boxShadow: "0 1px 4px rgba(228, 111, 93, 0.35)",
              }}
            >
              체류 {current.timeline.stayMinutes}m
            </div>

            {/* Return */}
            <div
              title={`복귀 도보: ${current.timeline.returnMinutes}분`}
              style={{
                backgroundColor: "rgba(82, 103, 121, 0.15)",
                color: "var(--color-dusk)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0 4px",
              }}
            >
              복귀 {current.timeline.returnMinutes}m
            </div>

            {/* Safety Buffer */}
            <div
              title={`안전 여유 버퍼: ${current.timeline.safetyBufferMinutes}분`}
              style={{
                backgroundColor: "rgba(91, 140, 81, 0.2)",
                color: "#445942",
                borderRadius: "0 6px 6px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0 4px",
              }}
            >
              여유 {current.timeline.safetyBufferMinutes}m
            </div>
          </div>
        </div>

        {/* Nearby Small Business Cafes & Tea Rooms Section */}
        {current.nearbyCafes && current.nearbyCafes.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-ink-muted)", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "4px" }}>
                <Coffee size={12} color="var(--color-coral)" />
                <span>주변 소상공인 로컬 카페 · 찻집</span>
              </span>
              <span style={{ fontSize: "10px", color: "var(--color-dusk)", fontWeight: 600 }}>
                도보 2~5분 거리
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "2px",
              }}
              className="no-scrollbar"
            >
              {current.nearbyCafes.map((cafe) => (
                <div
                  key={cafe.id}
                  style={{
                    flex: "0 0 190px",
                    padding: "9px 11px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(32, 37, 34, 0.03)",
                    border: "1px solid rgba(32, 37, 34, 0.06)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--color-ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "120px",
                      }}
                    >
                      {cafe.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "var(--color-coral)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      도보 {cafe.walkingMinutes}분
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--color-ink-muted)" }}>
                    <span style={{ fontWeight: 600, color: "var(--color-dusk)" }}>{cafe.category}</span>
                    {cafe.quietScore && (
                      <>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span style={{ color: "#445942", fontWeight: 600 }}>{cafe.quietScore}</span>
                      </>
                    )}
                  </div>

                  {cafe.signatureMenu && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--color-ink-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginTop: "1px",
                      }}
                    >
                      {cafe.signatureMenu}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Bar with Semantic Accessible Button & Provenance */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
            borderTop: "1px solid rgba(32, 37, 34, 0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <ShieldCheck size={13} color="#445942" />
            <span style={{ fontSize: "11px", color: "var(--color-ink-muted)", fontWeight: 500 }}>
              {current.provenanceMessage || "서울시 실시간 인구데이터 기준 (혼잡도: 여유)"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onOpenDetail(current)}
            aria-label={`${current.place.name} 틈 시작하기`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 15px",
              borderRadius: "var(--radius-button)",
              backgroundColor: "var(--color-coral)",
              color: "#FAF8F3",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(228, 111, 93, 0.35)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>이 틈 시작하기</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

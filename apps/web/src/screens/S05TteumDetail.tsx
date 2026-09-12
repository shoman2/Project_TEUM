import { RecommendationItem } from "@tteum/contracts";
import Header from "../components/Header.js";
import { Footprints, Clock, RotateCcw, ShieldCheck, CheckCircle2, Navigation } from "lucide-react";

interface S05TteumDetailProps {
  item: RecommendationItem;
  onBack: () => void;
  onStartSession: (item: RecommendationItem) => void;
}

export default function S05TteumDetail({ item, onBack, onStartSession }: S05TteumDetailProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header onBack={onBack} areaLabel={item.place.areaName} />

      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: "24px 20px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
        }}
      >
        <div>
          {/* Header Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-chip)",
                backgroundColor: "var(--color-ink)",
                color: "var(--color-paper)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {item.place.name}
            </span>
            <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
              {item.place.indoor ? "실내 공간" : "야외 공간"} · 비용 {item.place.estimatedCostWon === 0 ? "무료" : `${item.place.estimatedCostWon.toLocaleString()}원`}
            </span>
          </div>

          {/* Title and Narrative Line */}
          <h1
            className="font-serif"
            style={{
              fontSize: "26px",
              lineHeight: 1.35,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "var(--color-ink)",
              marginBottom: "12px",
            }}
          >
            {item.title}
          </h1>

          <p
            className="text-body"
            style={{
              fontSize: "15px",
              lineHeight: 1.65,
              color: "var(--color-ink-muted)",
              marginBottom: "28px",
            }}
          >
            {item.line}
          </p>

          {/* Timeline Breakdown Card */}
          <div
            className="card-paper"
            style={{
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className="text-meta" style={{ fontWeight: 600 }}>
                시간의 완결 구조
              </span>
              <span className="text-meta" style={{ color: "var(--color-coral)", fontWeight: 700 }}>
                총 {item.timeline.totalMinutes}분 예정
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-ivory)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-dusk)",
                  }}
                >
                  <Footprints size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-meta" style={{ fontWeight: 600 }}>
                    출발 도보 이동
                  </div>
                  <div className="text-caption">현재 위치에서 장소까지 (여유 도보)</div>
                </div>
                <div className="text-meta" style={{ fontWeight: 600 }}>
                  {item.timeline.outboundMinutes}분
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(228, 111, 93, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-coral)",
                  }}
                >
                  <Clock size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-meta" style={{ fontWeight: 600, color: "var(--color-coral)" }}>
                    현장 온전한 체류
                  </div>
                  <div className="text-caption">서두르지 않고 머무는 시간</div>
                </div>
                <div className="text-meta" style={{ fontWeight: 700, color: "var(--color-coral)" }}>
                  {item.timeline.stayMinutes}분
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-ivory)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-dusk)",
                  }}
                >
                  <RotateCcw size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-meta" style={{ fontWeight: 600 }}>
                    출발지로 복귀 이동
                  </div>
                  <div className="text-caption">다음 일정 장소 또는 원위치로 안전 복귀</div>
                </div>
                <div className="text-meta" style={{ fontWeight: 600 }}>
                  {item.timeline.returnMinutes}분
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(169, 180, 163, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#445942",
                  }}
                >
                  <ShieldCheck size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-meta" style={{ fontWeight: 600 }}>
                    신호 대기 및 안전 여유
                  </div>
                  <div className="text-caption">예기치 못한 지연을 방지하는 보수적 버퍼</div>
                </div>
                <div className="text-meta" style={{ fontWeight: 600, color: "#445942" }}>
                  {item.timeline.safetyBufferMinutes}분
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Facts & Evidence */}
          <div style={{ marginBottom: "24px" }}>
            <span className="text-meta" style={{ fontWeight: 600, display: "block", marginBottom: "12px" }}>
              검증된 추천 근거
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {item.facts.map((fact, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    backgroundColor: "var(--color-paper)",
                    borderRadius: "10px",
                    border: "1px solid rgba(32, 37, 34, 0.04)",
                  }}
                >
                  <CheckCircle2 size={16} color="var(--color-sage)" />
                  <span className="text-body" style={{ fontSize: "14px", color: "var(--color-ink)" }}>
                    {fact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
              데이터 기준: {item.sourceUpdatedAt.substring(11, 16)} 갱신 완료
            </span>
          </div>
        </div>

        {/* CTA: MUST BE "이 틈을 시작합니다" */}
        <button
          className="btn-primary"
          onClick={() => onStartSession(item)}
          id="btn-start-tteum"
        >
          <Navigation size={18} />
          <span>이 틈을 시작합니다</span>
        </button>
      </main>
    </div>
  );
}

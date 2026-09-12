import { useState } from "react";
import { RecommendationItem } from "@tteum/contracts";
import MapView from "../components/MapView.js";
import BottomSheet from "../components/BottomSheet.js";
import Header from "../components/Header.js";


interface S04RecommendationMapProps {
  userLocation: { lat: number; lng: number };
  areaLabel: string;
  gapMinutes: number;
  recommendations: RecommendationItem[];
  dataStatus: "live" | "stale" | "demo";
  onBack: () => void;
  onSelectDetail: (item: RecommendationItem) => void;
}

export default function S04RecommendationMap({
  userLocation,
  areaLabel,
  gapMinutes,
  recommendations,
  dataStatus,
  onBack,
  onSelectDetail,
}: S04RecommendationMapProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusLabel = () => {
    switch (dataStatus) {
      case "live":
        return { text: "서울시 실시간 데이터", bg: "rgba(169, 180, 163, 0.25)", color: "#445942" };
      case "stale":
        return { text: "이전 데이터 유지", bg: "rgba(82, 103, 121, 0.15)", color: "var(--color-dusk)" };
      case "demo":
        return { text: "데모 데이터 기준", bg: "rgba(228, 111, 93, 0.15)", color: "var(--color-coral)" };
    }
  };

  const status = getStatusLabel();

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header onBack={onBack} areaLabel={areaLabel} />

      {/* Floating Status Bar */}
      <div
        style={{
          position: "absolute",
          top: "72px",
          left: "16px",
          right: "16px",
          zIndex: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          backgroundColor: "rgba(250, 248, 243, 0.94)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "var(--radius-button)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid rgba(32, 37, 34, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="font-serif" style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)" }}>
            당신에게 <strong style={{ color: "var(--color-coral)" }}>{gapMinutes}분</strong>의 틈이 있습니다
          </span>
        </div>

        <div
          style={{
            padding: "3px 8px",
            borderRadius: "var(--radius-chip)",
            backgroundColor: status.bg,
            color: status.color,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {status.text}
        </div>
      </div>

      {/* Map Layer */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapView
          userLocation={userLocation}
          recommendations={recommendations}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Bottom Sheet Cards */}
      <BottomSheet
        recommendations={recommendations}
        selectedIndex={selectedIndex}
        onSelectIndex={setSelectedIndex}
        onOpenDetail={onSelectDetail}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
    </div>
  );
}

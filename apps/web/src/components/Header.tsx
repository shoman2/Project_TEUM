import { ArrowLeft, ChevronDown, MapPin } from "lucide-react";
import Logo from "./Logo.js";

interface HeaderProps {
  onBack?: () => void;
  areaLabel?: string;
  timeLabel?: string;
  showLogo?: boolean;
  onLocationClick?: () => void;
  isLocating?: boolean;
}

export default function Header({
  onBack,
  areaLabel,
  timeLabel,
  showLogo = true,
  onLocationClick,
  isLocating = false,
}: HeaderProps) {
  return (
    <header
      style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(32, 37, 34, 0.06)",
        backgroundColor: "var(--color-ivory)",
        zIndex: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {onBack ? (
          <button
            onClick={onBack}
            aria-label="이전 화면으로 이동"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "var(--color-paper)",
              border: "1px solid var(--color-mist)",
              color: "var(--color-ink)",
            }}
          >
            <ArrowLeft size={18} />
          </button>
        ) : showLogo ? (
          <Logo size={28} />
        ) : null}

        {areaLabel && (
          <button
            onClick={onLocationClick}
            type="button"
            disabled={!onLocationClick}
            title={onLocationClick ? "위치 변경 또는 재탐색" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              background: "none",
              border: "none",
              padding: "2px 6px",
              margin: "-2px -6px",
              borderRadius: "6px",
              cursor: onLocationClick ? "pointer" : "default",
              textAlign: "left",
              transition: "background-color 0.15s ease",
            }}
          >
            <span
              className="text-caption"
              style={{
                color: "var(--color-ink-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MapPin size={11} style={{ color: "var(--color-coral)" }} />
              <span>현재 위치</span>
              {isLocating && (
                <span style={{ fontSize: "10px", color: "var(--color-coral)", fontWeight: 600 }}>
                  · 탐색 중...
                </span>
              )}
            </span>
            <span
              className="text-meta"
              style={{
                fontWeight: 600,
                color: "var(--color-ink)",
                display: "flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              {areaLabel}
              {onLocationClick && <ChevronDown size={13} style={{ color: "var(--color-ink-muted)", opacity: 0.7 }} />}
            </span>
          </button>
        )}
      </div>

      {timeLabel && (
        <div style={{ textAlign: "right" }}>
          <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
            기준 시각
          </span>
          <p className="text-meta" style={{ fontWeight: 500, color: "var(--color-dusk)" }}>
            {timeLabel}
          </p>
        </div>
      )}
    </header>
  );
}

import { ArrowLeft } from "lucide-react";
import Logo from "./Logo.js";

interface HeaderProps {
  onBack?: () => void;
  areaLabel?: string;
  timeLabel?: string;
  showLogo?: boolean;
}

export default function Header({ onBack, areaLabel, timeLabel, showLogo = true }: HeaderProps) {
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
              현재 위치
            </span>
            <span className="text-meta" style={{ fontWeight: 600, color: "var(--color-ink)" }}>
              {areaLabel}
            </span>
          </div>
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

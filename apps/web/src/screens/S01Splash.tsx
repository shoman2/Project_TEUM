import Logo from "../components/Logo.js";
import { MapPin } from "lucide-react";

interface S01SplashProps {
  onStart: () => void;
  areaLabel?: string;
  isLocating?: boolean;
  onLocationClick?: () => void;
}

export default function S01Splash({
  onStart,
  areaLabel,
  isLocating = false,
  onLocationClick,
}: S01SplashProps) {
  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 24px 36px",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <div style={{ marginTop: "48px" }}>
        <div style={{ marginBottom: "28px" }}>
          <Logo size={44} />
        </div>

        <h1
          className="font-serif"
          style={{
            fontSize: "30px",
            lineHeight: 1.35,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "var(--color-ink)",
            marginBottom: "18px",
          }}
        >
          남는 시간을,
          <br />
          살아본 시간으로.
        </h1>

        <p
          className="text-body"
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "15px",
            lineHeight: 1.65,
            maxWidth: "300px",
            marginBottom: "24px",
          }}
        >
          현재 위치와 남은 시간을 바탕으로
          <br />
          지금 온전히 완결되는 서울의 틈을 제안합니다.
        </p>

        {/* Live Detected Location Pill */}
        {areaLabel && (
          <button
            type="button"
            onClick={onLocationClick}
            disabled={!onLocationClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "20px",
              backgroundColor: "var(--color-paper)",
              border: "1px solid var(--color-mist)",
              cursor: onLocationClick ? "pointer" : "default",
              transition: "all 0.15s ease",
            }}
          >
            <MapPin size={13} style={{ color: "var(--color-coral)" }} />
            <span className="text-caption" style={{ color: "var(--color-ink)", fontWeight: 600 }}>
              {isLocating ? "위치 찾는 중..." : `${areaLabel} 기준`}
            </span>
            {onLocationClick && (
              <span className="text-caption" style={{ color: "var(--color-coral)", fontWeight: 600, marginLeft: "2px" }}>
                변경
              </span>
            )}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button className="btn-primary" onClick={onStart} id="btn-start-first-tteum">
          나의 첫 틈 찾기
        </button>
        <p className="text-caption" style={{ textAlign: "center", color: "var(--color-ink-muted)" }}>
          로그인 없이 바로 사용할 수 있습니다
        </p>
      </div>
    </div>
  );
}

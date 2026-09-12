import { MapPin, AlertCircle, RefreshCw } from "lucide-react";
import Logo from "./Logo.js";

export function LoadingView({ message = "시간의 틈을 재단하고 있습니다..." }: { message?: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <Logo size={48} />
      </div>
      <p className="font-serif" style={{ fontSize: "18px", color: "var(--color-ink)", marginBottom: "8px" }}>
        {message}
      </p>
      <p className="text-caption" style={{ color: "var(--color-ink-muted)" }}>
        출발·체류·복귀·안전여유를 꼼꼼히 계산하고 있습니다
      </p>
    </div>
  );
}

export function EmptyResultView({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 24px",
      }}
    >
      <div style={{ marginTop: "40px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            backgroundColor: "var(--color-paper)",
            border: "1px solid var(--color-mist)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            color: "var(--color-dusk)",
          }}
        >
          <AlertCircle size={24} />
        </div>

        <h2 className="font-serif" style={{ fontSize: "24px", lineHeight: 1.4, marginBottom: "16px" }}>
          지금은 서두르지 않는 편이 좋습니다.
        </h2>

        <p className="text-body" style={{ color: "var(--color-ink-muted)", marginBottom: "20px" }}>
          이동 여유와 복귀 시간을 보수적으로 포함했을 때 안전하게 완결되는 틈을 찾지 못했습니다.
        </p>

        <div
          style={{
            padding: "16px",
            backgroundColor: "var(--color-paper)",
            borderRadius: "var(--radius-card)",
            border: "1px solid rgba(32, 37, 34, 0.06)",
          }}
        >
          <span className="text-meta" style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>
            《틈》의 원칙
          </span>
          <p className="text-caption" style={{ lineHeight: 1.5 }}>
            무리한 추천으로 다음 약속에 늦거나 숨차게 이동하지 않도록, 조건에 부합하는 정직한 시간만을 제안합니다.
          </p>
        </div>
      </div>

      <button className="btn-primary" onClick={onReset}>
        시간 다시 설정하기
      </button>
    </div>
  );
}

export function LocationPermissionView({
  onSelectArea,
}: {
  onSelectArea: (area: { name: string; lat: number; lng: number }) => void;
}) {
  const PRESET_AREAS = [
    { name: "서울시청·광장", lat: 37.5663, lng: 126.9779 },
    { name: "광화문·세종대로", lat: 37.5714, lng: 126.9768 },
    { name: "을지로입구·청계천", lat: 37.5668, lng: 126.983 },
    { name: "안국동·인사동", lat: 37.5765, lng: 126.9847 },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 24px",
      }}
    >
      <div>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "16px",
            backgroundColor: "var(--color-paper)",
            border: "1px solid var(--color-mist)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
            color: "var(--color-coral)",
          }}
        >
          <MapPin size={24} />
        </div>

        <h2 className="font-serif" style={{ fontSize: "24px", lineHeight: 1.4, marginBottom: "12px" }}>
          출발 지역을 선택해 주세요
        </h2>

        <p className="text-body" style={{ color: "var(--color-ink-muted)", marginBottom: "28px" }}>
          위치 권한 없이도 원하는 권역을 기준으로 틈을 찾을 수 있습니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PRESET_AREAS.map((area) => (
            <button
              key={area.name}
              onClick={() => onSelectArea(area)}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-paper)",
                border: "1px solid var(--color-mist)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 600 }}>{area.name}</span>
              <span className="text-caption" style={{ color: "var(--color-coral)" }}>
                선택
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorStateView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "rgba(178, 78, 69, 0.1)",
          color: "var(--color-danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <AlertCircle size={24} />
      </div>
      <p className="font-serif" style={{ fontSize: "20px", marginBottom: "8px" }}>
        도시 데이터를 일시적으로 불러오지 못했습니다
      </p>
      <p className="text-body" style={{ color: "var(--color-ink-muted)", marginBottom: "24px", maxWidth: "280px" }}>
        {message}
      </p>
      <button className="btn-secondary" onClick={onRetry} style={{ maxWidth: "200px" }}>
        <RefreshCw size={16} />
        <span>다시 시도</span>
      </button>
    </div>
  );
}

import { MapPin, AlertCircle, RefreshCw, Navigation, AlertTriangle, X } from "lucide-react";
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
  onRetryGps,
  isLocating = false,
  locationError = null,
  onClose,
}: {
  onSelectArea: (area: { name: string; lat: number; lng: number }) => void;
  onRetryGps?: () => void;
  isLocating?: boolean;
  locationError?: string | null;
  onClose?: () => void;
}) {
  const PRESET_AREAS = [
    { name: "서울시청·광장", lat: 37.5663, lng: 126.9779 },
    { name: "광화문·세종대로", lat: 37.5714, lng: 126.9768 },
    { name: "을지로입구·청계천", lat: 37.5668, lng: 126.983 },
    { name: "안국동·북촌·인사동", lat: 37.5765, lng: 126.9847 },
    { name: "여의도·한강공원", lat: 37.5284, lng: 126.9246 },
    { name: "강남역·테헤란로", lat: 37.4979, lng: 127.0276 },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "28px 20px 24px",
        backgroundColor: "var(--color-ivory)",
        overflowY: "auto",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              backgroundColor: "var(--color-paper)",
              border: "1px solid var(--color-mist)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-coral)",
            }}
          >
            <MapPin size={22} />
          </div>

          {onClose && (
            <button
              onClick={onClose}
              type="button"
              aria-label="닫기"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--color-paper)",
                border: "1px solid var(--color-mist)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-ink)",
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <h2 className="font-serif" style={{ fontSize: "22px", lineHeight: 1.4, marginBottom: "8px", color: "var(--color-ink)" }}>
          출발 지역 설정 및 GPS 진단
        </h2>

        <p className="text-body" style={{ color: "var(--color-ink-muted)", marginBottom: "20px", fontSize: "14px" }}>
          브라우저의 GPS 위치를 다시 가져오거나 서울 주요 권역을 직접 선택할 수 있습니다.
        </p>

        {/* GPS Re-request button */}
        {onRetryGps && (
          <button
            type="button"
            onClick={onRetryGps}
            disabled={isLocating}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: "var(--radius-button)",
              backgroundColor: "var(--color-ink)",
              color: "var(--color-paper)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontWeight: 600,
              fontSize: "15px",
              marginBottom: "16px",
              cursor: isLocating ? "not-allowed" : "pointer",
              opacity: isLocating ? 0.8 : 1,
            }}
          >
            {isLocating ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>현재 GPS 위치 찾는 중...</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>현재 GPS 위치 다시 가져오기</span>
              </>
            )}
          </button>
        )}

        {/* Diagnostic Guide when error occurred */}
        {locationError && (
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "rgba(228, 111, 93, 0.08)",
              border: "1px solid rgba(228, 111, 93, 0.25)",
              borderRadius: "var(--radius-card)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <AlertTriangle size={18} style={{ color: "var(--color-coral)", flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p className="text-meta" style={{ fontWeight: 600, color: "var(--color-coral)", marginBottom: "4px" }}>
                  위치 확인 안내
                </p>
                <p className="text-caption" style={{ color: "var(--color-ink)", lineHeight: 1.5 }}>
                  {locationError}
                </p>
                <div
                  className="text-caption"
                  style={{
                    color: "var(--color-ink-muted)",
                    marginTop: "8px",
                    lineHeight: 1.4,
                    borderTop: "1px dashed rgba(32, 37, 34, 0.12)",
                    paddingTop: "6px",
                  }}
                >
                  💡 <strong>해결 팁:</strong> Chrome/Safari 주소창 좌측의 <strong>자물쇠/설정</strong> 아이콘을 눌러 [위치]를 <strong>허용</strong>으로 변경하거나, Mac의 <strong>[시스템 설정 &gt; 개인정보 보호 및 보안 &gt; 위치 서비스]</strong>를 켜주세요.
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "8px" }}>
          <span className="text-caption" style={{ color: "var(--color-ink-muted)", fontWeight: 600 }}>
            또는 서울 주요 권역 직접 선택
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PRESET_AREAS.map((area) => (
            <button
              key={area.name}
              type="button"
              onClick={() => onSelectArea(area)}
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: "var(--radius-button)",
                backgroundColor: "var(--color-paper)",
                border: "1px solid var(--color-mist)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-ink)" }}>{area.name}</span>
              <span className="text-caption" style={{ color: "var(--color-coral)", fontWeight: 600 }}>
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

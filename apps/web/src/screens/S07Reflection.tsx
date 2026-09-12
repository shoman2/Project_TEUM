import { useState } from "react";
import Header from "../components/Header.js";
import { Smile, Meh, Frown, Sparkles, Home } from "lucide-react";

interface S07ReflectionProps {
  actualMinutes: number;
  totalSavedMinutes: number;
  onSubmitReflection: (reflection: "regret" | "okay" | "repeat") => void;
  onGoHome: () => void;
}

export default function S07Reflection({
  actualMinutes,
  totalSavedMinutes,
  onSubmitReflection,
  onGoHome,
}: S07ReflectionProps) {
  const [selectedReflection, setSelectedReflection] = useState<"regret" | "okay" | "repeat" | null>(null);

  const handleSelect = (r: "regret" | "okay" | "repeat") => {
    setSelectedReflection(r);
    onSubmitReflection(r);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header />

      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: "32px 20px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
        }}
      >
        <div>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span
              className="text-caption"
              style={{
                color: "var(--color-coral)",
                fontWeight: 600,
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "8px",
              }}
            >
              틈의 완결
            </span>
            <h1 className="font-serif text-h1" style={{ marginBottom: "12px" }}>
              이 시간을
              <br />
              잘 보냈나요?
            </h1>
            <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>
              {actualMinutes}분의 여백이 살아본 시간으로 채워졌습니다.
            </p>
          </div>

          {/* Reflection 3-step buttons */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
            {[
              { key: "regret" as const, label: "아쉬움", icon: Frown },
              { key: "okay" as const, label: "괜찮음", icon: Meh },
              { key: "repeat" as const, label: "다시 하고 싶음", icon: Smile },
            ].map((option) => {
              const isSelected = selectedReflection === option.key;
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  onClick={() => handleSelect(option.key)}
                  style={{
                    flex: 1,
                    padding: "20px 10px",
                    borderRadius: "var(--radius-card)",
                    backgroundColor: isSelected ? "var(--color-ink)" : "var(--color-paper)",
                    color: isSelected ? "var(--color-paper)" : "var(--color-ink)",
                    border: isSelected ? "1px solid var(--color-ink)" : "1px solid var(--color-mist)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: isSelected ? "var(--shadow-card)" : "none",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <Icon size={26} strokeWidth={1.8} />
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Total Reclaimed Time Box (North Star Metric) */}
          <div
            className="card-paper"
            style={{
              padding: "24px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "8px" }}>
              <Sparkles size={16} color="var(--color-coral)" />
              <span className="text-meta" style={{ fontWeight: 600, color: "var(--color-ink-muted)" }}>
                내가 되찾은 시간
              </span>
            </div>

            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "40px",
                fontWeight: 700,
                color: "var(--color-ink)",
                letterSpacing: "-0.03em",
                marginBottom: "6px",
              }}
            >
              {totalSavedMinutes}분
            </div>

            <p className="text-caption" style={{ color: "var(--color-ink-muted)", lineHeight: 1.5 }}>
              그냥 집으로 향하지 않고 온전히 살아낸 서울의 총 시간입니다.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: "20px" }}>
          <button className="btn-primary" onClick={onGoHome} id="btn-return-home">
            <Home size={18} />
            <span>홈으로 돌아가기</span>
          </button>
        </div>
      </main>
    </div>
  );
}

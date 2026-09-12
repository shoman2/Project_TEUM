import { useState } from "react";
import { Clock } from "lucide-react";

interface TimeChipGroupProps {
  value: number;
  onChange: (minutes: number) => void;
}

const PRESET_MINUTES = [15, 30, 60, 90];

export default function TimeChipGroup({ value, onChange }: TimeChipGroupProps) {
  const [isCustom, setIsCustom] = useState(!PRESET_MINUTES.includes(value));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {PRESET_MINUTES.map((mins) => {
          const isSelected = !isCustom && value === mins;
          return (
            <button
              key={mins}
              onClick={() => {
                setIsCustom(false);
                onChange(mins);
              }}
              style={{
                flex: "1 1 calc(50% - 10px)",
                padding: "16px 20px",
                borderRadius: "var(--radius-button)",
                backgroundColor: isSelected ? "var(--color-ink)" : "var(--color-paper)",
                color: isSelected ? "var(--color-paper)" : "var(--color-ink)",
                border: isSelected ? "1px solid var(--color-ink)" : "1px solid var(--color-mist)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: isSelected ? "var(--shadow-card)" : "none",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} opacity={isSelected ? 0.9 : 0.5} />
                <span style={{ fontSize: "17px", fontWeight: 600 }}>{mins}분</span>
              </div>
              <span style={{ fontSize: "12px", opacity: isSelected ? 0.8 : 0.6 }}>
                {mins <= 30 ? "가까운 쉼" : mins <= 60 ? "여유로운 틈" : "충분한 탐색"}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => {
            setIsCustom(true);
            if (!PRESET_MINUTES.includes(value)) {
              onChange(value);
            } else {
              onChange(45);
            }
          }}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "var(--radius-button)",
            backgroundColor: isCustom ? "var(--color-ink)" : "var(--color-paper)",
            color: isCustom ? "var(--color-paper)" : "var(--color-ink)",
            border: isCustom ? "1px solid var(--color-ink)" : "1px solid var(--color-mist)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "15px",
            fontWeight: 500,
            transition: "all var(--transition-fast)",
          }}
        >
          <span>직접 시간 입력</span>
        </button>
      </div>

      {isCustom && (
        <div
          className="card-paper animate-fade-in"
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="text-meta" style={{ color: "var(--color-ink-muted)" }}>
              남은 시간 조절
            </span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-coral)" }}>
              {value}분
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="180"
            step="5"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "var(--color-coral)",
              cursor: "pointer",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }} className="text-caption">
            <span>10분</span>
            <span>60분</span>
            <span>120분</span>
            <span>180분</span>
          </div>
        </div>
      )}
    </div>
  );
}

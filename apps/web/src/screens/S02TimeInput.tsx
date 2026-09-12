import Header from "../components/Header.js";
import TimeChipGroup from "../components/TimeChipGroup.js";
import { ArrowRight } from "lucide-react";

interface S02TimeInputProps {
  areaLabel: string;
  currentTimeStr: string;
  gapMinutes: number;
  onGapMinutesChange: (minutes: number) => void;
  onNext: () => void;
}

export default function S02TimeInput({
  areaLabel,
  currentTimeStr,
  gapMinutes,
  onGapMinutesChange,
  onNext,
}: S02TimeInputProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header areaLabel={areaLabel} timeLabel={currentTimeStr} />

      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          padding: "24px 20px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflowY: "auto",
        }}
      >
        <div>
          <div style={{ marginBottom: "28px" }}>
            <span
              className="text-caption"
              style={{
                color: "var(--color-coral)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
                display: "block",
              }}
            >
              Step 1 of 2
            </span>
            <h1 className="font-serif text-h1" style={{ color: "var(--color-ink)", marginBottom: "8px" }}>
              지금 몇 분의
              <br />
              틈이 있나요?
            </h1>
            <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>
              다음 일정까지 서두르지 않고 완결할 수 있는 시간을 선택해 주세요.
            </p>
          </div>

          <TimeChipGroup value={gapMinutes} onChange={onGapMinutesChange} />
        </div>

        <div style={{ paddingTop: "24px" }}>
          <button className="btn-primary" onClick={onNext} id="btn-time-next">
            <span>다음</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}

import { Mood } from "@tteum/contracts";
import Header from "../components/Header.js";
import MoodCardGroup from "../components/MoodCardGroup.js";
import { Sparkles } from "lucide-react";

interface S03MoodInputProps {
  areaLabel: string;
  currentTimeStr: string;
  gapMinutes: number;
  mood: Mood;
  onMoodChange: (mood: Mood) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function S03MoodInput({
  areaLabel,
  currentTimeStr,
  gapMinutes,
  mood,
  onMoodChange,
  onBack,
  onSubmit,
}: S03MoodInputProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-ivory)",
      }}
    >
      <Header onBack={onBack} areaLabel={areaLabel} timeLabel={currentTimeStr} />

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
          <div style={{ marginBottom: "24px" }}>
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
              Step 2 of 2 · {gapMinutes}분의 틈
            </span>
            <h1 className="font-serif text-h1" style={{ color: "var(--color-ink)", marginBottom: "8px" }}>
              이 시간을
              <br />
              어떻게 보내고 싶나요?
            </h1>
            <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>
              지금 당신의 마음에 가장 가까운 결을 골라주세요.
            </p>
          </div>

          <MoodCardGroup value={mood} onChange={onMoodChange} />
        </div>

        <div style={{ paddingTop: "24px" }}>
          <button className="btn-primary" onClick={onSubmit} id="btn-submit-search">
            <Sparkles size={18} />
            <span>오늘 가능한 시간 제안받기</span>
          </button>
        </div>
      </main>
    </div>
  );
}

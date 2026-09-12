import { Mood } from "@tteum/contracts";
import { Wind, Footprints, Compass, Coffee } from "lucide-react";

interface MoodCardGroupProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

const MOODS: Array<{
  id: Mood;
  title: string;
  desc: string;
  icon: typeof Wind;
}> = [
  {
    id: "empty",
    title: "비우고 싶어요",
    desc: "생각을 덜어내고 고요히 호흡하는 시간",
    icon: Wind,
  },
  {
    id: "walk",
    title: "걷고 싶어요",
    desc: "서두르지 않고 서울의 골목과 돌담을 걷기",
    icon: Footprints,
  },
  {
    id: "discover",
    title: "새로운 것을 보고 싶어요",
    desc: "전시나 건축, 익숙한 도시 속 뜻밖의 시선",
    icon: Compass,
  },
  {
    id: "stay",
    title: "잠시 머물고 싶어요",
    desc: "서가나 작은 마당 벤치에 기대어 쉬어가기",
    icon: Coffee,
  },
];

export default function MoodCardGroup({ value, onChange }: MoodCardGroupProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {MOODS.map((m) => {
        const isSelected = value === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              width: "100%",
              padding: "18px 20px",
              borderRadius: "var(--radius-card)",
              backgroundColor: isSelected ? "var(--color-paper)" : "rgba(250, 248, 243, 0.6)",
              border: isSelected ? "2px solid var(--color-ink)" : "1px solid var(--color-mist)",
              boxShadow: isSelected ? "var(--shadow-card)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              textAlign: "left",
              transition: "all var(--transition-fast)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: isSelected ? "var(--color-ink)" : "var(--color-ivory)",
                color: isSelected ? "var(--color-paper)" : "var(--color-dusk)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all var(--transition-fast)",
              }}
            >
              <Icon size={22} strokeWidth={1.75} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: isSelected ? "var(--color-ink)" : "var(--color-ink-muted)",
                  marginBottom: "4px",
                }}
              >
                {m.title}
              </div>
              <div
                className="text-caption"
                style={{
                  color: "var(--color-ink-muted)",
                  lineHeight: 1.4,
                }}
              >
                {m.desc}
              </div>
            </div>

            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: isSelected ? "5px solid var(--color-coral)" : "2px solid var(--color-mist)",
                backgroundColor: "var(--color-paper)",
                flexShrink: 0,
                transition: "all var(--transition-fast)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

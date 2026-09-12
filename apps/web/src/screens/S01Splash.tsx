import Logo from "../components/Logo.js";

interface S01SplashProps {
  onStart: () => void;
}

export default function S01Splash({ onStart }: S01SplashProps) {
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
      <div style={{ marginTop: "60px" }}>
        <div style={{ marginBottom: "32px" }}>
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
          }}
        >
          현재 위치와 남은 시간을 바탕으로
          <br />
          지금 온전히 완결되는 서울의 틈을 제안합니다.
        </p>
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

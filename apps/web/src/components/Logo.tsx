export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="64" height="64" rx="16" fill="#F4F1E9" />
        <g fill="#202522">
          {/* ㅌ */}
          <path d="M14 18 h16 v4 h-11 v6 h9 v4 h-9 v6 h11 v4 h-16 z" />
          {/* Temporal Slit (틈) */}
          <rect x="33" y="16" width="3" height="32" rx="1.5" fill="#526779" opacity="0.4" />
          {/* ㅡ */}
          <rect x="38" y="27" width="14" height="4" rx="1" />
          {/* ㅁ */}
          <path d="M38 34 h14 v12 h-14 z M42 38 v4 h6 v-4 z" />
        </g>
      </svg>
      <span
        className="font-serif"
        style={{
          fontSize: `${Math.round(size * 0.65)}px`,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "var(--color-ink)",
        }}
      >
        틈
      </span>
    </div>
  );
}

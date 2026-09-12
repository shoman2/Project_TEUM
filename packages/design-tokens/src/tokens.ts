export const colors = {
  ivory: "#f4f1e9",
  paper: "#faf8f3",
  ink: "#202522",
  inkMuted: "#626a65",
  dusk: "#526779",
  sage: "#a9b4a3",
  coral: "#e46f5d",
  mist: "#d9ddda",
  night: "#151b1a",
  danger: "#b24e45",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  base: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
} as const;

export const radius = {
  sm: "8px",
  button: "16px",
  card: "20px",
  sheet: "28px",
  full: "9999px",
} as const;

export const shadows = {
  sheet: "0 -8px 32px rgba(32, 37, 34, 0.08)",
  card: "0 8px 24px rgba(32, 37, 34, 0.06)",
  floating: "0 12px 32px rgba(32, 37, 34, 0.12)",
} as const;

export const typography = {
  fontSans: "'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  fontSerif: "'MaruBuri', 'Nanum Myeongjo', Georgia, serif",
} as const;

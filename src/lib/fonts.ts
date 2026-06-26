import localFont from "next/font/local";

// Pretendard — single variable font covering Latin + Hangul (ADR-0011).
// Self-hosted via next/font/local: no render-blocking external request, no CLS.
// Variable weight axis 45–920 → exposes the full 400/500/600/700 ramp we use.
export const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  style: "normal",
  variable: "--font-pretendard",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Malgun Gothic",
    "sans-serif",
  ],
});

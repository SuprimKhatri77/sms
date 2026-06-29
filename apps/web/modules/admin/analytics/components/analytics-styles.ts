export const ANALYTICS_BORDER = "rgba(47,78,64,0.18)";
export const ANALYTICS_BORDER_LIGHT = "rgba(47,78,64,0.12)";
export const ANALYTICS_MUTED = "rgba(47,78,64,0.5)";
export const ANALYTICS_GRID_STROKE = "rgba(47,78,64,0.08)";
export const ANALYTICS_TICK_FILL = "rgba(47,78,64,0.45)";

export const CHART_TOOLTIP_STYLE = {
  borderRadius: 0,
  border: `1px solid ${ANALYTICS_BORDER}`,
  boxShadow: "none",
  fontSize: 13,
  fontFamily: "var(--font-dm-sans)",
  backgroundColor: "#fff",
} as const;

export const CHART_TOOLTIP_LABEL_STYLE = {
  color: "#1a1a1a",
  fontWeight: 600,
  fontSize: 13,
} as const;

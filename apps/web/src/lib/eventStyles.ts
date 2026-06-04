import type { EventCategory } from "@terra-watch/types";

export const EVENT_STYLES: Record<EventCategory, { label: string; color: string; glow: string }> = {
  wildfires: {
    label: "Wildfires",
    color: "#FF4500",
    glow: "rgba(255, 69, 0, 0.34)"
  },
  severeStorms: {
    label: "Severe Storms",
    color: "#00BFFF",
    glow: "rgba(0, 191, 255, 0.32)"
  },
  earthquakes: {
    label: "Earthquakes",
    color: "#FFC107",
    glow: "rgba(255, 193, 7, 0.3)"
  },
  volcanoes: {
    label: "Volcanoes",
    color: "#FF1744",
    glow: "rgba(255, 23, 68, 0.32)"
  },
  floods: {
    label: "Floods",
    color: "#2979FF",
    glow: "rgba(41, 121, 255, 0.3)"
  },
  drought: {
    label: "Drought",
    color: "#A1887F",
    glow: "rgba(161, 136, 127, 0.28)"
  },
  seaLakeIce: {
    label: "Sea & Lake Ice",
    color: "#E0F7FA",
    glow: "rgba(224, 247, 250, 0.28)"
  },
  population: {
    label: "Population",
    color: "#8A96A8",
    glow: "rgba(138, 150, 168, 0.18)"
  },
  satellite: {
    label: "Satellite",
    color: "#C084FC",
    glow: "rgba(192, 132, 252, 0.24)"
  },
  other: {
    label: "Other",
    color: "#B6E3FF",
    glow: "rgba(182, 227, 255, 0.24)"
  }
};

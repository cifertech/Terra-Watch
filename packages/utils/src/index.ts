import type { DisasterEvent, EventCategory, EventLayerId } from "@terra-watch/types";

export function formatCoordinate(value: number, axis: "lat" | "lon"): string {
  const direction = axis === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(2)}° ${direction}`;
}

export function latestByDate<T extends { date: string }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
}

export function earliestByDate<T extends { date: string }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];
}

export function eventDate(event: DisasterEvent): string | null {
  return latestByDate(event.geometry)?.date ?? event.updatedAt ?? event.startedAt;
}

export function isEventVisibleOnDate(event: DisasterEvent, date: string): boolean {
  const target = startOfDay(date).getTime();
  const started = event.startedAt ? startOfDay(event.startedAt).getTime() : null;
  const closed = event.closed ? startOfDay(event.closed).getTime() : null;

  if (started !== null && started > target) {
    return false;
  }

  if (closed !== null && closed < target) {
    return false;
  }

  if (started === null && event.geometry.length > 0) {
    return event.geometry.some((point) => startOfDay(point.date).getTime() <= target);
  }

  return true;
}

export function filterEventsByLayers(events: DisasterEvent[], activeLayers: EventLayerId[]): DisasterEvent[] {
  const active = new Set(activeLayers);
  return events.filter((event) => active.has(event.layerId));
}

export function filterEventsByDate(events: DisasterEvent[], date: string | null): DisasterEvent[] {
  return date ? events.filter((event) => isEventVisibleOnDate(event, date)) : events.filter((event) => event.status === "open");
}

export function countByCategory(events: DisasterEvent[]): Array<[EventCategory, number]> {
  const counts = new Map<EventCategory, number>();
  events.forEach((event) => counts.set(event.category, (counts.get(event.category) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function mostSevereEvent(events: DisasterEvent[]): DisasterEvent | null {
  return [...events]
    .filter((event) => event.severity !== null)
    .sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))[0] ?? null;
}

export function encodeLayers(layers: EventLayerId[]): string {
  return layers.join(",");
}

export function decodeLayers(value: string | null, fallback: EventLayerId[]): EventLayerId[] {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((layer) => layer.trim())
    .filter(Boolean) as EventLayerId[];
}

function startOfDay(value: string): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

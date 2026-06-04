import type {
  DataSourceId,
  DisasterEvent,
  EventCategory,
  EventGeometryPoint,
  EventHistoryPoint,
  EventLayerId,
  EventMagnitude,
} from "@terra-watch/types";

const CATEGORY_MAP: Record<string, EventCategory> = {
  wildfires: "wildfires",
  severeStorms: "severeStorms",
  volcanoes: "volcanoes",
  floods: "floods",
  drought: "drought",
  seaLakeIce: "seaLakeIce"
};

const LAYER_MAP: Record<string, EventLayerId> = {
  wildfires: "wildfires",
  severeStorms: "severeStorms",
  volcanoes: "volcanoes",
  floods: "floods",
  drought: "drought",
  seaLakeIce: "seaLakeIce"
};

const SOURCE_ID: DataSourceId = "eonet";

interface EonetCategory {
  id: string;
  title: string;
}

interface EonetSource {
  id: string;
  url: string;
}

interface EonetGeometry {
  date: string;
  type: string;
  coordinates: unknown;
  magnitudeValue?: number;
  magnitudeUnit?: string;
}

interface EonetEvent {
  id: string;
  title: string;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
}

interface EonetResponse {
  events: EonetEvent[];
}

export async function fetchEonetEvents(baseUrl: string, status = "open"): Promise<DisasterEvent[]> {
  if (status === "all") {
    const [open, closed] = await Promise.all([fetchEonetEvents(baseUrl, "open"), fetchEonetEvents(baseUrl, "closed")]);
    return [...new Map([...open, ...closed].map((event) => [event.id, event])).values()];
  }

  const url = new URL(`${baseUrl.replace(/\/$/, "")}/events`);
  url.searchParams.set("status", status);
  url.searchParams.set("limit", "500");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NASA EONET responded with ${response.status}`);
  }

  const data = (await response.json()) as EonetResponse;
  return data.events.map(normalizeEvent).filter((event): event is DisasterEvent => event !== null);
}

function normalizeEvent(event: EonetEvent): DisasterEvent | null {
  const rawCategory = event.categories[0]?.id;
  const category = normalizeCategory(rawCategory);
  const layerId = normalizeLayer(rawCategory);
  const geometry = event.geometry.map(normalizeGeometry).filter((point): point is EventGeometryPoint => point !== null);

  if (geometry.length === 0) {
    return null;
  }

  const latestGeometry = [...event.geometry].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  const history = event.geometry.map(normalizeHistory).filter((point): point is EventHistoryPoint => point !== null);
  const startedAt = [...geometry].sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0]?.date ?? null;
  const updatedAt = [...geometry].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0]?.date ?? null;
  const magnitude = normalizeMagnitude(latestGeometry);

  return {
    id: `${SOURCE_ID}:${event.id}`,
    title: event.title,
    category,
    layerId,
    sourceId: SOURCE_ID,
    source: "NASA EONET v3",
    sourceUrl: event.sources[0]?.url ?? `https://eonet.gsfc.nasa.gov/api/v3/events/${event.id}`,
    status: event.closed ? "closed" : "open",
    geometry,
    history,
    magnitude,
    severity: magnitude.value,
    startedAt,
    updatedAt,
    closed: event.closed,
    country: null,
    metadata: {
      eonetId: event.id,
      categories: event.categories.map((item) => item.title).join(", ")
    }
  };
}

function normalizeCategory(categoryId: string | undefined): EventCategory {
  return categoryId ? CATEGORY_MAP[categoryId] ?? "other" : "other";
}

function normalizeLayer(categoryId: string | undefined): EventLayerId {
  return categoryId ? LAYER_MAP[categoryId] ?? "other" : "other";
}

function normalizeGeometry(geometry: EonetGeometry): EventGeometryPoint | null {
  const coordinate = findCoordinatePair(geometry.coordinates);
  if (!coordinate) {
    return null;
  }

  return {
    date: geometry.date,
    lon: coordinate[0],
    lat: coordinate[1]
  };
}

function normalizeHistory(geometry: EonetGeometry): EventHistoryPoint | null {
  const point = normalizeGeometry(geometry);
  if (!point) {
    return null;
  }

  return {
    ...point,
    magnitude: normalizeMagnitude(geometry)
  };
}

function normalizeMagnitude(geometry: EonetGeometry | undefined): EventMagnitude {
  if (!geometry || typeof geometry.magnitudeValue !== "number") {
    return { value: null, unit: null };
  }

  return {
    value: geometry.magnitudeValue,
    unit: geometry.magnitudeUnit ?? null
  };
}

function findCoordinatePair(value: unknown): [number, number] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (typeof value[0] === "number" && typeof value[1] === "number") {
    return [value[0], value[1]];
  }

  for (const child of value) {
    const coordinate = findCoordinatePair(child);
    if (coordinate) {
      return coordinate;
    }
  }

  return null;
}

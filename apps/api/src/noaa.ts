import type { DisasterEvent } from "@terra-watch/types";

interface NoaaStormResponse {
  activeStorms?: NoaaStorm[];
  storms?: NoaaStorm[];
}

interface NoaaStorm {
  id?: string;
  name?: string;
  binNumber?: string;
  classification?: string;
  intensity?: string | number;
  pressure?: string | number;
  latitude?: string | number;
  longitude?: string | number;
  lastUpdate?: string;
  publicAdvisory?: string;
}

export async function fetchNoaaStorms(feedUrl: string): Promise<DisasterEvent[]> {
  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`NOAA NHC feed responded with ${response.status}`);
  }

  const data = (await response.json()) as NoaaStormResponse | NoaaStorm[];
  const storms = Array.isArray(data) ? data : data.activeStorms ?? data.storms ?? [];
  return storms.map(normalizeStorm).filter((event): event is DisasterEvent => event !== null);
}

function normalizeStorm(storm: NoaaStorm): DisasterEvent | null {
  const lat = parseCoordinate(storm.latitude);
  const lon = parseCoordinate(storm.longitude);

  if (lat === null || lon === null) {
    return null;
  }

  const date = storm.lastUpdate ? new Date(storm.lastUpdate).toISOString() : new Date().toISOString();
  const id = storm.id ?? storm.binNumber ?? `${storm.name ?? "storm"}-${date}`;
  const wind = parseNumber(storm.intensity);
  const name = storm.name ?? "Active tropical storm";

  return {
    id: `noaa:${id}`,
    title: `${storm.classification ?? "Tropical system"} ${name}`.trim(),
    category: "severeStorms",
    layerId: "severeStorms",
    sourceId: "noaa",
    source: "NOAA National Hurricane Center",
    sourceUrl: storm.publicAdvisory ?? "https://www.nhc.noaa.gov/",
    status: "open",
    geometry: [{ date, lon, lat }],
    history: [
      {
        date,
        lon,
        lat,
        magnitude: {
          value: wind,
          unit: "kt"
        }
      }
    ],
    magnitude: {
      value: wind,
      unit: "kt"
    },
    severity: wind,
    startedAt: date,
    updatedAt: date,
    closed: null,
    country: null,
    metadata: {
      pressureMb: parseNumber(storm.pressure),
      classification: storm.classification ?? null
    }
  };
}

function parseCoordinate(value: string | number | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) {
    return null;
  }

  if (normalized.endsWith("S") || normalized.endsWith("W")) {
    return -Math.abs(numeric);
  }

  return numeric;
}

function parseNumber(value: string | number | undefined): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

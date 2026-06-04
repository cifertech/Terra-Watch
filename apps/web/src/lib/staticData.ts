import type {
  AskGlobeResponse,
  DisasterEvent,
  EventEnrichment,
  EventEnrichmentResponse,
  EventGeometryPoint,
  EventHistoryPoint,
  EventLayerId,
  EventMagnitude,
  EventsResponse,
  SatelliteLayer
} from "@terra-watch/types";

const EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v3";
const USGS_FEED_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
const NOAA_STORMS_URL = "https://www.nhc.noaa.gov/CurrentStorms.json";
const GIBS_WMTS_BASE_URL = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";

interface EonetEvent {
  id: string;
  title: string;
  closed: string | null;
  categories: Array<{ id: string; title: string }>;
  sources: Array<{ id: string; url: string }>;
  geometry: Array<{ date: string; coordinates: unknown; magnitudeValue?: number; magnitudeUnit?: string }>;
}

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number;
    url: string;
    status: string;
    type: string;
    title: string;
  };
  geometry: { coordinates: [number, number, number?] };
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

const CATEGORY_MAP: Record<string, DisasterEvent["category"]> = {
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

export async function fetchStaticEvents(): Promise<EventsResponse> {
  const results = await Promise.allSettled([fetchEonet(), fetchUsgs(), fetchNoaa()]);
  const [eonet, usgs, noaa] = results.map((result) => (result.status === "fulfilled" ? result.value : []));
  const warnings = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => (result.reason instanceof Error ? result.reason.message : "A public data source is unavailable"));

  return {
    generatedAt: new Date().toISOString(),
    source: "Terra Watch static public feed",
    sources: [
      {
        id: "eonet",
        label: "NASA EONET v3",
        ok: results[0].status === "fulfilled",
        updatedAt: results[0].status === "fulfilled" ? new Date().toISOString() : null,
        message: results[0].status === "rejected" ? "Direct browser fetch failed" : undefined
      },
      {
        id: "usgs",
        label: "USGS Earthquake Hazards",
        ok: results[1].status === "fulfilled",
        updatedAt: results[1].status === "fulfilled" ? new Date().toISOString() : null,
        message: results[1].status === "rejected" ? "Direct browser fetch failed" : undefined
      },
      {
        id: "noaa",
        label: "NOAA National Hurricane Center",
        ok: results[2].status === "fulfilled",
        updatedAt: results[2].status === "fulfilled" ? new Date().toISOString() : null,
        message: results[2].status === "rejected" ? "Direct browser fetch failed" : undefined
      },
      {
        id: "gibs",
        label: "NASA GIBS WMTS",
        ok: true,
        updatedAt: new Date().toISOString()
      }
    ],
    layers: getStaticGibsLayers(),
    warnings,
    events: [...eonet, ...usgs, ...noaa].sort((a, b) => {
      const aTime = Date.parse(a.updatedAt ?? a.startedAt ?? "1970-01-01T00:00:00.000Z");
      const bTime = Date.parse(b.updatedAt ?? b.startedAt ?? "1970-01-01T00:00:00.000Z");
      return bTime - aTime;
    })
  };
}

export async function fetchStaticEnrichment(eventId: string, events: DisasterEvent[]): Promise<EventEnrichmentResponse> {
  const event = events.find((item) => item.id === eventId);
  const enrichment = event ? await enrichEvent(event) : emptyEnrichment();

  return {
    eventId,
    generatedAt: new Date().toISOString(),
    enrichment,
    warnings: event ? [] : ["Event was not found in the current static feed"]
  };
}

export function askStaticGlobe(question: string, events: DisasterEvent[]): AskGlobeResponse {
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.category] = (acc[event.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");
  const severe = [...events].sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))[0];

  return {
    answer: `Static GitHub Pages mode answered from public browser data for "${question}". Terra Watch currently has ${events.length} events. Top categories: ${topCategories || "none yet"}. ${
      severe ? `Most severe visible event: ${severe.title}.` : "No severity-ranked event is available."
    }`,
    sources: ["Static public feed"],
    fallback: true
  };
}

async function fetchEonet(): Promise<DisasterEvent[]> {
  return fetchEonetStatus("open");
}

async function fetchEonetStatus(status: "open" | "closed"): Promise<DisasterEvent[]> {
  const url = new URL(`${EONET_BASE_URL}/events`);
  url.searchParams.set("status", status);
  url.searchParams.set("limit", "500");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`NASA EONET responded with ${response.status}`);
  }

  const data = (await response.json()) as { events: EonetEvent[] };
  return data.events.map(normalizeEonetEvent).filter((event): event is DisasterEvent => event !== null);
}

async function fetchUsgs(): Promise<DisasterEvent[]> {
  const response = await fetch(USGS_FEED_URL);
  if (!response.ok) {
    throw new Error(`USGS earthquake feed responded with ${response.status}`);
  }

  const data = (await response.json()) as { features: UsgsFeature[] };
  return data.features.map(normalizeUsgsEvent);
}

async function fetchNoaa(): Promise<DisasterEvent[]> {
  const response = await fetch(NOAA_STORMS_URL);
  if (!response.ok) {
    throw new Error(`NOAA storm feed responded with ${response.status}`);
  }

  const data = (await response.json()) as { activeStorms?: NoaaStorm[]; storms?: NoaaStorm[] } | NoaaStorm[];
  const storms = Array.isArray(data) ? data : data.activeStorms ?? data.storms ?? [];
  return storms.map(normalizeNoaaEvent).filter((event): event is DisasterEvent => event !== null);
}

function normalizeEonetEvent(event: EonetEvent): DisasterEvent | null {
  const rawCategory = event.categories[0]?.id;
  const geometry = event.geometry.map(normalizeEonetGeometry).filter((point): point is EventGeometryPoint => point !== null);
  if (geometry.length === 0) {
    return null;
  }

  const sorted = [...geometry].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const latestGeometry = [...event.geometry].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  const magnitude = normalizeMagnitude(latestGeometry);

  return {
    id: `eonet:${event.id}`,
    title: event.title,
    category: rawCategory ? CATEGORY_MAP[rawCategory] ?? "other" : "other",
    layerId: rawCategory ? LAYER_MAP[rawCategory] ?? "other" : "other",
    sourceId: "eonet",
    source: "NASA EONET v3",
    sourceUrl: event.sources[0]?.url ?? `${EONET_BASE_URL}/events/${event.id}`,
    status: event.closed ? "closed" : "open",
    geometry,
    history: event.geometry.map(normalizeEonetHistory).filter((point): point is EventHistoryPoint => point !== null),
    magnitude,
    severity: magnitude.value,
    startedAt: sorted[0]?.date ?? null,
    updatedAt: sorted.at(-1)?.date ?? null,
    closed: event.closed,
    country: null,
    metadata: {
      eonetId: event.id,
      categories: event.categories.map((item) => item.title).join(", ")
    }
  };
}

function normalizeUsgsEvent(feature: UsgsFeature): DisasterEvent {
  const [lon, lat, depthKm] = feature.geometry.coordinates;
  const date = new Date(feature.properties.time).toISOString();
  const updatedAt = new Date(feature.properties.updated).toISOString();

  return {
    id: `usgs:${feature.id}`,
    title: feature.properties.title,
    category: "earthquakes",
    layerId: "earthquakes",
    sourceId: "usgs",
    source: "USGS Earthquake Hazards",
    sourceUrl: feature.properties.url,
    status: "open",
    geometry: [{ date, lon, lat }],
    history: [{ date, lon, lat, magnitude: { value: feature.properties.mag, unit: "Mw" } }],
    magnitude: { value: feature.properties.mag, unit: "Mw" },
    severity: feature.properties.mag,
    startedAt: date,
    updatedAt,
    closed: null,
    country: extractCountry(feature.properties.place),
    metadata: {
      depthKm: depthKm ?? null,
      place: feature.properties.place,
      eventType: feature.properties.type,
      reviewStatus: feature.properties.status
    }
  };
}

function normalizeNoaaEvent(storm: NoaaStorm): DisasterEvent | null {
  const lat = parseCoordinate(storm.latitude);
  const lon = parseCoordinate(storm.longitude);
  if (lat === null || lon === null) {
    return null;
  }

  const date = storm.lastUpdate ? new Date(storm.lastUpdate).toISOString() : new Date().toISOString();
  const id = storm.id ?? storm.binNumber ?? `${storm.name ?? "storm"}-${date}`;
  const wind = parseNumber(storm.intensity);

  return {
    id: `noaa:${id}`,
    title: `${storm.classification ?? "Tropical system"} ${storm.name ?? ""}`.trim(),
    category: "severeStorms",
    layerId: "severeStorms",
    sourceId: "noaa",
    source: "NOAA National Hurricane Center",
    sourceUrl: storm.publicAdvisory ?? "https://www.nhc.noaa.gov/",
    status: "open",
    geometry: [{ date, lon, lat }],
    history: [{ date, lon, lat, magnitude: { value: wind, unit: "kt" } }],
    magnitude: { value: wind, unit: "kt" },
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

async function enrichEvent(event: DisasterEvent): Promise<EventEnrichment> {
  const [news, wikipedia] = await Promise.all([
    fetchGdeltHeadlines(event).catch(() => []),
    fetchWikipediaSummary(event).catch(() => null)
  ]);

  return {
    news,
    wikipedia,
    populationImpact: [50, 100, 250].map((radiusKm) => ({
      radiusKm,
      population: Math.round(Math.max(0, event.severity ?? event.magnitude.value ?? 1) * radiusKm * 140),
      available: false,
      summary: "Static mode uses a placeholder estimate until a WorldPop raster pipeline is configured."
    }))
  };
}

async function fetchGdeltHeadlines(event: DisasterEvent): Promise<EventEnrichment["news"]> {
  const query = encodeURIComponent(`"${event.title}" OR ${event.category}`);
  const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=3&sort=hybridrel`);
  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { articles?: Array<{ title?: string; url?: string; sourceCountry?: string; seendate?: string }> };
  return (data.articles ?? []).slice(0, 3).map((article) => ({
    title: article.title ?? "Related disaster report",
    url: article.url ?? "https://www.gdeltproject.org/",
    source: article.sourceCountry ?? "GDELT",
    publishedAt: article.seendate ?? null
  }));
}

async function fetchWikipediaSummary(event: DisasterEvent): Promise<EventEnrichment["wikipedia"]> {
  const title = encodeURIComponent(event.country ?? event.category.replace(/[A-Z]/g, (match) => ` ${match}`).trim());
  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
  return data.extract
    ? {
        title: data.title ?? event.category,
        extract: data.extract,
        url: data.content_urls?.desktop?.page ?? "https://www.wikipedia.org/"
      }
    : null;
}

function emptyEnrichment(): EventEnrichment {
  return {
    news: [],
    wikipedia: null,
    populationImpact: []
  };
}

function getStaticGibsLayers(date = new Date().toISOString().slice(0, 10)): SatelliteLayer[] {
  return [
    {
      id: "satelliteTrueColor",
      label: "NASA GIBS True Color",
      layerName: "MODIS_Terra_CorrectedReflectance_TrueColor",
      tileMatrixSetId: "GoogleMapsCompatible_Level9",
      format: "image/jpeg",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      date
    },
    {
      id: "satelliteThermal",
      label: "NASA GIBS Thermal Anomalies",
      layerName: "MODIS_Terra_Thermal_Anomalies_Day",
      tileMatrixSetId: "GoogleMapsCompatible_Level7",
      format: "image/png",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_Thermal_Anomalies_Day/default/${date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
      date
    },
    {
      id: "satelliteAerosol",
      label: "NASA GIBS Aerosol",
      layerName: "MODIS_Terra_Aerosol",
      tileMatrixSetId: "GoogleMapsCompatible_Level6",
      format: "image/png",
      templateUrl: `${GIBS_WMTS_BASE_URL}/MODIS_Terra_Aerosol/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`,
      date
    }
  ];
}

function normalizeEonetGeometry(geometry: EonetEvent["geometry"][number]): EventGeometryPoint | null {
  const coordinate = findCoordinatePair(geometry.coordinates);
  return coordinate ? { date: geometry.date, lon: coordinate[0], lat: coordinate[1] } : null;
}

function normalizeEonetHistory(geometry: EonetEvent["geometry"][number]): EventHistoryPoint | null {
  const point = normalizeEonetGeometry(geometry);
  return point ? { ...point, magnitude: normalizeMagnitude(geometry) } : null;
}

function normalizeMagnitude(geometry: EonetEvent["geometry"][number] | undefined): EventMagnitude {
  return typeof geometry?.magnitudeValue === "number"
    ? { value: geometry.magnitudeValue, unit: geometry.magnitudeUnit ?? null }
    : { value: null, unit: null };
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

  return normalized.endsWith("S") || normalized.endsWith("W") ? -Math.abs(numeric) : numeric;
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

function extractCountry(place: string | null): string | null {
  return place?.includes(",") ? place.split(",").at(-1)?.trim() ?? null : null;
}

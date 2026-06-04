export type EventCategory =
  | "wildfires"
  | "severeStorms"
  | "earthquakes"
  | "volcanoes"
  | "floods"
  | "drought"
  | "seaLakeIce"
  | "population"
  | "satellite"
  | "other";

export type DataSourceId =
  | "eonet"
  | "usgs"
  | "noaa"
  | "gibs"
  | "worldpop"
  | "gdelt"
  | "wikipedia"
  | "ai";

export type EventLayerId =
  | "wildfires"
  | "severeStorms"
  | "earthquakes"
  | "volcanoes"
  | "floods"
  | "drought"
  | "seaLakeIce"
  | "satelliteTrueColor"
  | "satelliteThermal"
  | "satelliteAerosol"
  | "populationDensity"
  | "other";

export interface EventGeometryPoint {
  date: string;
  lon: number;
  lat: number;
}

export interface EventMagnitude {
  value: number | null;
  unit: string | null;
}

export interface EventHistoryPoint extends EventGeometryPoint {
  magnitude: EventMagnitude;
}

export interface NewsHeadline {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
}

export interface WikipediaSummary {
  title: string;
  extract: string;
  url: string;
}

export interface PopulationImpact {
  radiusKm: number;
  population: number | null;
  summary: string;
  available: boolean;
}

export interface EventEnrichment {
  news: NewsHeadline[];
  wikipedia: WikipediaSummary | null;
  populationImpact: PopulationImpact[];
}

export interface DisasterEvent {
  id: string;
  title: string;
  category: EventCategory;
  layerId: EventLayerId;
  sourceId: DataSourceId;
  source: string;
  sourceUrl: string;
  status: "open" | "closed";
  geometry: EventGeometryPoint[];
  history: EventHistoryPoint[];
  magnitude: EventMagnitude;
  severity: number | null;
  startedAt: string | null;
  updatedAt: string | null;
  closed: string | null;
  country: string | null;
  metadata: Record<string, string | number | boolean | null>;
  enrichment?: EventEnrichment;
}

export interface SourceStatus {
  id: DataSourceId;
  label: string;
  ok: boolean;
  updatedAt: string | null;
  message?: string;
}

export interface SatelliteLayer {
  id: Extract<EventLayerId, "satelliteTrueColor" | "satelliteThermal" | "satelliteAerosol">;
  label: string;
  layerName: string;
  tileMatrixSetId: string;
  format: string;
  templateUrl: string;
  date: string;
}

export interface EventsResponse {
  generatedAt: string;
  source: string;
  sources: SourceStatus[];
  layers: SatelliteLayer[];
  warnings: string[];
  events: DisasterEvent[];
}

export interface EventEnrichmentResponse {
  eventId: string;
  generatedAt: string;
  enrichment: EventEnrichment;
  warnings: string[];
}

export interface AskGlobeResponse {
  answer: string;
  sources: string[];
  fallback: boolean;
}

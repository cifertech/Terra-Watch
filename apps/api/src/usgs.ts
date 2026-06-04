import type { DisasterEvent, EventHistoryPoint } from "@terra-watch/types";

interface UsgsFeatureCollection {
  features: UsgsFeature[];
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
  geometry: {
    coordinates: [number, number, number?];
  };
}

export async function fetchUsgsEarthquakes(feedUrl: string): Promise<DisasterEvent[]> {
  const response = await fetch(feedUrl);
  if (!response.ok) {
    throw new Error(`USGS earthquake feed responded with ${response.status}`);
  }

  const data = (await response.json()) as UsgsFeatureCollection;
  return data.features.map(normalizeEarthquake);
}

function normalizeEarthquake(feature: UsgsFeature): DisasterEvent {
  const [lon, lat, depthKm] = feature.geometry.coordinates;
  const date = new Date(feature.properties.time).toISOString();
  const updatedAt = new Date(feature.properties.updated).toISOString();
  const history: EventHistoryPoint[] = [
    {
      date,
      lon,
      lat,
      magnitude: {
        value: feature.properties.mag,
        unit: "Mw"
      }
    }
  ];

  return {
    id: `usgs:${feature.id}`,
    title: feature.properties.title,
    category: "earthquakes",
    layerId: "earthquakes",
    sourceId: "usgs",
    source: "USGS Earthquake Hazards",
    sourceUrl: feature.properties.url,
    status: feature.properties.status === "reviewed" ? "open" : "open",
    geometry: [{ date, lon, lat }],
    history,
    magnitude: {
      value: feature.properties.mag,
      unit: "Mw"
    },
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

function extractCountry(place: string | null): string | null {
  if (!place || !place.includes(",")) {
    return null;
  }

  return place.split(",").at(-1)?.trim() ?? null;
}

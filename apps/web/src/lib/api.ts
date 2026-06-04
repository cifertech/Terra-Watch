import type { AskGlobeResponse, DisasterEvent, EventEnrichmentResponse, EventsResponse } from "@terra-watch/types";
import { askStaticGlobe, fetchStaticEnrichment, fetchStaticEvents } from "./staticData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_STATIC_DATA = !API_BASE_URL;

export async function fetchEvents(): Promise<EventsResponse> {
  if (USE_STATIC_DATA) {
    return fetchStaticEvents();
  }

  const response = await fetch(`${API_BASE_URL}/api/events`);

  if (!response.ok) {
    throw new Error(`Failed to load NASA EONET events (${response.status})`);
  }

  return (await response.json()) as EventsResponse;
}

export async function fetchEventEnrichment(eventId: string, events: DisasterEvent[] = []): Promise<EventEnrichmentResponse> {
  if (USE_STATIC_DATA) {
    return fetchStaticEnrichment(eventId, events);
  }

  const response = await fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(eventId)}/enrichment`);

  if (!response.ok) {
    throw new Error(`Failed to load event enrichment (${response.status})`);
  }

  return (await response.json()) as EventEnrichmentResponse;
}

export async function askGlobe(question: string, events: DisasterEvent[] = []): Promise<AskGlobeResponse> {
  if (USE_STATIC_DATA) {
    return askStaticGlobe(question, events);
  }

  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  if (!response.ok) {
    throw new Error(`Failed to ask the globe (${response.status})`);
  }

  return (await response.json()) as AskGlobeResponse;
}

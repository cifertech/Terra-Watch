import type {
  AskGlobeResponse,
  DisasterEvent,
  EventEnrichment,
  EventLayerId,
  SatelliteLayer,
  SourceStatus
} from "@terra-watch/types";
import { create } from "zustand";
import { askGlobe, fetchEventEnrichment, fetchEvents } from "./api";

export const DEFAULT_LAYERS: EventLayerId[] = [
  "wildfires",
  "severeStorms",
  "earthquakes",
  "volcanoes",
  "floods",
  "drought",
  "seaLakeIce",
  "other"
];

interface EventsState {
  events: DisasterEvent[];
  sources: SourceStatus[];
  satelliteLayers: SatelliteLayer[];
  warnings: string[];
  selectedEventId: string | null;
  activeLayers: EventLayerId[];
  activeDate: string | null;
  playing: boolean;
  dashboardOpen: boolean;
  widgetMode: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  enrichments: Record<string, EventEnrichment>;
  enrichmentLoading: boolean;
  askAnswer: AskGlobeResponse | null;
  askLoading: boolean;
  loadEvents: () => Promise<void>;
  selectEvent: (id: string | null) => void;
  toggleLayer: (layer: EventLayerId) => void;
  setActiveDate: (date: string | null) => void;
  togglePlayback: () => void;
  setDashboardOpen: (open: boolean) => void;
  setWidgetMode: (enabled: boolean) => void;
  resetLayersToDefault: () => void;
  loadEnrichment: (eventId: string) => Promise<void>;
  ask: (question: string) => Promise<void>;
  hydrateFromUrl: () => void;
  syncUrl: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  sources: [],
  satelliteLayers: [],
  warnings: [],
  selectedEventId: null,
  activeLayers: DEFAULT_LAYERS,
  activeDate: null,
  playing: false,
  dashboardOpen: true,
  widgetMode: false,
  loading: true,
  error: null,
  lastUpdated: null,
  enrichments: {},
  enrichmentLoading: false,
  askAnswer: null,
  askLoading: false,
  async loadEvents() {
    set({ loading: true, error: null });

    try {
      const response = await fetchEvents();
      set({
        events: response.events,
        sources: response.sources,
        satelliteLayers: response.layers,
        warnings: response.warnings,
        lastUpdated: response.generatedAt,
        loading: false
      });
      get().syncUrl();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load live events",
        loading: false
      });
    }
  },
  selectEvent(id) {
    set({ selectedEventId: id });
    get().syncUrl();
    if (id) {
      void get().loadEnrichment(id);
    }
  },
  toggleLayer(layer) {
    const active = new Set(get().activeLayers);
    if (active.has(layer)) {
      active.delete(layer);
    } else {
      active.add(layer);
    }
    set({ activeLayers: [...active] });
    get().syncUrl();
  },
  setActiveDate(date) {
    set({ activeDate: date });
    get().syncUrl();
  },
  togglePlayback() {
    set({ playing: !get().playing });
  },
  setDashboardOpen(open) {
    set({ dashboardOpen: open });
  },
  setWidgetMode(enabled) {
    set({ widgetMode: enabled });
    get().syncUrl();
  },
  resetLayersToDefault() {
    set({ activeLayers: DEFAULT_LAYERS });
    get().syncUrl();
  },
  async loadEnrichment(eventId) {
    if (get().enrichments[eventId]) {
      return;
    }

    set({ enrichmentLoading: true });
    try {
      const response = await fetchEventEnrichment(eventId, get().events);
      set({
        enrichments: {
          ...get().enrichments,
          [eventId]: response.enrichment
        },
        enrichmentLoading: false
      });
    } catch {
      set({ enrichmentLoading: false });
    }
  },
  async ask(question) {
    set({ askLoading: true, error: null });
    try {
      set({
        askAnswer: await askGlobe(question, get().events),
        askLoading: false
      });
    } catch (error) {
      set({
        askLoading: false,
        error: error instanceof Error ? error.message : "Ask the globe is unavailable"
      });
    }
  },
  hydrateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const layerParam = params.get("layers");
    const selectedEventId = params.get("event");
    const activeDate = params.get("date");
    const widgetMode = params.get("embed") === "1";

    set({
      activeLayers: layerParam ? (layerParam.split(",").filter(Boolean) as EventLayerId[]) : DEFAULT_LAYERS,
      selectedEventId,
      activeDate,
      widgetMode
    });
  },
  syncUrl() {
    const state = get();
    const params = new URLSearchParams(window.location.search);
    params.set("layers", state.activeLayers.join(","));

    if (state.selectedEventId) {
      params.set("event", state.selectedEventId);
    } else {
      params.delete("event");
    }

    if (state.activeDate) {
      params.set("date", state.activeDate);
    } else {
      params.delete("date");
    }

    if (state.widgetMode) {
      params.set("embed", "1");
    } else {
      params.delete("embed");
    }

    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }
}));

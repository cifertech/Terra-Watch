import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AskGlobePanel } from "./components/AskGlobePanel";
import { EventDetailPanel } from "./components/EventDetailPanel";
import { Globe } from "./components/Globe";
import { ControlPanel } from "./components/ControlPanel";
import { EmbedModeExit } from "./components/EmbedModeExit";
import { LayerLegend } from "./components/LayerLegend";
import { MissionHeader } from "./components/MissionHeader";
import { SettingsPanel } from "./components/SettingsPanel";
import { SidebarTabs, type SidebarTabId } from "./components/SidebarTabs";
import { ShareView } from "./components/ShareView";
import { StatsDashboard } from "./components/StatsDashboard";
import { TimeMachine } from "./components/TimeMachine";
import { DEFAULT_LAYERS, useEventsStore } from "./lib/useEventsStore";
import { filterEventsByDate, filterEventsByLayers } from "@terra-watch/utils";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const TIMELINE_START_DATE = "2000-01-01";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTabId>("layers");
  const [searchOpen, setSearchOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const events = useEventsStore((state) => state.events);
  const sources = useEventsStore((state) => state.sources);
  const warnings = useEventsStore((state) => state.warnings);
  const satelliteLayers = useEventsStore((state) => state.satelliteLayers);
  const selectedEventId = useEventsStore((state) => state.selectedEventId);
  const activeLayers = useEventsStore((state) => state.activeLayers);
  const activeDate = useEventsStore((state) => state.activeDate);
  const playing = useEventsStore((state) => state.playing);
  const dashboardOpen = useEventsStore((state) => state.dashboardOpen);
  const widgetMode = useEventsStore((state) => state.widgetMode);
  const loading = useEventsStore((state) => state.loading);
  const error = useEventsStore((state) => state.error);
  const lastUpdated = useEventsStore((state) => state.lastUpdated);
  const enrichments = useEventsStore((state) => state.enrichments);
  const enrichmentLoading = useEventsStore((state) => state.enrichmentLoading);
  const askAnswer = useEventsStore((state) => state.askAnswer);
  const askLoading = useEventsStore((state) => state.askLoading);
  const loadEvents = useEventsStore((state) => state.loadEvents);
  const selectEvent = useEventsStore((state) => state.selectEvent);
  const toggleLayer = useEventsStore((state) => state.toggleLayer);
  const setActiveDate = useEventsStore((state) => state.setActiveDate);
  const togglePlayback = useEventsStore((state) => state.togglePlayback);
  const setDashboardOpen = useEventsStore((state) => state.setDashboardOpen);
  const setWidgetMode = useEventsStore((state) => state.setWidgetMode);
  const resetLayersToDefault = useEventsStore((state) => state.resetLayersToDefault);
  const hydrateFromUrl = useEventsStore((state) => state.hydrateFromUrl);
  const loadEnrichment = useEventsStore((state) => state.loadEnrichment);
  const ask = useEventsStore((state) => state.ask);

  useEffect(() => {
    hydrateFromUrl();
    void loadEvents();
    const interval = window.setInterval(() => void loadEvents(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [hydrateFromUrl, loadEvents]);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = window.setInterval(() => {
      const base = activeDate ? new Date(activeDate) : new Date();
      base.setUTCDate(base.getUTCDate() + 1);
      const today = new Date();
      setActiveDate(base > today ? null : base.toISOString().slice(0, 10));
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [activeDate, playing, setActiveDate]);

  useEffect(() => {
    if (selectedEventId) {
      void loadEnrichment(selectedEventId);
    }
  }, [loadEnrichment, selectedEventId]);

  const handleSelectEvent = useCallback(
    (id: string) => {
      selectEvent(id);
    },
    [selectEvent]
  );

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;
  const visibleEvents = filterEventsByDate(filterEventsByLayers(events, activeLayers), activeDate);
  const selectedEnrichment = selectedEvent ? enrichments[selectedEvent.id] ?? null : null;
  const activeEventCount = visibleEvents.length;
  const activeLayerCount = activeLayers.length;
  const sourceCount = sources.filter((source) => source.ok).length;
  const searchResults = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    if (!query) {
      return events.slice(0, 8);
    }

    return events
      .filter((event) => [event.title, event.country, event.category, event.source].filter(Boolean).join(" ").toLowerCase().includes(query))
      .slice(0, 8);
  }, [eventSearch, events]);

  const handleNewWatch = useCallback(() => {
    selectEvent(null);
    setActiveDate(null);
    setDashboardOpen(true);
    setEventSearch("");
    setSearchOpen(false);
    if (playing) {
      togglePlayback();
    }

    const defaults = new Set(DEFAULT_LAYERS);
    const active = new Set(activeLayers);
    DEFAULT_LAYERS.forEach((layer) => {
      if (!active.has(layer)) {
        toggleLayer(layer);
      }
    });
    activeLayers.forEach((layer) => {
      if (!defaults.has(layer)) {
        toggleLayer(layer);
      }
    });

    void loadEvents();
    setSidebarOpen(false);
  }, [activeLayers, loadEvents, playing, selectEvent, setActiveDate, setDashboardOpen, toggleLayer, togglePlayback]);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen((open) => !open);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }, []);

  const handleSelectSearchResult = useCallback(
    (id: string) => {
      selectEvent(id);
      setDashboardOpen(false);
      setSidebarOpen(false);
    },
    [selectEvent, setDashboardOpen]
  );

  const handleTogglePlayback = useCallback(() => {
    if (!playing && !activeDate) {
      setActiveDate(TIMELINE_START_DATE);
    }
    togglePlayback();
  }, [activeDate, playing, setActiveDate, togglePlayback]);

  const handleResetLayers = useCallback(() => {
    resetLayersToDefault();
  }, [resetLayersToDefault]);

  return (
    <main className="relative flex h-dvh min-h-screen overflow-hidden bg-mission-night font-mono text-mission-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_520px_at_80%_-10%,rgba(252,61,33,0.13),transparent_60%),radial-gradient(760px_520px_at_0%_0%,rgba(53,90,102,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(156,222,242,0.075)_1px,transparent_1.4px)] bg-[length:24px_24px]" />

      {!widgetMode ? (
        <>
          <button
            className="pointer-events-auto fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-mission-line bg-mission-panel text-mission-text shadow-panel backdrop-blur lg:hidden"
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {sidebarOpen ? (
            <button
              className="fixed inset-0 z-40 bg-black/55 lg:hidden"
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
            />
          ) : null}

          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-mission-line bg-mission-panel/95 shadow-panel backdrop-blur-xl transition-transform duration-200 lg:relative lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex min-h-16 items-center justify-between border-b border-mission-line px-4">
              <div>
                <p className="text-[11px] tracking-wide text-mission-muted">CiferTech</p>
                <h1 className="text-lg font-semibold tracking-tight text-mission-accent">Terra Watch</h1>
              </div>
              <button
                className="rounded-md border border-mission-line px-2 py-1 text-xs text-mission-muted transition hover:border-mission-accent hover:text-mission-text lg:hidden"
                type="button"
                onClick={() => setSidebarOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="relative grid gap-2 border-b border-mission-line p-3">
              <button
                className="rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2 text-left text-sm text-mission-text transition hover:border-mission-accent"
                type="button"
                onClick={handleNewWatch}
              >
                + New watch
              </button>
              <button
                className="rounded-lg border border-transparent px-3 py-2 text-left text-sm text-mission-muted transition hover:border-mission-line hover:text-mission-text"
                type="button"
                onClick={handleOpenSearch}
              >
                Search events
              </button>
              {searchOpen ? (
                <div className="absolute left-3 right-3 top-[6.75rem] z-20 grid gap-2 rounded-lg border border-mission-line bg-mission-bg2 p-2 shadow-panel">
                  <input
                    ref={searchInputRef}
                    className="w-full rounded-md border border-mission-line bg-mission-panel px-3 py-2 text-sm text-mission-text outline-none placeholder:text-mission-muted"
                    placeholder="Search title, country, source..."
                    value={eventSearch}
                    onChange={(event) => setEventSearch(event.target.value)}
                  />
                  <div className="grid max-h-64 gap-1 overflow-y-auto overflow-x-hidden pr-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((event) => (
                        <button
                          key={event.id}
                          className="min-w-0 rounded-md border border-transparent px-2 py-2 text-left text-xs text-mission-muted transition hover:border-mission-line hover:text-mission-text"
                          type="button"
                          onClick={() => handleSelectSearchResult(event.id)}
                        >
                          <span className="block max-w-full truncate text-sm text-mission-text">{event.title}</span>
                          <span className="block max-w-full truncate">{event.country ?? event.source}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-2 py-3 text-xs text-mission-muted">No matching events.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-2 border-b border-mission-line p-3 text-xs">
              <SidebarMetric label="Active events" value={activeEventCount} />
              <SidebarMetric label="Enabled layers" value={activeLayerCount} />
              <SidebarMetric label="Healthy sources" value={`${sourceCount}/${sources.length || 1}`} />
            </div>

            <SidebarTabs active={sidebarTab} onChange={setSidebarTab} />

            <div
              className="min-h-0 flex-1 overflow-y-auto p-3"
              role="tabpanel"
              id={`sidebar-panel-${sidebarTab}`}
              aria-labelledby={`sidebar-tab-${sidebarTab}`}
            >
              {sidebarTab === "layers" ? (
                <LayerLegend activeLayers={activeLayers} satelliteLayers={satelliteLayers} onToggleLayer={toggleLayer} />
              ) : null}
              {sidebarTab === "control" ? (
                <ControlPanel
                  activeDate={activeDate}
                  dashboardOpen={dashboardOpen}
                  lastUpdated={lastUpdated}
                  loading={loading}
                  playing={playing}
                  onDashboardOpenChange={setDashboardOpen}
                  onRefresh={() => void loadEvents()}
                  onSetDate={setActiveDate}
                  onTogglePlayback={handleTogglePlayback}
                />
              ) : null}
              {sidebarTab === "settings" ? (
                <SettingsPanel
                  sources={sources}
                  warnings={warnings}
                  widgetMode={widgetMode}
                  onResetLayers={handleResetLayers}
                  onWidgetModeChange={setWidgetMode}
                />
              ) : null}
            </div>
          </aside>
        </>
      ) : null}

      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        {!widgetMode ? <MissionHeader lastUpdated={lastUpdated} loading={loading} /> : null}

        <div className="relative min-h-0 flex-1 overflow-hidden border-x border-mission-line/70 bg-black">
          <Globe
            activeDate={activeDate}
            activeLayers={activeLayers}
            events={visibleEvents}
            satelliteLayers={satelliteLayers}
            selectedEventId={selectedEventId}
            onSelectEvent={handleSelectEvent}
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(40,44,52,0.05)_48%,rgba(0,0,0,0.72)_100%)]" />

          {widgetMode ? <EmbedModeExit onExit={() => setWidgetMode(false)} /> : null}

          {!widgetMode ? (
            <>
              <div className="pointer-events-auto absolute right-4 top-4 z-30 hidden w-[min(28rem,calc(100vw-22rem))] lg:block">
                {selectedEvent ? (
                  <EventDetailPanel
                    enrichment={selectedEnrichment}
                    enrichmentLoading={enrichmentLoading}
                    event={selectedEvent}
                    onClose={() => selectEvent(null)}
                  />
                ) : (
                  <StatsDashboard
                    events={visibleEvents}
                    open={dashboardOpen}
                    sources={sources}
                    onOpenChange={setDashboardOpen}
                  />
                )}
              </div>

              <div className="absolute bottom-4 left-6 z-30 hidden w-[min(46rem,calc(100vw-40rem))] lg:block">
                <AskGlobePanel answer={askAnswer} loading={askLoading} onAsk={ask} />
              </div>

              <div className="absolute bottom-4 right-4 z-40 hidden lg:block">
                <ShareView />
              </div>

              <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-40 grid max-h-[72vh] gap-3 overflow-y-auto lg:hidden">
                <TimeMachine activeDate={activeDate} playing={playing} onSetDate={setActiveDate} onTogglePlayback={handleTogglePlayback} />
                <AskGlobePanel answer={askAnswer} loading={askLoading} onAsk={ask} />
                {selectedEvent ? (
                  <EventDetailPanel
                    enrichment={selectedEnrichment}
                    enrichmentLoading={enrichmentLoading}
                    event={selectedEvent}
                    onClose={() => selectEvent(null)}
                  />
                ) : (
                  <StatsDashboard
                    events={visibleEvents}
                    open={dashboardOpen}
                    sources={sources}
                    onOpenChange={setDashboardOpen}
                  />
                )}
                <ShareView />
              </div>
            </>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="absolute bottom-6 right-6 z-50 max-w-md rounded-lg border border-red-300/25 bg-red-950/80 px-4 py-3 text-sm text-red-100 shadow-panel backdrop-blur-xl">
          {error}
        </div>
      ) : null}
    </main>
  );
}

function SidebarMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2">
      <span className="uppercase tracking-[0.16em] text-mission-muted">{label}</span>
      <span className="text-mission-text">{value}</span>
    </div>
  );
}

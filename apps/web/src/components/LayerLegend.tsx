import type { EventCategory, EventLayerId, SatelliteLayer } from "@terra-watch/types";
import { EVENT_STYLES } from "../lib/eventStyles";

interface LayerLegendProps {
  activeLayers: EventLayerId[];
  satelliteLayers: SatelliteLayer[];
  onToggleLayer: (layer: EventLayerId) => void;
}

const EVENT_LAYERS = [
  "wildfires",
  "severeStorms",
  "earthquakes",
  "volcanoes",
  "floods",
  "drought",
  "seaLakeIce",
  "other"
] as const satisfies readonly EventLayerId[];

type EventToggleLayer = (typeof EVENT_LAYERS)[number];

const LAYER_CATEGORY: Record<EventToggleLayer, EventCategory> = {
  wildfires: "wildfires",
  severeStorms: "severeStorms",
  earthquakes: "earthquakes",
  volcanoes: "volcanoes",
  floods: "floods",
  drought: "drought",
  seaLakeIce: "seaLakeIce",
  other: "other"
};

export function LayerLegend({ activeLayers, satelliteLayers, onToggleLayer }: LayerLegendProps) {
  const active = new Set(activeLayers);

  return (
    <aside className="grid gap-5 text-mission-text">
      <section>
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Layers</p>
        <div className="mt-3 grid gap-1">
        {EVENT_LAYERS.map((layer) => {
          const style = EVENT_STYLES[LAYER_CATEGORY[layer]];
          return (
            <button
              key={layer}
              className="flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-mission-line hover:bg-mission-bg2"
              type="button"
              onClick={() => onToggleLayer(layer)}
            >
              <span className="flex min-w-0 items-center gap-3 text-sm text-mission-text">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: style.color, boxShadow: `0 0 18px ${style.color}` }}
                />
                <span className="truncate">{style.label}</span>
              </span>
              <span className={active.has(layer) ? "text-xs text-emerald-300" : "text-xs text-mission-muted"}>{active.has(layer) ? "ON" : "OFF"}</span>
            </button>
          );
        })}
        </div>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">NASA GIBS</p>
        <div className="mt-3 grid gap-1">
        {satelliteLayers.map((layer) => (
          <button
            key={layer.id}
            className="rounded-lg border border-transparent px-2.5 py-2 text-left text-sm text-mission-text transition hover:border-mission-line hover:bg-mission-bg2"
            type="button"
            onClick={() => onToggleLayer(layer.id)}
          >
            <span>{layer.label}</span>
            <span className={active.has(layer.id) ? "float-right text-xs text-emerald-300" : "float-right text-xs text-mission-muted"}>
              {active.has(layer.id) ? "ON" : "OFF"}
            </span>
          </button>
        ))}
        </div>
      </section>
    </aside>
  );
}

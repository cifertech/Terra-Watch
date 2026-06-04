import type { DisasterEvent, SourceStatus } from "@terra-watch/types";
import { countByCategory, mostSevereEvent } from "@terra-watch/utils";
import { EVENT_STYLES } from "../lib/eventStyles";

interface StatsDashboardProps {
  events: DisasterEvent[];
  sources: SourceStatus[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatsDashboard({ events, sources, open, onOpenChange }: StatsDashboardProps) {
  const counts = countByCategory(events);
  const severe = mostSevereEvent(events);
  const countries = new Set(events.map((event) => event.country).filter(Boolean)).size;

  return (
    <aside className="w-full overflow-hidden rounded-lg border border-mission-line bg-mission-panel/95 text-mission-text shadow-panel backdrop-blur-xl">
      <button
        className="flex w-full items-center justify-between border-b border-mission-line px-4 py-3 text-left transition hover:bg-mission-bg2"
        type="button"
        onClick={() => onOpenChange(!open)}
      >
        <span>
          <span className="block text-[11px] uppercase tracking-[0.24em] text-mission-accent">Global Dashboard</span>
          <span className="mt-1 block text-xl font-semibold">{events.length} active events</span>
        </span>
        <span className="text-xs text-mission-muted">{open ? "Collapse" : "Open"}</span>
      </button>

      {open ? (
        <div className="grid gap-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Affected Countries" value={countries || "TBD"} />
            <Metric label="This Week Delta" value="Live only" />
          </div>

          {severe ? (
            <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Most Severe Right Now</p>
              <p className="mt-2 text-sm text-mission-text">{severe.title}</p>
              <p className="mt-1 text-xs text-mission-muted">
                {severe.source} · {severe.magnitude.value ?? "n/a"} {severe.magnitude.unit ?? ""}
              </p>
            </div>
          ) : null}

          <div className="grid gap-2">
            {counts.map(([category, count]) => {
              const style = EVENT_STYLES[category];
              return (
                <div key={category} className="flex items-center justify-between rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2">
                  <span className="flex items-center gap-3 text-sm text-mission-text">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                    {style.label}
                  </span>
                  <span className="text-sm text-mission-text">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-2">
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between text-xs text-mission-muted">
                <span className="flex items-center gap-2">
                  <span className={source.ok ? "h-1.5 w-1.5 rounded-full bg-emerald-300/80" : "h-1.5 w-1.5 rounded-full bg-slate-500/70"} />
                  {source.label}
                </span>
                <span className="text-mission-muted">{source.ok ? "OK" : "Fallback"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-mission-text">{value}</p>
    </div>
  );
}

import * as d3 from "d3";
import type { DisasterEvent } from "@terra-watch/types";
import { EVENT_STYLES } from "../lib/eventStyles";

interface EventStatsProps {
  events: DisasterEvent[];
}

export function EventStats({ events }: EventStatsProps) {
  const counts = d3.rollups(
    events,
    (items) => items.length,
    (event) => event.category
  );

  return (
    <aside className="absolute bottom-6 left-6 z-20 w-[min(22rem,calc(100vw-3rem))] rounded-3xl border border-white/10 bg-mission-glass p-5 text-white shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan-200/70">Active Events</p>
          <p className="mt-1 text-3xl font-semibold">{events.length}</p>
        </div>
        <div className="rounded-full border border-cyan-200/20 px-3 py-1 font-mono text-xs text-cyan-100">
          Phase 1
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {counts.map(([category, count]) => {
          const style = EVENT_STYLES[category];
          return (
            <div key={category} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: style.color, boxShadow: `0 0 18px ${style.color}` }}
                />
                <span className="text-sm text-slate-200">{style.label}</span>
              </div>
              <span className="font-mono text-sm text-slate-100">{count}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

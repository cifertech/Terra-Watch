import { ShareView } from "./ShareView";
import { TimeMachine } from "./TimeMachine";

interface ControlPanelProps {
  activeDate: string | null;
  playing: boolean;
  loading: boolean;
  dashboardOpen: boolean;
  lastUpdated: string | null;
  onSetDate: (date: string | null) => void;
  onTogglePlayback: () => void;
  onRefresh: () => void;
  onDashboardOpenChange: (open: boolean) => void;
}

export function ControlPanel({
  activeDate,
  playing,
  loading,
  dashboardOpen,
  lastUpdated,
  onSetDate,
  onTogglePlayback,
  onRefresh,
  onDashboardOpenChange
}: ControlPanelProps) {
  return (
    <div className="grid gap-4 text-mission-text">
      <section>
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Timeline</p>
        <div className="mt-3">
          <TimeMachine
            activeDate={activeDate}
            embedded
            playing={playing}
            onSetDate={onSetDate}
            onTogglePlayback={onTogglePlayback}
          />
        </div>
      </section>

      <section className="grid gap-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Workspace</p>
        <button
          className="rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2 text-left text-sm text-mission-text transition hover:border-mission-accent disabled:opacity-60"
          type="button"
          disabled={loading}
          onClick={onRefresh}
        >
          {loading ? "Syncing EONET…" : "Refresh live feed"}
        </button>
        <button
          className="rounded-lg border border-transparent px-3 py-2 text-left text-sm text-mission-muted transition hover:border-mission-line hover:text-mission-text"
          type="button"
          onClick={() => onDashboardOpenChange(!dashboardOpen)}
        >
          {dashboardOpen ? "Hide global dashboard" : "Show global dashboard"}
        </button>
        <p className="px-1 text-xs text-mission-muted">Last sync · {formatTimestamp(lastUpdated)}</p>
      </section>

      <section>
        <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-mission-accent">Share</p>
        <ShareView />
      </section>
    </div>
  );
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

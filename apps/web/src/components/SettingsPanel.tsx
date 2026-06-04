import type { SourceStatus } from "@terra-watch/types";

interface SettingsPanelProps {
  sources: SourceStatus[];
  warnings: string[];
  widgetMode: boolean;
  onResetLayers: () => void;
  onWidgetModeChange: (enabled: boolean) => void;
}

const REFRESH_INTERVAL_MIN = 5;

export function SettingsPanel({ sources, warnings, widgetMode, onResetLayers, onWidgetModeChange }: SettingsPanelProps) {
  const embedUrl = buildEmbedUrl();

  return (
    <div className="grid gap-4 text-mission-text">
      <section className="grid gap-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Display</p>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2">
          <span className="text-sm text-mission-text">Widget / embed mode</span>
          <input
            checked={widgetMode}
            className="h-4 w-4 accent-mission-accent"
            type="checkbox"
            onChange={(event) => onWidgetModeChange(event.target.checked)}
          />
        </label>
        <p className="px-1 text-xs text-mission-muted">
          Hides the sidebar and chrome for embedded views. Use <span className="text-mission-text">Exit embed mode</span> in the
          top-left to return.
        </p>
      </section>

      <section className="grid gap-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Data</p>
        <div className="rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2 text-xs text-mission-muted">
          Auto-refresh every {REFRESH_INTERVAL_MIN} minutes
        </div>
        <button
          className="rounded-lg border border-transparent px-3 py-2 text-left text-sm text-mission-muted transition hover:border-mission-line hover:text-mission-text"
          type="button"
          onClick={onResetLayers}
        >
          Reset layers to defaults
        </button>
      </section>

      <section>
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Sources</p>
        <div className="mt-3 grid gap-1">
          {sources.map((source) => (
            <div
              key={source.id}
              className="flex items-center justify-between rounded-lg border border-transparent px-2.5 py-2 text-xs"
            >
              <span className="flex items-center gap-2 text-mission-text">
                <span className={source.ok ? "h-1.5 w-1.5 rounded-full bg-emerald-300/80" : "h-1.5 w-1.5 rounded-full bg-slate-500/70"} />
                {source.label}
              </span>
              <span className="text-mission-muted">{source.ok ? "OK" : "Fallback"}</span>
            </div>
          ))}
        </div>
      </section>

      {warnings.length > 0 ? (
        <section>
          <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Warnings</p>
          <ul className="mt-3 grid gap-2">
            {warnings.map((warning) => (
              <li key={warning} className="rounded-lg border border-amber-300/20 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-2">
        <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Embed URL</p>
        <p className="break-all rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2 text-xs text-mission-muted">{embedUrl}</p>
      </section>
    </div>
  );
}

function buildEmbedUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set("embed", "1");
  return url.toString();
}

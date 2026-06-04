import * as d3 from "d3";
import type { DisasterEvent } from "@terra-watch/types";
import type { EventEnrichment } from "@terra-watch/types";
import { formatCoordinate, latestByDate } from "@terra-watch/utils";
import { EVENT_STYLES } from "../lib/eventStyles";

interface EventDetailPanelProps {
  event: DisasterEvent | null;
  enrichment: EventEnrichment | null;
  enrichmentLoading: boolean;
  onClose: () => void;
}

export function EventDetailPanel({ event, enrichment, enrichmentLoading, onClose }: EventDetailPanelProps) {
  if (!event) {
    return null;
  }

  const latestPoint = latestByDate(event.geometry);
  const style = EVENT_STYLES[event.category];
  const sparkline = buildSparkline(event);

  return (
    <section className="max-h-[calc(100vh-7rem)] w-full overflow-y-auto rounded-lg border border-mission-line bg-mission-panel/95 p-4 text-mission-text shadow-panel backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em]" style={{ color: style.color }}>
            {style.label}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight">{event.title}</h2>
        </div>
        <button
          className="rounded-md border border-mission-line px-3 py-1 text-xs text-mission-muted transition hover:border-mission-accent hover:text-mission-text"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Started</dt>
          <dd className="mt-1 text-mission-text">{latestPoint ? formatDate(latestPoint.date) : "Unknown"}</dd>
        </div>
        <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
          <dt className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Status</dt>
          <dd className="mt-1 text-mission-text">{event.status.toUpperCase()}</dd>
        </div>
        {latestPoint ? (
          <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Coordinates</dt>
            <dd className="mt-1 text-mission-text">
              {formatCoordinate(latestPoint.lat, "lat")} / {formatCoordinate(latestPoint.lon, "lon")}
            </dd>
          </div>
        ) : null}
        {event.magnitude.value !== null ? (
          <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Magnitude</dt>
            <dd className="mt-1 text-mission-text">
              {event.magnitude.value} {event.magnitude.unit}
            </dd>
            {sparkline ? (
              <svg className="mt-3 h-12 w-full overflow-visible" viewBox="0 0 180 42" role="img" aria-label="Magnitude history sparkline">
                <path d={sparkline} fill="none" stroke={style.color} strokeLinecap="round" strokeWidth="2" />
              </svg>
            ) : null}
          </div>
        ) : null}
      </dl>

      <div className="mt-4 grid gap-3">
        <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Population Impact</p>
          {enrichment?.populationImpact.length ? (
            <div className="mt-3 grid gap-2">
              {enrichment.populationImpact.map((impact) => (
                <p key={impact.radiusKm} className="text-sm text-mission-text">
                  Within {impact.radiusKm} km: {impact.population?.toLocaleString() ?? "unknown"} people
                  {!impact.available ? <span className="text-mission-muted"> · placeholder</span> : null}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-mission-muted">{enrichmentLoading ? "Loading impact data..." : "Select an event to estimate impact."}</p>
          )}
        </div>

        <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">Latest Headlines</p>
          {enrichment?.news.length ? (
            <div className="mt-3 grid gap-3">
              {enrichment.news.map((headline) => (
                <a key={headline.url} className="text-sm text-mission-text hover:text-white" href={headline.url} rel="noreferrer" target="_blank">
                  {headline.title}
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-mission-muted">{enrichmentLoading ? "Loading GDELT..." : "No headlines available yet."}</p>
          )}
        </div>

        {enrichment?.wikipedia ? (
          <div className="rounded-lg border border-mission-line bg-mission-bg2 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-mission-muted">{enrichment.wikipedia.title}</p>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-mission-text">{enrichment.wikipedia.extract}</p>
          </div>
        ) : null}
      </div>

      <a
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-mission-accent bg-mission-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        href={event.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        View official source
      </a>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function buildSparkline(event: DisasterEvent): string | null {
  const points = event.history
    .filter((point) => point.magnitude.value !== null)
    .map((point) => ({ date: new Date(point.date), value: point.magnitude.value ?? 0 }));

  if (points.length < 2) {
    return null;
  }

  const x = d3.scaleTime().domain(d3.extent(points, (point) => point.date) as [Date, Date]).range([0, 180]);
  const y = d3.scaleLinear().domain(d3.extent(points, (point) => point.value) as [number, number]).nice().range([38, 4]);
  return d3
    .line<(typeof points)[number]>()
    .x((point) => x(point.date))
    .y((point) => y(point.value))(points);
}

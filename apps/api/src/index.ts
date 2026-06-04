import cors from "cors";
import express from "express";
import type { DataSourceId, DisasterEvent, EventsResponse, SourceStatus } from "@terra-watch/types";
import { askGlobe } from "./ask.js";
import { enrichEvent } from "./enrichment.js";
import { fetchEonetEvents } from "./eonet.js";
import { getGibsLayers } from "./gibs.js";
import { fetchNoaaStorms } from "./noaa.js";
import { fetchUsgsEarthquakes } from "./usgs.js";

const PORT = Number(process.env.PORT ?? 8787);
const EONET_BASE_URL = process.env.EONET_BASE_URL ?? "https://eonet.gsfc.nasa.gov/api/v3";
const USGS_EARTHQUAKE_FEED_URL =
  process.env.USGS_EARTHQUAKE_FEED_URL ?? "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
const NOAA_STORMS_FEED_URL = process.env.NOAA_STORMS_FEED_URL ?? "https://www.nhc.noaa.gov/CurrentStorms.json";
const EONET_TTL_MS = 5 * 60 * 1000;
const USGS_TTL_MS = 60 * 1000;
const NOAA_TTL_MS = 10 * 60 * 1000;

const app = express();

interface SourceCache {
  expiresAt: number;
  events: DisasterEvent[];
  status: SourceStatus;
  warning?: string;
}

const sourceCache = new Map<DataSourceId, SourceCache>();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "terra-watch-api" });
});

app.get("/api/events", async (_req, res, next) => {
  try {
    const data = await getEvents();
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=240");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get("/api/events/:eventId/enrichment", async (req, res, next) => {
  try {
    const data = await getEvents();
    const event = data.events.find((item) => item.id === req.params.eventId);

    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const enriched = await enrichEvent(event);
    res.json({
      eventId: event.id,
      generatedAt: new Date().toISOString(),
      enrichment: enriched.enrichment,
      warnings: enriched.warnings
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/ask", async (req, res, next) => {
  try {
    const question = typeof req.body?.question === "string" ? req.body.question : "";
    if (!question.trim()) {
      res.status(400).json({ error: "Question is required" });
      return;
    }

    const data = await getEvents();
    res.json(await askGlobe(question, data.events));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(502).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`Terra Watch API listening on http://localhost:${PORT}`);
});

async function getEvents(): Promise<EventsResponse> {
  const [eonet, usgs, noaa] = await Promise.all([
    getSource("eonet", "NASA EONET v3", EONET_TTL_MS, () => fetchEonetEvents(EONET_BASE_URL, "open")),
    getSource("usgs", "USGS Earthquake Hazards", USGS_TTL_MS, () => fetchUsgsEarthquakes(USGS_EARTHQUAKE_FEED_URL)),
    getSource("noaa", "NOAA National Hurricane Center", NOAA_TTL_MS, () => fetchNoaaStorms(NOAA_STORMS_FEED_URL))
  ]);

  const sources = [eonet.status, usgs.status, noaa.status, gibsStatus()];
  const warnings = [eonet.warning, usgs.warning, noaa.warning].filter((warning): warning is string => Boolean(warning));

  return {
    generatedAt: new Date().toISOString(),
    source: "Terra Watch unified feed",
    sources,
    layers: getGibsLayers(),
    warnings,
    events: [...eonet.events, ...usgs.events, ...noaa.events].sort((a, b) => {
      const aTime = Date.parse(a.updatedAt ?? a.startedAt ?? "1970-01-01T00:00:00.000Z");
      const bTime = Date.parse(b.updatedAt ?? b.startedAt ?? "1970-01-01T00:00:00.000Z");
      return bTime - aTime;
    })
  };
}

async function getSource(
  id: DataSourceId,
  label: string,
  ttlMs: number,
  fetcher: () => Promise<DisasterEvent[]>
): Promise<SourceCache> {
  const now = Date.now();
  const cached = sourceCache.get(id);

  if (cached && cached.expiresAt > now) {
    return cached;
  }

  try {
    const events = await fetcher();
    const next: SourceCache = {
      expiresAt: now + ttlMs,
      events,
      status: {
        id,
        label,
        ok: true,
        updatedAt: new Date().toISOString()
      }
    };
    sourceCache.set(id, next);
    return next;
  } catch (error) {
    const warning = error instanceof Error ? error.message : `${label} unavailable`;

    if (cached) {
      return {
        ...cached,
        warning,
        status: {
          id,
          label,
          ok: false,
          updatedAt: cached.status.updatedAt,
          message: `${warning}; serving stale cached data`
        }
      };
    }

    return {
      expiresAt: now + Math.min(ttlMs, 60_000),
      events: [],
      warning,
      status: {
        id,
        label,
        ok: false,
        updatedAt: null,
        message: warning
      }
    };
  }
}

function gibsStatus(): SourceStatus {
  return {
    id: "gibs",
    label: "NASA GIBS WMTS",
    ok: true,
    updatedAt: new Date().toISOString()
  };
}

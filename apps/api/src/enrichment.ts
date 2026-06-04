import type { DisasterEvent, EventEnrichment, NewsHeadline, PopulationImpact, WikipediaSummary } from "@terra-watch/types";

const DEFAULT_RADII = [50, 100, 250];

export async function enrichEvent(event: DisasterEvent): Promise<{ enrichment: EventEnrichment; warnings: string[] }> {
  const warnings: string[] = [];
  const [news, wikipedia] = await Promise.all([
    fetchGdeltHeadlines(event).catch((error: unknown) => {
      warnings.push(error instanceof Error ? error.message : "GDELT headlines unavailable");
      return [];
    }),
    fetchWikipediaSummary(event).catch((error: unknown) => {
      warnings.push(error instanceof Error ? error.message : "Wikipedia summary unavailable");
      return null;
    })
  ]);

  return {
    enrichment: {
      news,
      wikipedia,
      populationImpact: estimatePopulationImpact(event)
    },
    warnings
  };
}

async function fetchGdeltHeadlines(event: DisasterEvent): Promise<NewsHeadline[]> {
  const query = encodeURIComponent(`"${event.title}" OR ${event.category}`);
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=3&sort=hybridrel`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GDELT responded with ${response.status}`);
  }

  const data = (await response.json()) as { articles?: Array<{ title?: string; url?: string; sourceCountry?: string; seendate?: string }> };
  return (data.articles ?? []).slice(0, 3).map((article) => ({
    title: article.title ?? "Related disaster report",
    url: article.url ?? "https://www.gdeltproject.org/",
    source: article.sourceCountry ?? "GDELT",
    publishedAt: article.seendate ?? null
  }));
}

async function fetchWikipediaSummary(event: DisasterEvent): Promise<WikipediaSummary | null> {
  const title = encodeURIComponent(event.country ?? event.category.replace(/[A-Z]/g, (match) => ` ${match}`).trim());
  const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  const response = await fetch(searchUrl);

  if (!response.ok) {
    throw new Error(`Wikipedia summary responded with ${response.status}`);
  }

  const data = (await response.json()) as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
  if (!data.extract) {
    return null;
  }

  return {
    title: data.title ?? event.category,
    extract: data.extract,
    url: data.content_urls?.desktop?.page ?? "https://www.wikipedia.org/"
  };
}

function estimatePopulationImpact(event: DisasterEvent): PopulationImpact[] {
  const severity = event.severity ?? event.magnitude.value ?? 1;
  return DEFAULT_RADII.map((radiusKm) => {
    const estimate = Math.round(Math.max(0, severity) * radiusKm * 140);
    return {
      radiusKm,
      population: estimate,
      available: false,
      summary: `WorldPop raster is not configured yet; showing a conservative placeholder estimate for ${radiusKm} km.`
    };
  });
}

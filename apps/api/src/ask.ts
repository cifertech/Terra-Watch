import type { AskGlobeResponse, DisasterEvent } from "@terra-watch/types";

export async function askGlobe(question: string, events: DisasterEvent[]): Promise<AskGlobeResponse> {
  const endpoint = process.env.AI_CHAT_ENDPOINT;
  const apiKey = process.env.AI_CHAT_API_KEY;

  if (endpoint && apiKey) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        question,
        context: summarizeEvents(events)
      })
    });

    if (response.ok) {
      const data = (await response.json()) as Partial<AskGlobeResponse>;
      return {
        answer: data.answer ?? "The configured AI endpoint returned no answer.",
        sources: data.sources ?? ["Configured AI endpoint"],
        fallback: false
      };
    }
  }

  return {
    answer: buildFallbackAnswer(question, events),
    sources: ["Live normalized event feed"],
    fallback: true
  };
}

function buildFallbackAnswer(question: string, events: DisasterEvent[]): string {
  const severe = [...events].sort((a, b) => (b.severity ?? 0) - (a.severity ?? 0))[0];
  const counts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.category] = (acc[event.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, count]) => `${count} ${category}`)
    .join(", ");

  return `I can answer from the live feed without an AI key. For "${question}", Terra Watch currently sees ${events.length} events. The busiest categories are ${topCategories || "not available"}. ${
    severe ? `The most severe visible event is ${severe.title} from ${severe.source}.` : "No severity-ranked event is available yet."
  }`;
}

function summarizeEvents(events: DisasterEvent[]): Array<Pick<DisasterEvent, "title" | "category" | "source" | "magnitude" | "severity">> {
  return events.slice(0, 100).map((event) => ({
    title: event.title,
    category: event.category,
    source: event.source,
    magnitude: event.magnitude,
    severity: event.severity
  }));
}

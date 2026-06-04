import { useState } from "react";
import type { FormEvent } from "react";
import type { AskGlobeResponse } from "@terra-watch/types";

interface AskGlobePanelProps {
  answer: AskGlobeResponse | null;
  loading: boolean;
  onAsk: (question: string) => Promise<void>;
}

export function AskGlobePanel({ answer, loading, onAsk }: AskGlobePanelProps) {
  const [question, setQuestion] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    await onAsk(question);
  }

  return (
    <section className="w-full rounded-lg border border-mission-line bg-mission-panel/90 p-3 text-mission-text shadow-panel backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.24em] text-mission-accent">Ask The Globe</p>
      <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => void handleSubmit(event)}>
        <input
          className="min-w-0 flex-1 rounded-lg border border-mission-line bg-mission-bg2 px-3 py-2.5 text-sm text-mission-text outline-none placeholder:text-mission-muted"
          placeholder="Which event is most severe?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          className="rounded-lg border border-mission-accent bg-mission-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          disabled={loading}
          type="submit"
        >
          {loading ? "..." : "Ask"}
        </button>
      </form>
      {answer ? (
        <div className="mt-3 rounded-lg border border-mission-line bg-mission-bg2 p-3 text-sm leading-6 text-mission-text">
          {answer.answer}
          {answer.fallback ? <p className="mt-2 text-xs text-amber-200">No AI key configured · local fallback</p> : null}
        </div>
      ) : null}
    </section>
  );
}

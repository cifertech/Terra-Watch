interface TimeMachineProps {
  activeDate: string | null;
  playing: boolean;
  embedded?: boolean;
  onSetDate: (date: string | null) => void;
  onTogglePlayback: () => void;
}

const MIN_DATE = "2000-01-01";

export function TimeMachine({ activeDate, playing, embedded = false, onSetDate, onTogglePlayback }: TimeMachineProps) {
  const today = new Date().toISOString().slice(0, 10);
  const value = activeDate ?? today;

  return (
    <section
      className={
        embedded
          ? "w-full text-mission-text"
          : "w-full rounded-lg border border-mission-line bg-mission-panel/90 p-3 text-mission-text shadow-panel backdrop-blur-xl"
      }
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <button
          className="rounded-lg border border-mission-accent bg-mission-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          type="button"
          onClick={onTogglePlayback}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between text-xs text-mission-muted">
            <span>2000</span>
            <span>{value}</span>
            <button className="rounded border border-transparent px-2 py-1 text-mission-text transition hover:border-mission-line hover:text-white" type="button" onClick={() => onSetDate(null)}>
              Live
            </button>
          </div>
          <input
            className="w-full accent-mission-accent"
            max={today}
            min={MIN_DATE}
            type="date"
            value={value}
            onChange={(event) => onSetDate(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

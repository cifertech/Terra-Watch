interface EmbedModeExitProps {
  onExit: () => void;
}

export function EmbedModeExit({ onExit }: EmbedModeExitProps) {
  return (
    <div className="pointer-events-auto absolute left-4 top-4 z-50 flex items-center gap-2">
      <span className="hidden rounded-lg border border-mission-line/80 bg-mission-panel/90 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-mission-muted shadow-panel backdrop-blur sm:inline">
        Embed view
      </span>
      <button
        className="rounded-lg border border-mission-accent bg-mission-panel/95 px-3 py-2 text-xs font-medium text-mission-text shadow-panel backdrop-blur transition hover:brightness-110"
        type="button"
        onClick={onExit}
      >
        Exit embed mode
      </button>
    </div>
  );
}

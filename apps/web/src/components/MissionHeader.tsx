const GITHUB_URL = "https://github.com/cifertech/Terra-Watch";
const PATREON_URL = "https://www.patreon.com/c/cifertech";

interface MissionHeaderProps {
  lastUpdated: string | null;
  loading: boolean;
}

export function MissionHeader({ lastUpdated, loading }: MissionHeaderProps) {
  return (
    <header className="pointer-events-none z-20 flex min-h-16 items-center justify-between border-b border-mission-line bg-mission-panel/90 px-4 pl-16 shadow-panel backdrop-blur-xl lg:px-5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mission-accent">NASA EONET Live Feed</p>
        <h2 className="truncate text-base font-semibold tracking-tight text-mission-text md:text-lg">Global disaster workspace</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-mission-line bg-mission-bg2 px-3 py-2 text-xs text-mission-muted transition hover:border-mission-accent hover:text-mission-text"
          href={GITHUB_URL}
          rel="noopener noreferrer"
          target="_blank"
          aria-label="View Terra Watch on GitHub"
        >
          <GitHubIcon />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <a
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-mission-line bg-mission-bg2 px-3 py-2 text-xs text-mission-muted transition hover:border-[#ff424d] hover:text-[#ff424d]"
          href={PATREON_URL}
          rel="noopener noreferrer"
          target="_blank"
          aria-label="Support CiferTech on Patreon"
        >
          <PatreonIcon />
          <span className="hidden sm:inline">Patreon</span>
        </a>
        <div className="inline-flex items-center gap-3 rounded-full border border-mission-line bg-mission-bg2 px-3 py-2 text-xs text-mission-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
          <span className="hidden md:inline">{loading ? "Syncing EONET" : `Updated ${formatTimestamp(lastUpdated)}`}</span>
        </div>
      </div>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function PatreonIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.613-3.864 8.613-8.613 0-4.764-3.864-8.64-8.613-8.64zM0 23.256h4.508V.524H0v22.732z" />
    </svg>
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

export type SidebarTabId = "layers" | "control" | "settings";

interface SidebarTabsProps {
  active: SidebarTabId;
  onChange: (tab: SidebarTabId) => void;
}

type TabIcon = typeof LayersIcon;

const TABS: { id: SidebarTabId; label: string; hint: string; Icon: TabIcon }[] = [
  { id: "layers", label: "Layers", hint: "Map filters", Icon: LayersIcon },
  { id: "control", label: "Control", hint: "Timeline", Icon: ControlIcon },
  { id: "settings", label: "Settings", hint: "Preferences", Icon: SettingsIcon }
];

export function SidebarTabs({ active, onChange }: SidebarTabsProps) {
  const activeIndex = TABS.findIndex((tab) => tab.id === active);

  return (
    <div className="border-b border-mission-line px-3 py-3">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-mission-muted">Sections</p>
        <span className="text-[10px] tabular-nums text-mission-muted">
          {activeIndex + 1}/{TABS.length}
        </span>
      </div>

      <div
        className="grid grid-cols-3 gap-1 rounded-lg border border-mission-line/90 bg-mission-bg2 p-1 shadow-[inset_0_1px_0_rgba(156,222,242,0.06)]"
        role="tablist"
        aria-label="Sidebar sections"
      >
        <span
          aria-hidden
          className="pointer-events-none col-span-1 row-start-1 min-h-[3.25rem] rounded-md bg-mission-panel shadow-[0_0_20px_rgba(252,61,33,0.12),inset_0_1px_0_rgba(156,222,242,0.1)] ring-1 ring-mission-accent/35 transition-[grid-column] duration-200 ease-out"
          style={{ gridColumnStart: activeIndex + 1 }}
        />

        {TABS.map((tab, index) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              className={`relative z-10 col-span-1 row-start-1 flex min-w-0 flex-col items-center gap-1 rounded-md px-1 py-2.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-mission-accent ${
                selected ? "text-mission-accent" : "text-mission-muted hover:text-mission-text"
              }`}
              style={{ gridColumnStart: index + 1 }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`sidebar-panel-${tab.id}`}
              id={`sidebar-tab-${tab.id}`}
              title={tab.hint}
              onClick={() => onChange(tab.id)}
            >
              <tab.Icon active={selected} />
              <span className={`text-[11px] font-medium tracking-wide ${selected ? "text-mission-text" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function iconStroke(active: boolean): string {
  return active ? "stroke-mission-accent" : "stroke-current";
}

function LayersIcon({ active }: { active: boolean }) {
  const stroke = iconStroke(active);
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16">
      <path className={stroke} d="M2 5.5 8 2.5l6 3-6 3-6-3Z" strokeWidth="1.25" />
      <path className={stroke} d="M2 8.5 8 11.5l6-3" strokeWidth="1.25" opacity={active ? 1 : 0.65} />
      <path className={stroke} d="M2 11.5 8 14.5l6-3" strokeWidth="1.25" opacity={active ? 0.85 : 0.4} />
    </svg>
  );
}

function ControlIcon({ active }: { active: boolean }) {
  const stroke = iconStroke(active);
  return (
    <svg aria-hidden className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 16 16">
      <circle className={stroke} cx="4" cy="5" r="1.25" strokeWidth="1.25" />
      <circle className={stroke} cx="12" cy="5" r="1.25" strokeWidth="1.25" />
      <path className={stroke} d="M2.5 5h1M6.25 5H13.5M14.5 5h-1" strokeWidth="1.25" strokeLinecap="round" />
      <circle className={stroke} cx="6" cy="11" r="1.25" strokeWidth="1.25" />
      <circle className={stroke} cx="11" cy="11" r="1.25" strokeWidth="1.25" />
      <path className={stroke} d="M2.5 11h2.25M8.25 11H13.5M14.5 11h-1" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  const stroke = iconStroke(active);
  return (
    <svg aria-hidden className={`h-4 w-4 shrink-0 ${active ? "animate-none" : ""}`} fill="none" viewBox="0 0 16 16">
      <path
        className={stroke}
        d="M8 2.25v1.5M8 12.25v1.5M2.25 8h1.5M12.25 8h1.5M4.1 4.1l1.06 1.06M10.84 10.84l1.06 1.06M4.1 11.9l1.06-1.06M10.84 5.16l1.06-1.06"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle className={stroke} cx="8" cy="8" r="2.25" strokeWidth="1.25" />
    </svg>
  );
}

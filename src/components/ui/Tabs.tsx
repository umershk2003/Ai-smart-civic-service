import React, { useRef } from 'react';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** Accessible name for the tablist */
  label: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange, label }) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const count = tabs.length;
    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % count;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + count) % count;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = count - 1;
    else return;

    e.preventDefault();
    onChange(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const activeIndex = tabs.findIndex((t) => t.id === activeId);

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="inline-flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-800/60 p-1 ring-1 ring-inset ring-white/10 sm:w-auto"
      >
        {tabs.map((tab, i) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className={[
                'flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer sm:flex-none',
                selected
                  ? 'bg-slate-700 text-white shadow-card ring-1 ring-inset ring-slate-600'
                  : 'text-slate-400 hover:text-slate-100',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tabs[activeIndex]?.id}`}
        aria-labelledby={`tab-${tabs[activeIndex]?.id}`}
        tabIndex={0}
        className="mt-6 focus-visible:ring-0"
      >
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
};

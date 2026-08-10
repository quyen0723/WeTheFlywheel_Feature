import { Bell, ChevronDown } from 'lucide-react';
import type { TabId } from '../lib/types';

interface NavTab {
  id: TabId;
  label: string;
}

interface AppHeaderProps {
  tabs: ReadonlyArray<NavTab>;
  activeTab: TabId;
  onTabChange: (id: TabId) => void;
}

/**
 * Global header — sticky nav bar mirroring the real Tipmaster layout
 * (logo · tabs · Invite · lang · notifications · avatar). Tablist is ARIA-correct.
 */
export function AppHeader({ tabs, activeTab, onTabChange }: AppHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between px-4">
        {/* Brand */}
        <a
          href="#"
          className="group flex shrink-0 items-center gap-3 no-underline"
          aria-label="Tipmaster Football Manager — home"
        >
          <img
            src="https://tipmaster.net/_next/image?url=%2Fimg%2Ftm-logo.png&w=96&q=75"
            alt=""
            className="h-[34px] w-auto transition-transform group-hover:scale-105"
          />
          <span className="hidden flex-col justify-center leading-none sm:flex">
            <span className="text-[17px] font-black leading-tight tracking-tight text-slate-800">
              Tipmaster Football Manager
            </span>
            <span className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Daily · Prediction game
            </span>
          </span>
        </a>

        {/* Tablist */}
        <nav
          className="mx-4 flex flex-1 items-center justify-start gap-2 overflow-x-auto no-scrollbar mask-fade-edges lg:justify-center"
          aria-label="Primary"
        >
          <div role="tablist" className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={active}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => onTabChange(tab.id)}
                  className={`rounded-full border px-4 py-1.5 text-[14px] font-semibold transition-colors ${
                    active
                      ? 'border-slate-800 bg-white text-slate-800 shadow-sm'
                      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Utilities */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <a
            href="#"
            className="ml-1 hidden items-center justify-center rounded-full bg-brand-amber px-5 py-1.5 text-[14px] font-bold text-slate-900 shadow-sm transition-colors hover:bg-brand-amber-dark sm:flex"
          >
            Invite
          </a>
          <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Change language, current: English"
          >
            EN <ChevronDown size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Notifications, 1 unread"
          >
            <Bell size={19} strokeWidth={2.5} aria-hidden="true" />
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            className="ml-1 h-[30px] w-[30px] overflow-hidden rounded-full border border-slate-200 transition-shadow hover:shadow-md"
            aria-label="Account: Quyen Nguyen"
          >
            <img
              src="https://ui-avatars.com/api/?name=Quyen+Nguyen&background=0D8ABC&color=fff"
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileText,
  LayoutDashboard,
  HardHat,
  Tags,
  KeyRound,
  BarChart3,
  Bot,
  Bell,
  Search,
  Menu,
  X,
  Building2,
  RotateCcw,
  Inbox,
} from 'lucide-react';
import { ExtendedUserRole } from '../../types';
import { NavTab, TAB_ORDER, TAB_META, canAccessTab, defaultTabForRole } from '../../auth/permissions';

import { UserProfileMenu } from '../UserProfileMenu';

export interface ShellNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  tab?: NavTab;
  tone?: 'critical' | 'info' | 'success';
}

interface AppShellProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentRole: ExtendedUserRole;
  selectedOfficer: string;
  onOfficerChange: (officer: string) => void;
  selectedSupervisorDepartment: string;
  onSupervisorDepartmentChange: (dept: string) => void;
  onLogout: () => void;
  onRequestReset: () => void;
  criticalCount: number;
  notifications?: ShellNotification[];
  children: React.ReactNode;
}

const TAB_ICONS: Record<NavTab, React.ElementType> = {
  citizen: FileText,
  desk: LayoutDashboard,
  field: HardHat,
  categories: Tags,
  roles: KeyRound,
  analytics: BarChart3,
  assistant: Bot,
};

const NAV_SECTIONS: { label: string; tabs: NavTab[] }[] = [
  { label: 'Workspace', tabs: ['citizen', 'desk', 'field'] },
  { label: 'Administration', tabs: ['categories', 'roles'] },
  { label: 'Insights', tabs: ['analytics', 'assistant'] },
];

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  selectedOfficer,
  onOfficerChange,
  selectedSupervisorDepartment,
  onSupervisorDepartmentChange,
  onLogout,
  onRequestReset,
  criticalCount,
  notifications = [],
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);


  const visibleTabs = useMemo(
    () => TAB_ORDER.filter((tab) => canAccessTab(currentRole, tab)),
    [currentRole]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    return visibleTabs.filter((tab) => {
      const meta = TAB_META[tab];
      return (
        meta.label.toLowerCase().includes(q) ||
        meta.shortLabel.toLowerCase().includes(q) ||
        meta.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, visibleTabs]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const navigate = (tab: NavTab) => {
    setActiveTab(tab);
    setDrawerOpen(false);
    setSearchQuery('');
  };

  const navContent = (
    <nav aria-label="Primary navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {NAV_SECTIONS.map((section) => {
        const tabs = section.tabs.filter((t) => visibleTabs.includes(t));
        if (tabs.length === 0) return null;
        return (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {tabs.map((tab) => {
                const meta = TAB_META[tab];
                const Icon = TAB_ICONS[tab];
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => navigate(tab)}
                      className={[
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all cursor-pointer',
                        isActive
                          ? 'bg-slate-800 text-white shadow-sm ring-1 ring-inset ring-slate-700'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
                      ].join(' ')}
                    >
                      <Icon
                        className={[
                          'h-4.5 w-4.5 shrink-0 transition-colors',
                          isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300',
                        ].join(' ')}
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{meta.label}</span>
                      {tab === 'desk' && criticalCount > 0 && (
                        <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {criticalCount}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2.5 px-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/20">
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-white">AI Smart Civic</p>
      </div>
    </div>
  );

  const notificationBell = (
    <div className="relative" ref={notifRef}>
      <button
        type="button"
        aria-label={`Notifications, ${notifications.length} new`}
        aria-expanded={notifOpen}
        onClick={() => setNotifOpen((v) => !v)}
        className="relative rounded-xl p-2.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {notifications.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {notifOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-slate-900 shadow-popover ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-xs font-bold text-white">Notifications</p>
              <span className="text-[10px] text-slate-500">{notifications.length} new</span>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                  <Inbox className="h-5 w-5 text-slate-600" aria-hidden="true" />
                  <p className="text-xs text-slate-500">You're all caught up.</p>
                </li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (n.tab) navigate(n.tab);
                        else setNotifOpen(false);
                      }}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/60 cursor-pointer"
                    >
                      <span
                        className={[
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.tone === 'critical' ? 'bg-red-500' : n.tone === 'success' ? 'bg-emerald-400' : 'bg-sky-400',
                        ].join(' ')}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-100">{n.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-400">
                          {n.description}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-600">{n.time}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ------------------------------ Desktop sidebar ------------------------------ */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-800 bg-slate-950/95 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-slate-800 px-4">{brand}</div>
        {navContent}
      </aside>

      {/* ------------------------------ Mobile top bar ------------------------------ */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {brand}
        </div>
        <div className="flex items-center gap-1">
          {notificationBell}
          <UserProfileMenu onLogout={onLogout} />
        </div>
      </header>

      {/* ------------------------------ Mobile drawer ------------------------------ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              id="mobile-drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-950 lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                {brand}
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {navContent}
              <div className="space-y-2 border-t border-slate-800 p-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      onRequestReset();
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Reset data
                  </button>
                  <UserProfileMenu onLogout={onLogout} />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------ Content column ------------------------------ */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Desktop topbar */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-end gap-2 border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur lg:flex">
          {/* Search */}
          <div className="relative mr-auto w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              type="text"
              role="searchbox"
              aria-label="Search navigation"
              placeholder="Search modules… (e.g. field, analytics)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border-0 bg-slate-900 pl-9 pr-3 text-xs text-white placeholder-slate-500 shadow-sm ring-1 ring-inset ring-slate-800 transition-shadow focus:ring-2 focus:ring-blue-500"
            />
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl bg-slate-900 shadow-popover ring-1 ring-white/10"
                >
                  {searchResults.map((tab) => {
                    const Icon = TAB_ICONS[tab];
                    return (
                      <li key={tab}>
                        <button
                          type="button"
                          onClick={() => navigate(tab)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                          <span className="font-semibold text-slate-100">{TAB_META[tab].label}</span>
                          <span className="ml-auto text-[10px] text-slate-500">{TAB_META[tab].description}</span>
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={onRequestReset}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset demo data
          </button>

          {notificationBell}

          <UserProfileMenu onLogout={onLogout} />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

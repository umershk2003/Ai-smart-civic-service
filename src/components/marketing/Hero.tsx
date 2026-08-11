import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  PlayCircle,
  Droplets,
  Zap,
  Trash2,
  Sparkles,
  MapPin,
  ShieldCheck,
  Star,
  Waves,
  TreePine,
  Construction,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { getWardName } from '../../data/locations';

interface HeroProps {
  onSignIn: () => void;
  onSeeHowItWorks: () => void;
}

const PRIORITY_BADGE: Record<string, string> = {
  Critical: 'bg-rose-500/15 text-rose-400 ring-rose-500/30',
  High: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
  Medium: 'bg-sky-500/15 text-sky-400 ring-sky-500/30',
  Low: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
};

const DONE_STATUSES = new Set(['Resolved', 'Closed', 'Rejected']);
const PRIORITY_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function categoryIcon(category: string): LucideIcon {
  const c = category.toLowerCase();
  if (c.includes('water')) return Droplets;
  if (c.includes('electric') || c.includes('street')) return Zap;
  if (c.includes('waste') || c.includes('garbage') || c.includes('trash')) return Trash2;
  if (c.includes('road') || c.includes('pothole') || c.includes('sinkhole')) return Construction;
  if (c.includes('drain') || c.includes('sewage') || c.includes('sewer') || c.includes('flood')) return Waves;
  if (c.includes('park') || c.includes('tree') || c.includes('horticulture')) return TreePine;
  return Building2;
}

interface QueueItem {
  id: string;
  title: string;
  ward: string;
  priority: string;
  slaLabel: string;
  icon: LucideIcon;
}

interface LiveDashboard {
  open: number;
  critical: number;
  resolved: number;
  avgSla: string;
  queue: QueueItem[];
  weekBars: number[];
  weekDelta: string;
  aiChip: string;
}

const WEEK_BARS = [38, 52, 44, 66, 58, 82, 74];

const FALLBACK: LiveDashboard = {
  open: 28,
  critical: 3,
  resolved: 214,
  avgSla: '4.2h',
  queue: [
    { id: 'mock-1', title: 'Water pipe burst near Gate 3', ward: 'Ward 2 · Industrial', priority: 'Critical', slaLabel: 'SLA 4h', icon: Droplets },
    { id: 'mock-2', title: 'Sparking transformer on 4th St', ward: 'Ward 1 · North', priority: 'High', slaLabel: 'SLA 12h', icon: Zap },
    { id: 'mock-3', title: 'Overflowing dumpster, Main Market', ward: 'Ward 3 · South', priority: 'Medium', slaLabel: 'SLA 48h', icon: Trash2 },
  ],
  weekBars: WEEK_BARS,
  weekDelta: '+18% vs last week',
  aiChip: 'Water Supply · 95/100 priority',
};

function slaLabel(createdAt: string, slaHours: number): string {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created) || !slaHours) return 'SLA —';
  const left = (created + slaHours * 3_600_000 - Date.now()) / 3_600_000;
  if (left <= 0) return 'SLA breached';
  if (left < 1) return 'SLA <1h';
  return `SLA ${Math.round(left)}h`;
}

async function loadLiveDashboard(): Promise<LiveDashboard | null> {
  try {
    const res = await fetch('/api/complaints');
    if (!res.ok) return null;
    const complaints: any[] = await res.json();
    if (!Array.isArray(complaints) || complaints.length === 0) return null;

    const open = complaints.filter((c) => !DONE_STATUSES.has(c.status));
    const resolvedList = complaints.filter((c) => DONE_STATUSES.has(c.status));

    const avgSlaHours = open.length
      ? open.reduce((sum, c) => sum + (c.estimatedSLAHours || 0), 0) / open.length
      : 0;

    const queue = [...open]
      .sort((a, b) => {
        const rank = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
        if (rank !== 0) return rank;
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      })
      .slice(0, 3)
      .map((c) => ({
        id: c.id ?? c.trackingId,
        title: c.title,
        ward:
          getWardName(c.location?.wardId) ||
          c.location?.area ||
          c.location?.address ||
          'City',
        priority: c.priority,
        slaLabel: slaLabel(c.createdAt, c.estimatedSLAHours),
        icon: categoryIcon(c.category),
      }));

    // Resolutions per day over the last 7 days + delta vs the previous week.
    const day = (ts: number) => Math.floor(ts / 86_400_000);
    const today = day(Date.now());
    const bars = Array.from({ length: 7 }, (_, i) => 0);
    let prevWeek = 0;
    for (const c of resolvedList) {
      const d = day(new Date(c.updatedAt || c.createdAt).getTime());
      const offset = today - d;
      if (offset >= 0 && offset < 7) bars[6 - offset] += 1;
      else if (offset >= 7 && offset < 14) prevWeek += 1;
    }
    const thisWeek = bars.reduce((a, b) => a + b, 0);
    const max = Math.max(...bars, 1);
    const weekBars = bars.map((n) => Math.max(8, Math.round((n / max) * 100)));
    const weekDelta =
      prevWeek > 0
        ? `${thisWeek >= prevWeek ? '+' : ''}${Math.round(((thisWeek - prevWeek) / prevWeek) * 100)}% vs last week`
        : thisWeek > 0
          ? `+${thisWeek} resolved this week`
          : 'No resolutions yet';

    const latest = [...complaints].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      open: open.length,
      critical: open.filter((c) => c.priority === 'Critical').length,
      resolved: resolvedList.length,
      avgSla: open.length ? `${avgSlaHours.toFixed(1)}h` : '—',
      queue,
      weekBars,
      weekDelta,
      aiChip: latest ? `${latest.category} · ${latest.priorityScore ?? '—'}/100 priority` : '—',
    };
  } catch {
    return null;
  }
}

export const Hero: React.FC<HeroProps> = ({ onSignIn, onSeeHowItWorks }) => {
  const [live, setLive] = useState<LiveDashboard | null>(null);
  const [liveLoaded, setLiveLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLiveDashboard().then((data) => {
      if (!cancelled) {
        setLive(data);
        setLiveLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const data: LiveDashboard = live ?? FALLBACK;
  const isLive = liveLoaded && live !== null;

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Soft ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute right-[-180px] top-40 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-dot-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-500/15 px-3.5 py-1.5 text-xs font-semibold text-primary-300 ring-1 ring-inset ring-primary-500/30">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI-powered municipal operations
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
            Every civic issue,
            <br />
            <span className="text-primary-400">resolved faster.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Report a pothole, a burst pipe, or a broken streetlight — our AI classifies,
            prioritizes, and routes it to the right municipal team within seconds. Track every
            ticket to resolution, with SLA deadlines your team can actually meet.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onSignIn}>
              Start free — no card needed
            </Button>
            <Button
              size="lg"
              variant="outline"
              leftIcon={<PlayCircle className="h-5 w-5 text-primary-400" />}
              onClick={onSeeHowItWorks}
            >
              See how it works
            </Button>
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {['AK', 'LM', 'SR', 'JD'].map((initials, i) => (
                  <span
                    key={initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                    style={{
                      backgroundColor: ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b'][i],
                    }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <div className="text-xs leading-tight">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-0.5 font-medium text-slate-400">
                  Trusted by <span className="font-bold text-white">14 municipal teams</span>
                </p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-slate-700 sm:block" aria-hidden="true" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="h-4 w-4 text-primary-400" aria-hidden="true" />
              SOC 2-ready · Data encrypted at rest
            </div>
          </div>
        </motion.div>

        {/* Live product window */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
          className="relative"
        >
          <div className="relative rounded-2xl bg-slate-900/80 p-5 shadow-popover ring-1 ring-white/10 sm:p-6">
            {/* Window chrome */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-inset ring-white/10">
                {isLive ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Live · AI Smart Civic
                  </>
                ) : (
                  'Preview · AI Smart Civic'
                )}
              </span>
            </div>

            {/* KPI row */}
            <div className="mt-5 grid grid-cols-4 gap-2.5">
              {[
                { label: 'Open', value: String(data.open), color: 'text-slate-100' },
                { label: 'Critical', value: String(data.critical), color: 'text-rose-400' },
                { label: 'Resolved', value: String(data.resolved), color: 'text-slate-100' },
                { label: 'Avg SLA', value: data.avgSla, color: 'text-emerald-400' },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl bg-white/5 p-3 ring-1 ring-inset ring-white/10">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
                  <p className={`mt-1 text-lg font-bold tracking-tight ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Complaint rows */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority queue</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-500/15 px-2 py-0.5 text-[10px] font-semibold text-primary-400">
                  <Sparkles className="h-2.5 w-2.5" /> AI triaged
                </span>
              </div>
              {data.queue.length === 0 ? (
                <div className="rounded-xl bg-white/5 p-4 text-center text-[11px] text-slate-500 ring-1 ring-inset ring-white/10">
                  No open complaints — your queue is clear.
                </div>
              ) : (
                data.queue.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-inset ring-white/10"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-inset ring-white/10`}>
                      <c.icon className="h-4 w-4 text-primary-400" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-200">{c.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
                        {c.ward} · {c.slaLabel}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset ${PRIORITY_BADGE[c.priority] || PRIORITY_BADGE.Low}`}>
                      {c.priority}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Mini chart */}
            <div className="mt-4 rounded-xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Resolutions · last 7 days</p>
                <p className="text-[10px] font-semibold text-emerald-400">{data.weekDelta}</p>
              </div>
              <div className="mt-3 flex h-20 items-end gap-2">
                {data.weekBars.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: 'easeOut' }}
                    className={[
                      'flex-1 rounded-t-md',
                      i === data.weekBars.length - 1 ? 'bg-primary-500' : 'bg-primary-500/30',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating AI chip */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute -right-3 -top-5 hidden items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2.5 shadow-popover ring-1 ring-white/10 sm:flex"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="text-left">
              <p className="text-xs font-bold text-white">AI classified</p>
              <p className="text-[10px] text-slate-400">{data.aiChip}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

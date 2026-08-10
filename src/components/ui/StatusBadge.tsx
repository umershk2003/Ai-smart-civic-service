import React from 'react';
import { AlertTriangle, ChevronUp, CircleDot, CheckCircle2, Clock, Loader2, Inbox, XCircle } from 'lucide-react';
import { CivicPriority, ComplaintStatus } from '../../types';

/**
 * Badges that communicate priority/status with text + icon (not color alone),
 * satisfying WCAG "don't rely on color" guidance.
 */

const PRIORITY_META: Record<CivicPriority, { icon: React.ElementType; classes: string; label: string }> = {
  Critical: {
    icon: AlertTriangle,
    classes: 'bg-red-500/15 text-red-400 ring-red-500/30',
    label: 'Critical priority',
  },
  High: {
    icon: ChevronUp,
    classes: 'bg-orange-500/15 text-orange-400 ring-orange-500/30',
    label: 'High priority',
  },
  Medium: {
    icon: CircleDot,
    classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30',
    label: 'Medium priority',
  },
  Low: {
    icon: CheckCircle2,
    classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30',
    label: 'Low priority',
  },
};

export const PriorityBadge: React.FC<{ priority: CivicPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const meta = PRIORITY_META[priority];
  const Icon = meta.icon;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
        meta.classes,
        className,
      ].join(' ')}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{priority}</span>
      <span className="sr-only">Priority: {priority}</span>
    </span>
  );
};

const STATUS_META: Record<ComplaintStatus, { icon: React.ElementType; classes: string; label: string }> = {
  Submitted: { icon: Inbox, classes: 'bg-slate-500/15 text-slate-300 ring-slate-500/30', label: 'Status: Submitted' },
  'Under Review': { icon: Clock, classes: 'bg-amber-500/15 text-amber-400 ring-amber-500/30', label: 'Status: Under review' },
  Assigned: { icon: CircleDot, classes: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30', label: 'Status: Assigned' },
  'In Progress': { icon: Loader2, classes: 'bg-blue-500/15 text-blue-400 ring-blue-500/30', label: 'Status: In progress' },
  Resolved: { icon: CheckCircle2, classes: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30', label: 'Status: Resolved' },
  Closed: { icon: CheckCircle2, classes: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30', label: 'Status: Closed' },
  Reopened: { icon: Clock, classes: 'bg-rose-500/15 text-rose-400 ring-rose-500/30', label: 'Status: Reopened' },
  Rejected: { icon: XCircle, classes: 'bg-rose-500/15 text-rose-400 ring-rose-500/30', label: 'Status: Rejected' },
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const meta = STATUS_META[status] ?? STATUS_META.Submitted;
  const Icon = meta.icon;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
        meta.classes,
        className,
      ].join(' ')}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{status}</span>
      <span className="sr-only">{meta.label}</span>
    </span>
  );
};

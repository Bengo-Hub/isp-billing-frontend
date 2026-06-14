'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouterEvents, type RouterEvent } from '@/features/routers/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  FileCog,
  Gauge,
  Hourglass,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  ScrollText,
  Send,
  ShieldCheck,
  Terminal,
  TimerReset,
  Unplug,
  UserCheck,
  UserMinus,
  UserPlus,
  XCircle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/* -------------------------------------------------------------------------- */
/*  Presentation maps                                                          */
/* -------------------------------------------------------------------------- */

type StatusTone = 'success' | 'failed' | 'pending';

// Normalise the many backend statuses into 3 buckets the UI cares about.
// RouterCommand: pending | sent | success | failed | expired
// RouterLog:     success | failed
function toStatusTone(ev: Pick<RouterEvent, 'success' | 'status'>): StatusTone {
  if (ev.success || ev.status === 'success') return 'success';
  if (ev.status === 'pending' || ev.status === 'sent') return 'pending';
  // failed | expired | anything unknown
  return 'failed';
}

const STATUS_META: Record<
  StatusTone,
  { label: string; badge: string; dot: string; iconRing: string; icon: LucideIcon }
> = {
  success: {
    label: 'Success',
    badge: 'bg-green-100 text-green-800 hover:bg-green-100',
    dot: 'bg-green-500',
    iconRing: 'bg-green-50 text-green-600 ring-green-100',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    badge: 'bg-red-100 text-red-800 hover:bg-red-100',
    dot: 'bg-red-500',
    iconRing: 'bg-red-50 text-red-600 ring-red-100',
    icon: XCircle,
  },
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    dot: 'bg-amber-400',
    iconRing: 'bg-amber-50 text-amber-600 ring-amber-100',
    icon: Hourglass,
  },
};

// Map a raw `action` string to a human-friendly label + icon.
// Covers every action queued/logged by the backend (router_command actions,
// agent script branches, subscription/expiry logs, provisioning + firmware).
const ACTION_META: Record<string, { label: string; icon: LucideIcon }> = {
  create_user: { label: 'Create hotspot user', icon: UserPlus },
  disable_user: { label: 'Disable user', icon: UserMinus },
  enable_user: { label: 'Enable user', icon: UserCheck },
  disconnect: { label: 'Disconnect user', icon: Unplug },
  set_queue: { label: 'Update bandwidth queue', icon: Gauge },
  run_script: { label: 'Run script', icon: Terminal },
  fetch_import: { label: 'Apply config / script', icon: FileCog },
  sync_time: { label: 'Sync router clock', icon: TimerReset },
  reboot: { label: 'Reboot router', icon: Power },
  backup: { label: 'Create backup', icon: Save },
  firmware_check: { label: 'Check firmware', icon: ShieldCheck },
  firmware_download: { label: 'Download firmware', icon: Cpu },
  expired: { label: 'Subscription expired', icon: Clock },
  renewed: { label: 'Subscription renewed', icon: RotateCcw },
};

function actionMeta(action: string): { label: string; icon: LucideIcon } {
  if (ACTION_META[action]) return ACTION_META[action];
  // Fallback: humanise the snake_case action (e.g. "set_dns" -> "Set dns").
  const label = action
    ? action.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
    : 'Unknown event';
  return { label, icon: Activity };
}

// Friendly labels for the `source` that triggered a command. The backend stores
// source as: subscription_sync | manual | billing_cycle (and provisioning /
// router_action in some paths). It is only surfaced when result_message is
// empty, so we detect it best-effort from the details string.
const SOURCE_LABELS: Record<string, string> = {
  subscription_sync: 'Subscription sync',
  billing_cycle: 'Billing cycle',
  manual: 'Manual action',
  provisioning: 'Provisioning',
  router_action: 'Router action',
};

const KNOWN_SOURCES = Object.keys(SOURCE_LABELS);

function sourceLabel(raw: string): string {
  return SOURCE_LABELS[raw] ?? raw.replace(/_/g, ' ');
}

/* -------------------------------------------------------------------------- */
/*  Timestamp helpers                                                          */
/* -------------------------------------------------------------------------- */

function relativeTime(iso?: string): string {
  if (!iso) return 'Unknown time';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

function absoluteTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

/* -------------------------------------------------------------------------- */
/*  Filters + pagination config                                               */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;

const FILTERS: { value: StatusTone | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

/* -------------------------------------------------------------------------- */
/*  Single event row                                                          */
/* -------------------------------------------------------------------------- */

function EventRow({ event }: { event: RouterEvent }) {
  const tone = toStatusTone(event);
  const status = STATUS_META[tone];
  const { label, icon: ActionIcon } = actionMeta(event.action);

  const details = (event.details || '').trim();
  // The backend may put the bare source string into `details` when there is no
  // result_message. Detect that so we render it as a "source" chip instead of a
  // confusing one-word message.
  const detailsIsSource = KNOWN_SOURCES.includes(details);
  const message = detailsIsSource ? '' : details;
  const derivedSource = detailsIsSource ? details : '';

  // Only failed/expired rows are expandable, and only when there is extra text
  // worth revealing.
  const isFailed = tone === 'failed';
  const expandable = isFailed && message.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'group rounded-lg border bg-white transition-colors',
        isFailed ? 'border-red-100 hover:border-red-200' : 'border-gray-100 hover:border-gray-200',
        'hover:shadow-sm',
      )}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Action icon */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
            status.iconRing,
          )}
        >
          <ActionIcon className="h-4 w-4" />
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium text-gray-900">{label}</span>
            <Badge className={cn('font-semibold', status.badge)}>{status.label}</Badge>
            <Badge
              variant="outline"
              className={cn(
                'gap-1 font-medium',
                event.kind === 'command'
                  ? 'border-brand-200 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600',
              )}
            >
              {event.kind === 'command' ? (
                <Terminal className="h-3 w-3" />
              ) : (
                <ScrollText className="h-3 w-3" />
              )}
              {event.kind === 'command' ? 'Agent command' : 'Operation log'}
            </Badge>
            {derivedSource && (
              <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
                <Send className="mr-1 h-3 w-3" />
                {sourceLabel(derivedSource)}
              </Badge>
            )}
          </div>

          {/* Result / error message (one line; full text on expand for failures) */}
          {message && (
            <p
              className={cn(
                'mt-1 text-sm',
                isFailed ? 'text-red-600' : 'text-gray-600',
                !open && 'truncate',
              )}
              title={!expandable ? message : undefined}
            >
              {message}
            </p>
          )}

          {/* Raw action code — small, muted, for operators who know the API */}
          <p className="mt-1 font-mono text-[11px] text-gray-400">{event.action}</p>

          {expandable && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
            >
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
              {open ? 'Hide error detail' : 'Show error detail'}
            </button>
          )}

          {open && expandable && (
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-red-100 bg-red-50/60 p-3 font-mono text-xs text-red-700">
              {message}
            </pre>
          )}
        </div>

        {/* Timestamp */}
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1 text-xs font-medium text-gray-500">
            <Clock className="h-3 w-3" />
            <span title={absoluteTime(event.created_at)}>{relativeTime(event.created_at)}</span>
          </div>
          <div className="mt-0.5 hidden text-[11px] text-gray-400 sm:block">
            {absoluteTime(event.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tab                                                                        */
/* -------------------------------------------------------------------------- */

export function DeviceEventsTab({ routerId }: { routerId: number }) {
  const { data, isLoading, isError, isFetching, refetch } = useRouterEvents(routerId);

  const [filter, setFilter] = useState<StatusTone | 'all'>('all');
  const [page, setPage] = useState(1);

  const events = useMemo(() => data ?? [], [data]);

  // Counts per status for the filter chips (computed over the full set).
  const counts = useMemo(() => {
    const c = { all: events.length, success: 0, failed: 0, pending: 0 };
    for (const ev of events) c[toStatusTone(ev)] += 1;
    return c;
  }, [events]);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((ev) => toStatusTone(ev) === filter);
  }, [events, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp the page if the active filter shrank the result set.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const changeFilter = (value: StatusTone | 'all') => {
    setFilter(value);
    setPage(1);
  };

  /* ----- Loading ----- */
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 p-4">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  /* ----- Error ----- */
  if (isError) {
    return (
      <Card className="p-6">
        <div className="py-10 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-1 text-base font-semibold text-gray-900">Couldn&apos;t load events</h3>
          <p className="mb-4 text-sm text-gray-500">
            The device events timeline is temporarily unavailable.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Device Events</h2>
          <p className="text-sm text-gray-500">
            Agent commands and operation logs for this router, newest first.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Filter chips */}
      {events.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count = counts[f.value];
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => changeFilter(f.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      {events.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No events recorded yet"
          subtitle="Agent commands and operation logs for this router will appear here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={`No ${filter} events`}
          subtitle="Try a different filter to see more activity."
        />
      ) : (
        <>
          <div className="space-y-2.5">
            {pageItems.map((ev) => (
              <EventRow key={ev.id} event={ev} />
            ))}
          </div>

          {/* Pagination footer */}
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">{start + 1}</span>–
              <span className="font-medium text-gray-700">{start + pageItems.length}</span> of{' '}
              <span className="font-medium text-gray-700">{filtered.length}</span> event
              {filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="px-1 text-xs font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default DeviceEventsTab;

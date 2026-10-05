import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_24px_-16px_rgba(79,70,229,0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const badgeTones: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 ring-red-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PLANNED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MOVED: "bg-slate-100 text-slate-600 ring-slate-200",
  ACTIVE: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function Badge({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset",
        badgeTones[tone] || "bg-slate-100 text-slate-600 ring-slate-200",
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200/70", className)} aria-hidden="true" />;
}

export function LoadingState({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary">{icon}</div>}
      <p className="text-lg font-extrabold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm" role="alert">
      <p className="font-bold text-red-800">Something went wrong</p>
      <p className="mt-0.5 text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[15px] font-bold text-white shadow-[0_6px_16px_-8px_rgba(79,70,229,0.7)] transition hover:bg-primaryHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/25 bg-indigo-50/60 px-5 py-[10px] text-[15px] font-bold text-ink transition hover:border-primary/50 hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold text-muted transition hover:bg-slate-100 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export const inputCls =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-slate-400 transition focus:border-primary focus:outline-none";

export const labelCls = "mb-1.5 block text-sm font-bold text-ink";

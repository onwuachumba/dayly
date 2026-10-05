"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { useTasks } from "@/components/useTasks";
import { cn } from "@/lib/cn";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarPage() {
  const { tasks, loading, error, reload } = useTasks();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<string | null>(() => dayKey(new Date()));

  const { cells, byDay } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const lead = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));

    const byDay = new Map<string, typeof tasks>();
    for (const t of tasks) {
      if (!t.dueDate || t.status === "DONE") continue;
      const key = dayKey(new Date(t.dueDate));
      const arr = byDay.get(key) || [];
      arr.push(t);
      byDay.set(key, arr);
    }
    return { cells, byDay };
  }, [cursor, tasks]);

  const selectedTasks = selected ? tasks.filter((t) => t.dueDate && dayKey(new Date(t.dueDate)) === selected) : [];
  const monthLabel = cursor.toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <main>
      <PageHeader title="Calendar" sub="Your scheduled tasks, mapped across the month." />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={22} />}
          title="No tasks yet — nothing to map."
          body="Add tasks with due dates and they'll appear on your calendar."
          action={
            <Link href="/dashboard/tasks" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
              Go to Tasks <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-ink"
              >
                ← Prev
              </button>
              <p className="font-extrabold">{monthLabel}</p>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                aria-label="Next month"
                className="rounded-lg px-3 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-ink"
              >
                Next →
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-400" aria-hidden="true">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i} className="py-1">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={`e${i}`} />
                ) : (
                  <button
                    key={d.toISOString()}
                    onClick={() => setSelected(dayKey(d))}
                    aria-label={`${d.toLocaleDateString()}, ${(byDay.get(dayKey(d)) || []).length} scheduled tasks`}
                    aria-pressed={selected === dayKey(d)}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center rounded-xl text-sm font-bold transition",
                      selected === dayKey(d)
                        ? "bg-primary text-white shadow-sm"
                        : "text-ink hover:bg-indigo-50",
                    )}
                  >
                    {d.getDate()}
                    {(byDay.get(dayKey(d)) || []).length > 0 && (
                      <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", selected === dayKey(d) ? "bg-white" : "bg-primary")} aria-hidden="true" />
                    )}
                  </button>
                ),
              )}
            </div>
            <p className="mt-3 text-xs text-muted">Only tasks with due dates appear as dots. Add due dates from your task list as they become available.</p>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="font-extrabold">
              {selected
                ? new Date(cursor.getFullYear(), cursor.getMonth(), Number(selected.split("-")[2])).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
                : "Select a day"}
            </h2>
            {selectedTasks.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Nothing scheduled this day. Enjoy the whitespace.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {selectedTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate font-semibold">{t.title}</span>
                    <Badge tone={t.priority}>{t.priority}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}

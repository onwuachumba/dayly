"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, ListTodo } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { useTasks } from "@/components/useTasks";

const ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

export default function TodayPage() {
  const { tasks, loading, error, busyId, reload, toggleTask, cyclePriority, deleteTask } = useTasks();
  const open = tasks
    .filter((t) => t.status !== "DONE")
    .sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);
  const doneToday = tasks.filter((t) => t.status === "DONE");
  const groups: { title: string; items: typeof open }[] = [
    { title: "High priority", items: open.filter((t) => t.priority === "HIGH") },
    { title: "Medium priority", items: open.filter((t) => t.priority === "MEDIUM") },
    { title: "Low priority", items: open.filter((t) => t.priority === "LOW") },
  ];

  return (
    <main>
      <PageHeader
        title="Today's Plan"
        sub="Your real tasks, organized by priority — work top to bottom."
        action={
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-primary/25 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-primary/50"
          >
            Manage tasks <ArrowRight size={16} />
          </Link>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={22} />}
          title="No tasks yet. Add your first task and make today count."
          body="Head to Tasks to capture everything on your mind."
          action={
            <Link href="/dashboard/tasks" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
              Go to Tasks <ArrowRight size={16} />
            </Link>
          }
        />
      ) : (
        <div className="space-y-7">
          {groups.map(
            (g) =>
              g.items.length > 0 && (
                <section key={g.title} aria-label={g.title}>
                  <h2 className="mb-1 flex items-center gap-2 px-3 text-[13px] font-extrabold uppercase tracking-[0.1em] text-muted">
                    <CalendarClock size={14} /> {g.title} · {g.items.length}
                  </h2>
                  <ul className="divide-y divide-stone-200/80 border-y border-stone-200/80">
                    {g.items.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        busy={busyId === t.id}
                        onToggle={() => void toggleTask(t)}
                        onCyclePriority={() => void cyclePriority(t)}
                        onDelete={() => void deleteTask(t)}
                      />
                    ))}
                  </ul>
                </section>
              ),
          )}
          {doneToday.length > 0 && (
            <section aria-label="Completed">
              <h2 className="mb-1 px-3 text-[13px] font-extrabold uppercase tracking-[0.1em] text-emerald-700">
                Completed · {doneToday.length}
              </h2>
              <ul className="divide-y divide-stone-200/80 border-y border-stone-200/80">
                {doneToday.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    busy={busyId === t.id}
                    onToggle={() => void toggleTask(t)}
                    onCyclePriority={() => void cyclePriority(t)}
                    onDelete={() => void deleteTask(t)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

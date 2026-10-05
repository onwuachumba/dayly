"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, ListTodo } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
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
        <div className="space-y-4">
          {groups.map(
            (g) =>
              g.items.length > 0 && (
                <Card key={g.title} className="!p-4">
                  <h2 className="mb-2.5 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-slate-400">
                    <CalendarClock size={15} /> {g.title} · {g.items.length}
                  </h2>
                  <ul className="space-y-2.5">
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
                </Card>
              ),
          )}
          {doneToday.length > 0 && (
            <Card className="!p-4 border-emerald-200/60">
              <h2 className="mb-2.5 text-sm font-extrabold uppercase tracking-wide text-emerald-600">
                Completed · {doneToday.length}
              </h2>
              <ul className="space-y-2.5">
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
            </Card>
          )}
        </div>
      )}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { useTasks } from "@/components/useTasks";
import type { Priority } from "@/lib/api";
import { cn } from "@/lib/cn";

type StatusFilter = "ALL" | "TODAY" | "UPCOMING" | "COMPLETED";
type PriorityFilter = "ALL" | Priority;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODAY", label: "Today" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "COMPLETED", label: "Completed" },
];

const PRIORITY_TABS: { key: PriorityFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "HIGH", label: "High" },
  { key: "MEDIUM", label: "Medium" },
  { key: "LOW", label: "Low" },
];

function isToday(t: { dueDate?: string | null }): boolean {
  if (!t.dueDate) return true; // unscheduled tasks belong to today
  const d = new Date(t.dueDate);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function TasksPage() {
  const { tasks, loading, error, busyId, reload, addTask, toggleTask, cyclePriority, deleteTask } = useTasks();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priority !== "ALL" && t.priority !== priority) return false;
      switch (status) {
        case "COMPLETED":
          return t.status === "DONE";
        case "TODAY":
          return t.status !== "DONE" && isToday(t);
        case "UPCOMING":
          return t.status !== "DONE" && !!t.dueDate && !isToday(t);
        default:
          return true;
      }
    });
  }, [tasks, status, priority]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = title.trim();
    if (!v) return;
    setTitle("");
    await addTask(v);
  }

  return (
    <main>
      <PageHeader title="My Tasks" sub="Create, complete, and organize everything on your plate." />

      <form onSubmit={submit} className="mb-5 flex gap-2">
        <label htmlFor="new-task" className="sr-only">Add a task</label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task… e.g. Prepare tomorrow's presentation"
          className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-[15px] placeholder:text-slate-400 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-[15px] font-bold text-white shadow-sm transition hover:bg-primaryHover disabled:opacity-60"
        >
          <Plus size={18} /> Add Task
        </button>
      </form>

      <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Status filter">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={status === t.key}
            onClick={() => setStatus(t.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-bold transition",
              status === t.key ? "bg-ink text-white" : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5" role="tablist" aria-label="Priority filter">
        {PRIORITY_TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={priority === t.key}
            onClick={() => setPriority(t.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-bold transition",
              priority === t.key ? "bg-primary text-white" : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void reload()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListTodo size={22} />}
          title={tasks.length === 0 ? "No tasks yet. Add your first task and make today count." : "You're all caught up."}
          body={tasks.length === 0 ? "Capture everything on your mind — DAYLY will help you prioritize it." : "Nothing matches these filters. Try a different view."}
        />
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((t) => (
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
      )}
    </main>
  );
}

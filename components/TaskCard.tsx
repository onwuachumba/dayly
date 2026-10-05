"use client";

import { Check, RefreshCw, Trash2 } from "lucide-react";
import type { Task } from "@/lib/api";
import { Badge } from "./ui";
import { cn } from "@/lib/cn";

export function TaskCard({
  task,
  onToggle,
  onCyclePriority,
  onDelete,
  busy,
}: {
  task: Task;
  onToggle: () => void;
  onCyclePriority: () => void;
  onDelete: () => void;
  busy?: boolean;
}) {
  const done = task.status === "DONE";
  return (
    <li
      className={cn(
        "group rounded-2xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:shadow-[0_8px_24px_-16px_rgba(79,70,229,0.35)]",
        done ? "border-emerald-200/70 opacity-80" : "border-slate-200/80",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          disabled={busy}
          aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
            done
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-transparent hover:border-primary hover:text-primary/40",
          )}
        >
          <Check size={14} strokeWidth={3.5} />
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("font-bold leading-snug text-ink", done && "text-slate-400 line-through")}>
            {task.title}
          </p>
          <p className="mt-0.5 text-[13px] text-muted">
            {[task.timeLabel, task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null, task.category]
              .filter(Boolean)
              .join(" · ") || "No time set"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={task.priority}>{task.priority}</Badge>
            <Badge tone={task.status}>{task.status}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button
            onClick={onCyclePriority}
            disabled={busy}
            aria-label={`Change priority, currently ${task.priority}`}
            title="Cycle priority"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-indigo-50 hover:text-primary"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            aria-label={`Delete ${task.title}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
}

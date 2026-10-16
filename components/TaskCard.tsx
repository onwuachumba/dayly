"use client";

import { Check, RefreshCw, Trash2 } from "lucide-react";
import type { Task } from "@/lib/api";
import { cn } from "@/lib/cn";

const DOT: Record<Task["priority"], string> = {
  HIGH: "bg-[#B4552D]",
  MEDIUM: "bg-golddeep",
  LOW: "bg-[#4D7C4F]",
};

const LABEL: Record<Task["priority"], string> = {
  HIGH: "High priority",
  MEDIUM: "Medium priority",
  LOW: "Low priority",
};

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
  const meta = [task.timeLabel, task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null, task.category]
    .filter(Boolean)
    .join(" · ");

  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl px-3 py-3 transition",
        done ? "opacity-60" : "hover:bg-white hover:shadow-[0_1px_2px_rgba(28,36,32,0.07)]",
      )}
    >
      <button
        onClick={onToggle}
        disabled={busy}
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          done
            ? "border-primary bg-primary text-white"
            : "border-stone-300 text-transparent hover:border-primary hover:text-primary/40",
        )}
      >
        <Check size={14} strokeWidth={3.5} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[task.priority])} aria-hidden="true" />
          <span className={cn("truncate font-semibold leading-snug text-ink", done && "text-slate-400 line-through")}>
            {task.title}
          </span>
        </p>
        <p className="mt-0.5 pl-4 text-[13px] text-muted">
          {[meta || "No time set", LABEL[task.priority]].filter(Boolean).join(" · ")}
          {task.status === "MOVED" && " · Moved"}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          onClick={onCyclePriority}
          disabled={busy}
          aria-label={`Change priority, currently ${task.priority}`}
          title="Cycle priority"
          className="rounded-lg p-2 text-slate-400 transition hover:bg-pine-50 hover:text-primary focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={onDelete}
          disabled={busy}
          aria-label={`Delete ${task.title}`}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}

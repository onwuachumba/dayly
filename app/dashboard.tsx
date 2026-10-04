"use client";

import { useEffect, useState } from "react";
import { authClient, useSession } from "@/lib/auth-client";

type Task = {
  id: string;
  title: string;
  timeLabel: string | null;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PLANNED" | "DONE" | "MOVED";
};

const MOCK_TASKS: Task[] = [
  { id: "mock-1", title: "Finish business proposal", timeLabel: "9:00 AM", priority: "HIGH", status: "PLANNED" },
  { id: "mock-2", title: "Call three clients", timeLabel: "11:00 AM", priority: "MEDIUM", status: "PLANNED" },
  { id: "mock-3", title: "Client meeting", timeLabel: "2:00 PM", priority: "HIGH", status: "PLANNED" },
  { id: "mock-4", title: "Buy groceries", timeLabel: "4:00 PM", priority: "LOW", status: "PLANNED" },
  { id: "mock-5", title: "Exercise", timeLabel: "6:00 PM", priority: "LOW", status: "PLANNED" },
];

const NEXT_PRIORITY = { HIGH: "MEDIUM", MEDIUM: "LOW", LOW: "HIGH" } as const;

export function StaticPreview({ setupBanner }: { setupBanner?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      {setupBanner}
      <header className="rounded-xl border bg-white p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">DAYLY</h1>
        <p className="mt-1 font-semibold text-muted">
          Make Today Count — your AI-powered everyday life companion.
        </p>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide text-primary">
          Capture → Understand → Prioritize → Plan → Remind → Adapt → Review
        </p>
      </header>
      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-xl font-bold">Today&apos;s plan (preview)</h2>
        <ul className="mt-4 space-y-2">
          {MOCK_TASKS.map((t) => (
            <li key={t.id} className="rounded-lg border border-l-4 p-3">
              <span className="font-bold">{t.timeLabel} — {t.title}</span>{" "}
              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-primary">
                {t.priority}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function Dashboard({ email, displayName }: { email?: string; displayName?: string }) {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/tasks?take=50");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
      setTasks(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function addTask() {
    const t = title.trim();
    if (!t) return;
    setError(null);
    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
      setTitle("");
      setTasks((prev) => [data.item, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add task");
    }
  }

  async function patchTask(id: string, patch: Partial<Task>) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);
      setTasks((prev) => prev.map((t) => (t.id === id ? data.item : t)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update task");
    }
  }

  async function deleteTask(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message || `Request failed (${res.status})`);
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete task");
    }
  }

  const done = tasks.filter((t) => t.status === "DONE").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">DAYLY</h1>
            <p className="mt-1 font-semibold text-muted">
              {displayName || session?.user?.name || email || session?.user?.email
                ? `Let's make today count, ${displayName || session?.user?.name || email || session?.user?.email}.`
                : "Let's make today count."}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide text-primary">
          Capture → Understand → Prioritize → Plan → Remind → Adapt → Review
        </p>
        <button
          className="mt-3 rounded-lg border px-3 py-2 text-sm font-bold"
          onClick={() => {
            void authClient.signOut().finally(() => window.location.assign("/"));
          }}
        >
          Sign out
        </button>
      </header>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-xl font-bold">Today&apos;s progress</h2>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-sm text-muted">{done} of {tasks.length} tasks completed ({pct}%)</p>
      </section>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="text-xl font-bold">Capture — add a responsibility</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border-2 border-slate-300 px-3 py-3"
            placeholder="e.g. Prepare tomorrow's presentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void addTask();
            }}
          />
          <button
            className="rounded-lg bg-primary px-5 py-3 font-bold text-white hover:bg-primaryHover"
            onClick={() => void addTask()}
          >
            Add task
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-bold text-red-700">{error}</p>}
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading tasks…</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-lg border border-l-4 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-bold ${t.status === "DONE" ? "line-through opacity-70" : ""}`}>
                    {t.timeLabel ? `${t.timeLabel} — ` : ""}{t.title}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-primary">
                    {t.priority} · {t.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border px-3 py-1 text-sm font-bold"
                    onClick={() => void patchTask(t.id, { status: t.status === "DONE" ? "PLANNED" : "DONE" })}
                  >
                    {t.status === "DONE" ? "Reopen" : "Complete"}
                  </button>
                  <button
                    className="rounded-lg border px-3 py-1 text-sm font-bold"
                    onClick={() => void patchTask(t.id, { priority: NEXT_PRIORITY[t.priority] })}
                  >
                    Priority: {t.priority} ↻
                  </button>
                  <button
                    className="rounded-lg border px-3 py-1 text-sm font-bold"
                    onClick={() => void deleteTask(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {!tasks.length && <li className="text-sm text-muted">No tasks yet — add your first one above.</li>}
          </ul>
        )}
      </section>
    </main>
  );
}

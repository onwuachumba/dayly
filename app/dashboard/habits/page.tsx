"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Flame, Plus, Sprout, Trash2 } from "lucide-react";
import { api, type Habit } from "@/lib/api";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";

function weekDots(lastDoneAt?: string | null) {
  const done = lastDoneAt ? new Date(lastDoneAt).toDateString() === new Date().toDateString() : false;
  return Array.from({ length: 7 }).map((_, i) => (
    <span
      key={i}
      className={`h-2.5 w-2.5 rounded-full ${i === 6 && done ? "bg-emerald-500" : "bg-slate-200"}`}
      aria-hidden="true"
    />
  ));
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.habits.list();
      setHabits(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setError(null);
    try {
      const { item } = await api.habits.create({ title: t });
      setHabits((prev) => [item, ...prev]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create habit");
    }
  }

  async function checkin(h: Habit) {
    setError(null);
    try {
      const { item } = await api.habits.checkin(h.id);
      setHabits((prev) => prev.map((x) => (x.id === h.id ? item : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.habits.remove(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete habit");
    }
  }

  return (
    <main>
      <PageHeader title="Build better habits." sub="Small habits create big changes — track streaks that stick." />

      <Card className="mb-5">
        <form onSubmit={create} className="flex gap-2">
          <label htmlFor="habit-title" className="sr-only">New habit</label>
          <input
            id="habit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Exercise, Read, Meditate…"
            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-[15px] placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-primaryHover"
          >
            <Plus size={18} /> Add
          </button>
        </form>
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={<Sprout size={22} />}
          title="Small habits create big changes."
          body="No habits yet — add your first one above and start your streak."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {habits.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Flame size={20} />
                  </span>
                  <div>
                    <p className="font-extrabold leading-tight">{h.title}</p>
                    <p className="text-xs font-bold text-muted">
                      {h.streak}-day streak · {h.frequency.toLowerCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => void remove(h.id)}
                  aria-label={`Delete ${h.title}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1" aria-label="Weekly progress">
                  {weekDots(h.lastDoneAt)}
                </div>
                <button
                  onClick={() => void checkin(h)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Check size={16} /> Check in
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

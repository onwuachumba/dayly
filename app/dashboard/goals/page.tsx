"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { api, type Goal } from "@/lib/api";
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader, ProgressBar } from "@/components/ui";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.goals.list();
      setGoals(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load goals");
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
      const { item } = await api.goals.create({ title: t, target: target.trim() || undefined });
      setGoals((prev) => [item, ...prev]);
      setTitle("");
      setTarget("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    }
  }

  async function setProgress(g: Goal, progress: number) {
    setError(null);
    try {
      const { item } = await api.goals.update(g.id, {
        progress,
        status: progress >= 100 ? "DONE" : g.status === "DONE" ? "ACTIVE" : g.status,
      });
      setGoals((prev) => prev.map((x) => (x.id === g.id ? item : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update goal");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await api.goals.remove(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete goal");
    }
  }

  return (
    <main>
      <PageHeader title="Goals" sub="Connect daily actions to what actually matters." />

      <Card className="mb-5">
        <form onSubmit={create} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="goal-title" className="sr-only">Goal title</label>
          <input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Launch my business website"
            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-[15px] placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
          <label htmlFor="goal-target" className="sr-only">Goal target (optional)</label>
          <input
            id="goal-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target (optional)"
            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3.5 py-2.5 text-[15px] placeholder:text-slate-400 focus:border-primary focus:outline-none sm:max-w-[220px]"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-primaryHover"
          >
            <Plus size={18} /> Create Your First Goal
          </button>
        </form>
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<Target size={22} />}
          title="Turn your ideas into goals."
          body="Your goals will appear here. Create one above and track real progress toward it."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <Card key={g.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold leading-snug">{g.title}</p>
                  {g.target && <p className="mt-0.5 text-sm text-muted">Target: {g.target}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone={g.status}>{g.status}</Badge>
                  <button
                    onClick={() => void remove(g.id)}
                    aria-label={`Delete ${g.title}`}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar value={g.progress} />
                </div>
                <span className="text-sm font-extrabold">{g.progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={g.progress}
                onChange={(e) => void setProgress(g, Number(e.target.value))}
                aria-label={`Progress for ${g.title}`}
                className="mt-3 w-full accent-indigo-600"
              />
              <p className="mt-1 text-xs font-semibold text-muted">Milestones — drag to update real progress</p>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

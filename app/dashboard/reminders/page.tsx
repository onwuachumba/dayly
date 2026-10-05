"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellRing, CalendarPlus, Trash2 } from "lucide-react";
import { api, type Reminder } from "@/lib/api";
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/ui";

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [when, setWhen] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.reminders.list();
      setReminders(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main>
      <PageHeader title="Reminders" sub="The right nudge at the right time — never noise." />

      <Card className="mb-5 border-amber-200/60 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <BellRing size={20} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="text-sm leading-relaxed text-slate-600">
            <p className="font-extrabold text-ink">Timed push reminders are coming soon.</p>
            <p className="mt-1">
              For now, reminders you create on tasks live here as a clean timeline. Use the form below to
              schedule one — it will persist to your account.
            </p>
          </div>
        </div>
        <ScheduleForm
          when={when}
          setWhen={setWhen}
          setError={setError}
          setReminders={setReminders}
        />
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={<Bell size={22} />}
          title="All quiet — nothing scheduled."
          body="Schedule your first reminder above and DAYLY will keep it on your radar."
        />
      ) : (
        <ol className="relative space-y-3 border-l-2 border-indigo-100 pl-5">
          {reminders.map((r) => (
            <li key={r.id} className="relative">
              <span className="absolute -left-[27px] top-4 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-indigo-100" aria-hidden="true" />
              <Card className="!p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{r.task?.title || "Reminder"}</p>
                    <p className="text-sm font-semibold text-muted">{fmt(r.remindAt)}</p>
                  </div>
                  <button
                    onClick={() => void (async () => {
                      setError(null);
                      try {
                        await api.reminders.remove(r.id);
                        setReminders((prev) => prev.filter((x) => x.id !== r.id));
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Failed to delete reminder");
                      }
                    })()}
                    aria-label="Delete reminder"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function ScheduleForm({
  when, setWhen, setError, setReminders,
}: {
  when: string;
  setWhen: (v: string) => void;
  setError: (v: string | null) => void;
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}) {
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!when) {
      setError("Pick a date and time for the reminder.");
      return;
    }
    setError(null);
    try {
      const { item } = await api.reminders.create({ remindAt: new Date(when).toISOString() });
      setReminders((prev) => [item, ...prev].sort((a, b) => +new Date(a.remindAt) - +new Date(b.remindAt)));
      setWhen("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule reminder");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <label htmlFor="rem-when" className="sr-only">Date and time</label>
      <input
        id="rem-when"
        type="datetime-local"
        required
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-[15px] focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[15px] font-bold text-white transition hover:bg-primaryHover"
      >
        <CalendarPlus size={18} /> Schedule
      </button>
    </form>
  );
}

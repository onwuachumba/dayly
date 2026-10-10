import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Bell, Flame } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma, dbUrl } from "@/lib/db";
import { greeting } from "@/lib/greeting";
import { Card, EmptyState, PageHeader, ProgressBar } from "@/components/ui";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const [tasks, habits, reminders] = await Promise.all([
    prisma.task.findMany({ where: { userId }, orderBy: [{ createdAt: "desc" }], take: 100 }),
    prisma.habit.findMany({ where: { userId } }),
    prisma.reminder.findMany({
      where: { userId, sent: false, remindAt: { gte: new Date() } },
      orderBy: [{ remindAt: "asc" }],
      take: 5,
      include: { task: true },
    }),
  ]);
  return { tasks, habits, reminders };
}

const DOT: Record<string, string> = {
  HIGH: "bg-[#B4552D]",
  MEDIUM: "bg-golddeep",
  LOW: "bg-[#4D7C4F]",
};

export default async function DashboardPage() {
  const session = await auth!.api.getSession({ headers: await headers() });
  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "there";

  if (!dbUrl()) {
    return (
      <main>
        <PageHeader title={`${greeting()}`} sub="Here's what your day looks like." />
        <EmptyState
          title="Database is not configured"
          body="Connect your database to see your live dashboard. Your tasks, goals, and habits will appear here."
        />
      </main>
    );
  }

  const { tasks, habits, reminders } = await getDashboardData(session!.user.id);
  const done = tasks.filter((t) => t.status === "DONE").length;
  const high = tasks.filter((t) => t.priority === "HIGH" && t.status !== "DONE").length;
  const upcoming = reminders.length;
  const topTasks = tasks.filter((t) => t.status !== "DONE").slice(0, 5);
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const stats = [
    { label: "Today's Tasks", value: tasks.length, sub: `${tasks.length - done} remaining` },
    { label: "Completed", value: done, sub: tasks.length ? `${pct}% done` : "Nothing yet" },
    { label: "High Priority", value: high, sub: high ? "Needs attention" : "All clear" },
    { label: "Upcoming", value: upcoming, sub: reminders.length ? "Reminders set" : "None scheduled" },
  ];

  return (
    <main>
      <PageHeader
        title={`${greeting()}, ${name}`}
        sub="Here's what your day looks like."
        action={
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primaryHover"
          >
            Manage tasks <ArrowRight size={16} />
          </Link>
        }
      />

      {/* Quiet stat strip */}
      <dl className="grid grid-cols-2 divide-stone-200/80 rounded-2xl border border-stone-200/80 bg-white/70 sm:grid-cols-4 sm:divide-x">
        {stats.map((s, i) => (
          <div key={s.label} className={`px-5 py-4 ${i >= 2 ? "border-t border-stone-200/80 sm:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-stone-200/80 sm:border-l-0" : ""}`}>
            <dt className="text-[13px] font-bold text-muted">{s.label}</dt>
            <dd className="mt-0.5 text-[26px] font-extrabold leading-none">{s.value}</dd>
            <dd className="mt-1 text-xs font-semibold text-muted">{s.sub}</dd>
          </div>
        ))}
      </dl>

      {/* Slim progress */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-stone-200/80 bg-white/70 px-5 py-3.5">
        <p className="shrink-0 text-sm font-extrabold">Today&apos;s Progress</p>
        <div className="flex-1">
          <ProgressBar value={done} max={tasks.length} />
        </div>
        <p className="shrink-0 text-sm font-bold text-muted">
          {done} of {tasks.length}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        {/* Up next — the hero section */}
        <section aria-label="Up next" className="lg:col-span-3">
          <div className="mb-2 flex items-baseline justify-between px-1">
            <h2 className="text-lg font-extrabold tracking-tight">Up next</h2>
            <Link href="/dashboard/today" className="text-sm font-bold text-primary hover:underline">
              View full plan
            </Link>
          </div>
          {topTasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted">
              You&apos;re all caught up — nothing left today.
            </p>
          ) : (
            <ul className="divide-y divide-stone-200/80 border-y border-stone-200/80">
              {topTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-1 py-3.5">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[t.priority]}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                    {t.timeLabel && <span className="mr-2 font-bold text-muted">{t.timeLabel}</span>}
                    {t.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-7 lg:col-span-2">
          <section aria-label="Reminders">
            <div className="mb-1.5 flex items-baseline justify-between px-1">
              <h2 className="text-[15px] font-extrabold">Reminders</h2>
              <Link href="/dashboard/reminders" className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            {reminders.length === 0 ? (
              <p className="px-1 text-sm text-muted">No upcoming reminders. Enjoy the calm.</p>
            ) : (
              <ul className="divide-y divide-stone-200/80 border-y border-stone-200/80">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-center gap-2.5 px-1 py-2.5 text-sm">
                    <Bell size={15} className="shrink-0 text-golddeep" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {r.task?.title || "Reminder"}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-muted">
                      {new Date(r.remindAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Habits">
            <div className="mb-1.5 flex items-baseline justify-between px-1">
              <h2 className="text-[15px] font-extrabold">Habits</h2>
              <Link href="/dashboard/habits" className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            {habits.length === 0 ? (
              <p className="px-1 text-sm text-muted">Small habits create big changes. Start your first one.</p>
            ) : (
              <ul className="divide-y divide-stone-200/80 border-y border-stone-200/80">
                {habits.slice(0, 4).map((h) => (
                  <li key={h.id} className="flex items-center gap-2.5 px-1 py-2.5 text-sm">
                    <Flame size={15} className="shrink-0 text-golddeep" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{h.title}</span>
                    <span className="shrink-0 text-xs font-bold text-muted">{h.streak}-day streak</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Card className="border-pine-200 bg-pine-50">
            <p className="font-extrabold text-pine-900">Evening review</p>
            <p className="mt-1 text-sm text-pine-900/70">
              {done === 0 && tasks.length === 0
                ? "Add your first task to start building momentum."
                : `${done} of ${tasks.length} done — finish strong, then review your day.`}
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}

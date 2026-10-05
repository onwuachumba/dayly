import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Flame, ListTodo, TriangleAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma, dbUrl } from "@/lib/db";
import { greeting } from "@/components/useTasks";
import { Badge, Card, EmptyState, PageHeader, ProgressBar } from "@/components/ui";

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

export default async function DashboardPage() {
  const session = await auth!.api.getSession({ headers: await headers() });
  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "there";

  if (!dbUrl()) {
    return (
      <main>
        <PageHeader title={`${greeting()} 👋`} sub="Here's what your day looks like." />
        <EmptyState
          icon={<ListTodo size={22} />}
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

  const stats = [
    { icon: ListTodo, label: "Today's Tasks", value: tasks.length, sub: `${tasks.length - done} remaining`, tone: "text-primary bg-indigo-50" },
    { icon: CheckCircle2, label: "Completed", value: done, sub: tasks.length ? `${Math.round((done / tasks.length) * 100)}% done` : "Nothing yet", tone: "text-emerald-600 bg-emerald-50" },
    { icon: TriangleAlert, label: "High Priority", value: high, sub: high ? "Needs attention" : "All clear", tone: "text-red-600 bg-red-50" },
    { icon: Bell, label: "Upcoming", value: upcoming, sub: reminders.length ? "Reminders set" : "None scheduled", tone: "text-amber-600 bg-amber-50" },
  ];

  return (
    <main>
      <PageHeader
        title={`${greeting()}, ${name} 👋`}
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, sub, tone }) => (
          <Card key={label} className="!p-4">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none">{value}</p>
                <p className="mt-1 text-[13px] font-bold text-ink">{label}</p>
              </div>
            </div>
            <p className="mt-2 text-[13px] text-muted">{sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold">Today&apos;s Progress</h2>
            <span className="text-sm font-bold text-muted">
              {done} of {tasks.length} tasks completed
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={done} max={tasks.length} />
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-400">Up next</h3>
              <Link href="/dashboard/today" className="text-sm font-bold text-primary hover:underline">
                View plan
              </Link>
            </div>
            {topTasks.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-muted">
                You&apos;re all caught up. 🎉
              </p>
            ) : (
              <ul className="space-y-2">
                {topTasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {t.timeLabel && <span className="mr-1.5 font-normal text-slate-400">{t.timeLabel}</span>}
                      {t.title}
                    </span>
                    <Badge tone={t.priority}>{t.priority}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-extrabold">Reminders</h2>
              <Link href="/dashboard/reminders" className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            {reminders.length === 0 ? (
              <p className="text-sm text-muted">No upcoming reminders. Enjoy the calm.</p>
            ) : (
              <ul className="space-y-2">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                    <Bell size={16} className="shrink-0 text-amber-500" />
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
          </Card>

          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-extrabold">Habits</h2>
              <Link href="/dashboard/habits" className="text-sm font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            {habits.length === 0 ? (
              <p className="text-sm text-muted">Small habits create big changes. Start your first one.</p>
            ) : (
              <ul className="space-y-2">
                {habits.slice(0, 4).map((h) => (
                  <li key={h.id} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                    <Flame size={16} className="shrink-0 text-orange-500" />
                    <span className="min-w-0 flex-1 truncate font-semibold">{h.title}</span>
                    <span className="shrink-0 text-xs font-bold text-muted">{h.streak}-day streak</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

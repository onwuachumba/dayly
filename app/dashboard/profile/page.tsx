import { headers } from "next/headers";
import { LogOut, Mail, User as UserIcon } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma, dbUrl } from "@/lib/db";
import { Card, PageHeader } from "@/components/ui";
import { SignOutButton } from "./signout-button";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth!.api.getSession({ headers: await headers() });
  let row = null as null | { name: string | null; email: string; workStart: string | null; workEnd: string | null; createdAt: Date };
  let counts = { tasks: 0, goals: 0, habits: 0 };
  if (session?.user && dbUrl()) {
    row = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, workStart: true, workEnd: true, createdAt: true },
    });
    const [tasks, goals, habits] = await Promise.all([
      prisma.task.count({ where: { userId: session.user.id } }),
      prisma.goal.count({ where: { userId: session.user.id } }),
      prisma.habit.count({ where: { userId: session.user.id } }),
    ]);
    counts = { tasks, goals, habits };
  }

  return (
    <main>
      <PageHeader title="Profile" sub="Your DAYLY account at a glance." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-extrabold text-white">
              {(row?.name || session?.user?.name || session?.user?.email || "D").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{row?.name || session?.user?.name || "DAYLY user"}</p>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted">
                <Mail size={14} /> {row?.email || session?.user?.email}
              </p>
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
              <dt className="font-semibold text-muted">Member since</dt>
              <dd className="font-bold">{row ? new Date(row.createdAt).toLocaleDateString([], { month: "long", year: "numeric" }) : "—"}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-3.5 py-2.5">
              <dt className="font-semibold text-muted">Working hours</dt>
              <dd className="font-bold">{row?.workStart && row?.workEnd ? `${row.workStart} – ${row.workEnd}` : "Not set"}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-muted">
            <UserIcon size={15} />
            Account secured with email + password. We never show passwords here.
          </div>
          <SignOutButton />
        </Card>

        <Card>
          <h2 className="font-extrabold">Your footprint</h2>
          <p className="text-sm text-muted">Everything you&apos;ve built in DAYLY so far.</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Tasks", value: counts.tasks },
              { label: "Goals", value: counts.goals },
              { label: "Habits", value: counts.habits },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-slate-50 px-2 py-4">
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs font-bold text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
            <LogOut size={13} /> Signing out ends this session on this device.
          </p>
        </Card>
      </div>
    </main>
  );
}

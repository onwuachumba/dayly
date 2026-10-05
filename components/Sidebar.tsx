"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  Flame,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Settings,
  Target,
  User,
  X,
} from "lucide-react";
import { Logo } from "./Logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tasks", label: "Tasks", icon: ListTodo },
  { href: "/dashboard/goals", label: "Goals", icon: Target },
  { href: "/dashboard/habits", label: "Habits", icon: Flame },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
];

const PLANNING = [
  { href: "/dashboard/today", label: "Today's Plan", icon: CalendarClock },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

const ACCOUNT = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function NavSection({ title, items, active, onNavigate }: {
  title: string;
  items: typeof MAIN;
  active: string;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label={title}>
      <p className="px-3 pb-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{title}</p>
      <ul className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? active === href : active === href || active.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition",
                  isActive
                    ? "bg-indigo-600 text-white shadow-[0_6px_16px_-8px_rgba(79,70,229,0.8)]"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-ink",
                )}
              >
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} className={isActive ? "" : "text-slate-400 group-hover:text-primary"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarBody({ active, onNavigate }: { active: string; onNavigate: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" onClick={onNavigate} className="px-2 pb-5 pt-1">
        <Logo />
      </Link>
      <div className="flex-1 space-y-6 overflow-y-auto pb-4">
        <NavSection title="Main" items={MAIN} active={active} onNavigate={onNavigate} />
        <NavSection title="Planning" items={PLANNING} active={active} onNavigate={onNavigate} />
        <NavSection title="Account" items={ACCOUNT} active={active} onNavigate={onNavigate} />
      </div>
      <button
        onClick={() => {
          onNavigate();
          void authClient.signOut().finally(() => window.location.assign("/"));
        }}
        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
      >
        <LogOut size={19} />
        Sign Out
      </button>
      <p className="px-3 pb-1 pt-4 text-xs font-semibold text-slate-400">DAYLY · Make Today Count</p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F5FA]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[248px] border-r border-slate-200/70 bg-white px-4 py-5 lg:block">
        <SidebarBody active={pathname} onNavigate={() => undefined} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo size={30} />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl border border-slate-200 p-2 text-ink transition hover:bg-slate-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white px-4 py-5 shadow-2xl">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-xl border border-slate-200 p-2 text-ink transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarBody active={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:pl-[248px]">
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

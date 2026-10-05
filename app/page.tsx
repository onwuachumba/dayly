import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  ArrowRight,
  Bell,
  BrainCircuit,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Flame,
  GraduationCap,
  Inbox,
  ListChecks,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Wand2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { auth, isAuthConfigured } from "@/lib/auth";
import { btnPrimary, btnSecondary, Card } from "@/components/ui";

const JOURNEY = [
  { icon: Inbox, title: "Capture", body: "Dump everything on your mind — type it, speak it, add it. DAYLY takes it from there." },
  { icon: BrainCircuit, title: "Understand", body: "Your responsibilities are interpreted: deadlines, fixed times, effort, and context." },
  { icon: ListChecks, title: "Prioritize", body: "Urgent, important, flexible, optional — DAYLY recommends what deserves you first." },
  { icon: CalendarCheck, title: "Plan", body: "A realistic schedule built around your hours, meetings, and energy — never overload." },
  { icon: Bell, title: "Remind", body: "Useful nudges for what matters next. No noise, no nagging." },
  { icon: RefreshCw, title: "Adapt", body: "Plans change. DAYLY reshuffles the rest of your day in seconds." },
  { icon: TrendingUp, title: "Review", body: "End the day knowing exactly what moved forward — and what's next." },
];

const FEATURES = [
  { icon: CalendarCheck, title: "Organize your day", body: "Tasks, appointments, and routines in one clear plan you can actually follow." },
  { icon: Target, title: "Prioritize what matters", body: "AI recommendations with you in control. Override anything, anytime." },
  { icon: Rocket, title: "Turn goals into action", body: "Long-term goals broken into daily steps that show up in your plan." },
  { icon: Flame, title: "Build better habits", body: "Streaks and gentle check-ins that make consistency effortless." },
  { icon: Bell, title: "Stay on top of reminders", body: "The right nudge at the right time — for deadlines, habits, and follow-ups." },
  { icon: TrendingUp, title: "Review your progress", body: "Morning check-ins and evening reviews close the loop every day." },
];

const AUDIENCES = [
  { icon: Briefcase, title: "Busy Professionals", body: "Demanding careers plus real life — finally in one calm plan." },
  { icon: Rocket, title: "Entrepreneurs", body: "Clients, business, and personal goals competing for every hour." },
  { icon: GraduationCap, title: "Students / Learners", body: "Study, assignments, and habits organized around your energy." },
  { icon: User, title: "Everyday Users", body: "Anyone who wants their day to feel lighter and more intentional." },
];

function PreviewDashboard() {
  const rows = [
    { time: "9:00 AM", title: "Finish business proposal", tag: "High", tone: "bg-red-50 text-red-700", done: true },
    { time: "11:00 AM", title: "Call three clients", tag: "Medium", tone: "bg-amber-50 text-amber-800", done: true },
    { time: "2:00 PM", title: "Client meeting", tag: "Fixed", tone: "bg-indigo-50 text-indigo-700", done: false },
    { time: "4:00 PM", title: "Buy groceries", tag: "Low", tone: "bg-emerald-50 text-emerald-700", done: false },
    { time: "6:00 PM", title: "Exercise", tag: "Habit", tone: "bg-emerald-50 text-emerald-700", done: false },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(79,70,229,0.35)]" aria-hidden="true">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
        </div>
        <span className="text-xs font-bold text-slate-400">Today&apos;s Plan</span>
      </div>
      <div className="p-5">
        <p className="text-sm font-bold text-ink">Good morning 👋</p>
        <p className="text-xs text-muted">2 of 5 completed · 40%</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400" />
        </div>
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.title} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${r.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent"}`}>
                <CheckCircle2 size={12} strokeWidth={3.5} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                <span className="mr-1.5 font-normal text-slate-400">{r.time}</span>
                {r.title}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${r.tone}`}>{r.tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default async function Home() {
  if (isAuthConfigured() && auth) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-[15px] font-semibold text-slate-600 md:flex" aria-label="Primary">
            <a href="#how" className="transition hover:text-ink">How it works</a>
            <a href="#features" className="transition hover:text-ink">Features</a>
            <a href="#ai" className="transition hover:text-ink">AI</a>
            <a href="#who" className="transition hover:text-ink">Who it&apos;s for</a>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/sign-in" className="rounded-xl px-4 py-2 text-[15px] font-bold text-slate-600 transition hover:bg-slate-100 hover:text-ink">
              Sign In
            </Link>
            <Link href="/sign-up" className={`${btnPrimary} !px-4 !py-2`}>
              Get Started <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-20">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[13px] font-bold text-primary ring-1 ring-inset ring-indigo-200">
            <Sparkles size={14} /> Your AI-powered everyday life companion
          </p>
          <h1 className="mt-4 text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Make Today Count.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted">
            Turn everything on your mind into a clear, achievable plan with your AI-powered everyday life companion.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/sign-up" className={btnPrimary}>
              Get Started <ArrowRight size={18} />
            </Link>
            <Link href="/sign-in" className={btnSecondary}>Sign In</Link>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-muted">
            <Wand2 size={16} className="text-primary" />
            Capture → Prioritize → Plan → Review — in seconds, every morning.
          </div>
        </div>
        <PreviewDashboard />
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">How DAYLY works</p>
          <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            From scattered thoughts to a day that flows.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-20px_rgba(79,70,229,0.5)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <Icon size={20} />
                </div>
                <p className="mt-3 font-extrabold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </Card>
            ))}
            <Card className="flex flex-col justify-center bg-ink text-white sm:col-span-2 lg:col-span-1">
              <p className="text-lg font-extrabold leading-snug">Don&apos;t just give me a list. Help me figure out what to do.</p>
              <p className="mt-2 text-sm text-slate-300">That&apos;s the heart of DAYLY.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">Why DAYLY</p>
        <h2 className="mt-2 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything your day needs, in one calm place.
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="transition hover:-translate-y-0.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                <Icon size={20} />
              </div>
              <p className="mt-3 font-extrabold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* AI */}
      <section id="ai" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-12 text-white sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/40 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" aria-hidden="true" />
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold ring-1 ring-inset ring-white/20">
            <BrainCircuit size={14} /> Intelligent planning
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Scattered thoughts in. Organized action out.
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">
            Tell DAYLY everything on your plate — deadlines, meetings, errands, habits. It weighs urgency,
            importance, and your available time, then builds a realistic plan around your life. When the day
            changes, the plan changes with it.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-slate-400">
            Advanced conversational AI planning is on the roadmap — today DAYLY ships smart prioritization,
            realistic scheduling, and flexible rescheduling.
          </p>
          <Link href="/sign-up" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[15px] font-bold text-ink transition hover:bg-indigo-50">
            Try it free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Who */}
      <section id="who" className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">Who it&apos;s for</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Built for busy people like you.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <Icon size={22} className="text-primary" />
                <p className="mt-3 font-extrabold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/60 px-6 py-10 text-center sm:px-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your day. Your priorities. Your progress.</h2>
            <Link href="/sign-up" className={`${btnPrimary} mt-6`}>
              Start Making Today Count <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <Logo />
              <p className="mt-2 text-sm font-semibold text-muted">Make Today Count</p>
            </div>
            <nav className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3" aria-label="Footer">
              <div>
                <p className="font-extrabold text-ink">Product</p>
                <ul className="mt-2 space-y-1.5 font-semibold text-slate-500">
                  <li><Link href="/" className="transition hover:text-ink">Home</Link></li>
                  <li><Link href="/dashboard" className="transition hover:text-ink">Dashboard</Link></li>
                  <li><Link href="/dashboard/tasks" className="transition hover:text-ink">Tasks</Link></li>
                  <li><Link href="/dashboard/goals" className="transition hover:text-ink">Goals</Link></li>
                  <li><Link href="/dashboard/habits" className="transition hover:text-ink">Habits</Link></li>
                  <li><Link href="/dashboard/reminders" className="transition hover:text-ink">Reminders</Link></li>
                </ul>
              </div>
              <div>
                <p className="font-extrabold text-ink">Account</p>
                <ul className="mt-2 space-y-1.5 font-semibold text-slate-500">
                  <li><Link href="/sign-in" className="transition hover:text-ink">Sign In</Link></li>
                  <li><Link href="/sign-up" className="transition hover:text-ink">Get Started</Link></li>
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-400">
            © {new Date().getFullYear()} DAYLY · Make Today Count. Your AI-powered everyday life companion.
          </p>
        </div>
      </footer>
    </div>
  );
}

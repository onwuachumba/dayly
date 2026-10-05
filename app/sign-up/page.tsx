"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { authClient } from "@/lib/auth-client";
import { btnPrimary, inputCls, labelCls } from "@/components/ui";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({ name, email, password });
      if (error) throw new Error(error.message || "Sign up failed");
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-[#F7F8FC] lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/"><Logo /></Link>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Create your DAYLY account</h1>
          <p className="mt-2 text-muted">Start turning busy days into organized progress.</p>
          <form onSubmit={onSubmit} className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(79,70,229,0.4)] sm:p-7">
            <label className={labelCls} htmlFor="name">Name</label>
            <input id="name" type="text" required autoComplete="name" value={name}
              onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
            <label className={`${labelCls} mt-4`} htmlFor="email">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            <label className={`${labelCls} mt-4`} htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className={inputCls} />
            {error && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700" role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className={`${btnPrimary} mt-5 w-full`}>
              {busy ? "Creating account…" : <>Create Account <ArrowRight size={17} /></>}
            </button>
            <p className="mt-4 text-center text-sm text-muted">
              Already have an account? <Link href="/sign-in" className="font-bold text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
      <aside className="hidden flex-col justify-between bg-ink p-10 text-white lg:flex" aria-hidden="true">
        <div />
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[13px] font-bold ring-1 ring-inset ring-white/20">
            <Sparkles size={14} /> Capture → Prioritize → Plan → Review
          </p>
          <p className="mt-4 text-3xl font-extrabold leading-tight tracking-tight">
            Your day doesn&apos;t have to feel overwhelming.
          </p>
          <p className="mt-3 max-w-md leading-relaxed text-slate-300">
            DAYLY helps you know what matters and take action — every single day.
          </p>
        </div>
        <p className="text-sm text-slate-400">DAYLY · Make Today Count</p>
      </aside>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) throw new Error(error.message || "Sign in failed");
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-extrabold tracking-tight">DAYLY</h1>
      <p className="mt-1 font-semibold text-muted">Welcome back — sign in to make today count.</p>
      <form onSubmit={onSubmit} className="mt-6 rounded-xl border bg-white p-6">
        <label className="block text-sm font-bold" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-3"
        />
        <label className="mt-4 block text-sm font-bold" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border-2 border-slate-300 px-3 py-3"
        />
        {error && <p className="mt-3 text-sm font-bold text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-bold text-white hover:bg-primaryHover disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-sm text-muted">
          New to DAYLY? <Link href="/sign-up" className="font-bold text-primary">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

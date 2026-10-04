import Link from "next/link";
import { headers } from "next/headers";
import { auth, isAuthConfigured } from "@/lib/auth";
import Dashboard, { StaticPreview } from "./dashboard";

export default async function Home() {
  if (!isAuthConfigured()) {
    return (
      <StaticPreview
        setupBanner={
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <p className="font-bold">Local setup mode — DAYLY is running locally. Database and authentication are not configured yet.</p>
            <p className="mt-1 text-sm text-muted">
              Showing a static preview. To go live: copy <code>.env.example</code> to{" "}
              <code>.env</code>, add your database and authentication values, and restart. API routes will return{" "}
              <code>503 AUTH_NOT_CONFIGURED</code> / <code>503 DB_NOT_CONFIGURED</code> until then.
            </p>
          </div>
        }
      />
    );
  }

  const session = await auth!.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10">
        <header className="rounded-xl border bg-white p-6">
          <h1 className="text-3xl font-extrabold tracking-tight">DAYLY</h1>
          <p className="mt-1 font-semibold text-muted">
            Make Today Count — your AI-powered everyday life companion.
          </p>
          <p className="mt-2 text-sm font-bold uppercase tracking-wide text-primary">
            Capture → Understand → Prioritize → Plan → Remind → Adapt → Review
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg bg-primary px-5 py-3 font-bold text-white hover:bg-primaryHover"
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-lg border-2 border-primary px-5 py-3 font-bold">
              Sign up
            </Link>
          </div>
        </header>
      </main>
    );
  }

  return <Dashboard email={session.user.email} displayName={session.user.name ?? undefined} />;
}

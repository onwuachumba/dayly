import Link from "next/link";

export const metadata = {
  title: "Offline — DAYLY",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-primary">Offline</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">You&apos;re offline.</h1>
      <p className="mt-3 leading-relaxed text-muted">
        DAYLY needs a connection to load your tasks and account. Anything shown from cache may be
        out of date — reconnect to see your current data.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-3 text-[15px] font-bold text-white transition hover:bg-primaryHover"
      >
        Try again
      </Link>
    </main>
  );
}

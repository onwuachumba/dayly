// Server-safe helper (no "use client"): greeting() is called during
// Server Component rendering, so it must not live in a client module.
export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

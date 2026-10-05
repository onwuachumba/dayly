import { Bell, Moon, User } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

const SECTIONS = [
  {
    icon: User,
    title: "Account",
    body: "Name, email, and password management live here.",
    coming: true,
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Choose which reminders and check-ins may reach you, and when quiet hours apply.",
    coming: true,
  },
  {
    icon: Moon,
    title: "Appearance",
    body: "Light, dark, and system themes for focused work at any hour.",
    coming: true,
  },
];

export default function SettingsPage() {
  return (
    <main>
      <PageHeader title="Settings" sub="Tune DAYLY to the way you work." />
      <div className="grid gap-4 md:grid-cols-3">
        {SECTIONS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="opacity-95">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                <Icon size={20} />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                Coming soon
              </span>
            </div>
            <p className="mt-3 font-extrabold">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
            <button
              disabled
              aria-disabled="true"
              title="Not available yet"
              className="mt-4 w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-400"
            >
              Unavailable
            </button>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        Settings controls are intentionally disabled until each preference is backed by real functionality —
        nothing here pretends to work.
      </p>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Moon, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, ErrorState, LoadingState, PageHeader } from "@/components/ui";
import { inputCls, labelCls } from "@/components/ui";

type Prefs = {
  name: string | null;
  workStart: string | null;
  workEnd: string | null;
  notifyDaily: boolean;
  quietStart: string | null;
  quietEnd: string | null;
};

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await api.meFull();
      setPrefs(user);
      setName(user.name || "");
      setWorkStart(user.workStart || "");
      setWorkEnd(user.workEnd || "");
      setNotifyDaily(user.notifyDaily);
      setQuietStart(user.quietStart || "");
      setQuietEnd(user.quietEnd || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function savePrefs(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    try {
      const { user } = await api.mePatch({
        ...(name.trim() ? { name: name.trim() } : {}),
        workStart: workStart || null,
        workEnd: workEnd || null,
        notifyDaily,
        quietStart: quietStart || null,
        quietEnd: quietEnd || null,
      });
      setPrefs(user);
      setSaved("Preferences saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    try {
      const { error } = await authClient.changePassword({ currentPassword, newPassword });
      if (error) throw new Error(error.message || "Password change failed");
      setCurrentPassword("");
      setNewPassword("");
      setPwMsg("Password updated. Other sessions were signed out for your security.");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    }
  }

  return (
    <main>
      <PageHeader title="Settings" sub="Tune DAYLY to the way you work." />
      {loading ? (
        <LoadingState />
      ) : error && !prefs ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-primary">
                <User size={20} />
              </span>
              <div>
                <p className="font-extrabold">Account</p>
                <p className="text-sm text-muted">Your name and working hours.</p>
              </div>
            </div>
            <form onSubmit={savePrefs} className="mt-4 space-y-3">
              <div>
                <label className={labelCls} htmlFor="set-name">Display name</label>
                <input id="set-name" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" className={inputCls} maxLength={120} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls} htmlFor="set-start">Day starts</label>
                  <input id="set-start" type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="set-end">Day ends</label>
                  <input id="set-end" type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} className={inputCls} />
                </div>
              </div>
              {error && <p className="text-sm font-semibold text-red-700" role="alert">{error}</p>}
              {saved && <p className="text-sm font-semibold text-emerald-700" role="status">{saved}</p>}
              <button type="submit" className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primaryHover">
                Save account settings
              </button>
            </form>
            <form onSubmit={changePassword} className="mt-6 border-t border-stone-200/80 pt-4">
              <p className="font-extrabold">Change password</p>
              <div className="mt-3 space-y-3">
                <div>
                  <label className={labelCls} htmlFor="set-cpw">Current password</label>
                  <input id="set-cpw" type="password" required autoComplete="current-password"
                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls} htmlFor="set-npw">New password (min 8 characters)</label>
                  <input id="set-npw" type="password" required minLength={8} autoComplete="new-password"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
                </div>
              </div>
              {pwError && <p className="mt-2 text-sm font-semibold text-red-700" role="alert">{pwError}</p>}
              {pwMsg && <p className="mt-2 text-sm font-semibold text-emerald-700" role="status">{pwMsg}</p>}
              <button type="submit" className="mt-3 w-full rounded-xl border-2 border-primary/25 px-4 py-2.5 text-sm font-bold transition hover:border-primary/50">
                Update password
              </button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-primary">
                  <Bell size={20} />
                </span>
                <div>
                  <p className="font-extrabold">Notifications</p>
                  <p className="text-sm text-muted">Daily summary and quiet hours.</p>
                </div>
              </div>
              <form onSubmit={savePrefs} className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-cream px-3.5 py-3">
                  <span className="text-sm font-bold">Daily summary reminder</span>
                  <input type="checkbox" checked={notifyDaily} onChange={(e) => setNotifyDaily(e.target.checked)}
                    className="h-5 w-5 accent-primary" aria-label="Daily summary reminder" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls} htmlFor="set-qs">Quiet from</label>
                    <input id="set-qs" type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="set-qe">Quiet until</label>
                    <input id="set-qe" type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <button type="submit" className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primaryHover">
                  Save notification settings
                </button>
              </form>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Push notifications arrive with the store release. Until then, your timeline
                reminders and daily summary preference are saved to your account.
              </p>
            </Card>

            <Card className="opacity-95">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pine-50 text-primary">
                  <Moon size={20} />
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                  Coming soon
                </span>
              </div>
              <p className="mt-3 font-extrabold">Appearance</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Light, dark, and system themes for focused work at any hour.
              </p>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}

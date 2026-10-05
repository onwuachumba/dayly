"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => {
        void authClient.signOut().finally(() => window.location.assign("/"));
      }}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2.5 text-[15px] font-bold text-red-700 transition hover:bg-red-50"
    >
      <LogOut size={17} /> Sign Out
    </button>
  );
}

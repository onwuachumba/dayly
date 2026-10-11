"use client";

import { useEffect } from "react";

// Registers /sw.js once. Fails silently when unsupported or when the file
// is missing (e.g. local setups without a built service worker).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    });
  }, []);
  return null;
}

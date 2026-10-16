"use client";

import { useEffect } from "react";

// Registers /sw.js once. Handles the case where the window `load` event
// already fired before hydration (fast loads), otherwise the worker would
// silently never register. Fails silently when unsupported or missing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
  }, []);
  return null;
}

import { registerSW } from "virtual:pwa-register";

export function startPwa(opts: {
  onOfflineReady: () => void;
  onUpdated: () => void;
}): void {
  if (!("serviceWorker" in navigator)) return;
  registerSW({
    immediate: true,
    onOfflineReady: opts.onOfflineReady,
    onNeedRefresh: opts.onUpdated,
    onRegisteredSW(_url, registration) {
      const check = (): void => {
        if (navigator.onLine) void registration?.update();
      };
      window.addEventListener("online", check);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.setInterval(check, 30 * 60 * 1000);
    },
  });
}

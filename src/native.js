// Everything that is true only when Freely runs as a real app (iOS/Android through Capacitor).
// In a browser every function here quietly does nothing, so the web build is unaffected.
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform?.() === true;
export const nativePlatform = isNative ? Capacitor.getPlatform() : "web";

// The widget on the home screen reads this key out of the shared App Group container. Keep the shape
// small and already formatted — a widget cannot run the app's code to work out what "Tomorrow" means.
export const WIDGET_KEY = "fs_widget_upcoming";

let lastWidgetJson = null;
export async function saveWidgetSnapshot(items) {
  if (!isNative) return;
  const json = JSON.stringify((items || []).slice(0, 6));
  if (json === lastWidgetJson) return;          // nothing changed → don't wake the widget
  lastWidgetJson = json;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: WIDGET_KEY, value: json });
    // …and ask iOS to redraw the widget now rather than at its next half-hourly turn. Only works once
    // WidgetReloadPlugin.swift has been added to the app in Xcode; without it the widget still updates,
    // just a little later.
    try { await Capacitor.registerPlugin("WidgetReload").reload(); } catch {}
  } catch (e) { console.warn("[Freely] could not hand the widget its data", e); }
}

// Sign-in that leaves the app (Google, a password-reset link) comes back as a link into the app.
// Hand the code to Supabase so the session lands in the app rather than in a browser tab.
async function handleAuthLink(url, supabase) {
  try {
    const u = new URL(url);
    const code = u.searchParams.get("code");
    if (code) { await supabase.auth.exchangeCodeForSession(code); return true; }
    const hash = new URLSearchParams((u.hash || "").replace(/^#/, ""));
    const access_token = hash.get("access_token"), refresh_token = hash.get("refresh_token");
    if (access_token && refresh_token) { await supabase.auth.setSession({ access_token, refresh_token }); return true; }
  } catch (e) { console.warn("[Freely] sign-in link could not be read", e); }
  return false;
}

// Called once at startup. Safe to call in a browser.
export async function initNative(supabase) {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {}
  try {
    const { App } = await import("@capacitor/app");
    // The phone's back button: step back through the app, and only leave when there's nowhere left.
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack || window.history.length > 1) window.history.back();
      else App.exitApp();
    });
    App.addListener("appUrlOpen", ({ url }) => { if (url) handleAuthLink(url, supabase); });
    const launch = await App.getLaunchUrl();
    if (launch?.url) handleAuthLink(launch.url, supabase);
  } catch (e) { console.warn("[Freely] native start-up", e); }
}

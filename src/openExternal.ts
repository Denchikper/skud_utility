// Opens a URL in the user's default browser. Inside the Tauri window we use the
// opener plugin (a plain <a> would navigate the app webview); in a plain
// browser preview we fall back to window.open.

const inTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function openExternal(url: string): Promise<void> {
  if (!inTauri) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}

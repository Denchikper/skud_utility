import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "./types";

// Thin, typed wrapper over the Rust commands defined in src-tauri/src/commands.rs.
//
// When the frontend runs in a plain browser (`npm run dev`) there is no Rust
// backend, so `invoke` would throw. In that case we fall back to
// localStorage-backed mock data so the design can be explored without building
// the app. Inside the Tauri window the real commands are used.

const inTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

const MOCK_KEY = "kordon.preview.settings";

const mockDefaults: Settings = {
  gpFolder: "GP",
  programPath: "C:\\Program Files\\MDO\\ParsecNET 3\\MDO.Parsec.Win.exe",
  destFilePath: "C:\\ProgramData\\MDO\\ParsecNET 3\\parsec.ini",
  theme: "light",
  profiles: ["1", "5", "6", "7", "9", "10"].map((n) => ({
    id: `gp${n}`,
    label: `ГП${n}`,
    folder: `GP${n}`,
  })),
};

function mockLoad(): Settings {
  const raw = localStorage.getItem(MOCK_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Settings;
    } catch {
      // ignore corrupt preview data and fall back to defaults
    }
  }
  return mockDefaults;
}

export function loadSettings(): Promise<Settings> {
  if (!inTauri) return Promise.resolve(mockLoad());
  return invoke<Settings>("load_settings");
}

export function saveSettings(settings: Settings): Promise<void> {
  if (!inTauri) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(settings));
    return Promise.resolve();
  }
  return invoke("save_settings", { settings });
}

/** Copies <gpFolder>/<folder>/parsec.ini into destFilePath. Returns the applied path. */
export function applyProfile(folder: string): Promise<string> {
  if (!inTauri) return Promise.resolve(`(предпросмотр) выбран ${folder}`);
  return invoke<string>("apply_profile", { folder });
}

/** Launches the configured ParsecNET program without blocking. */
export function runProgram(): Promise<void> {
  if (!inTauri) {
    console.info("[предпросмотр] Пуск");
    return Promise.resolve();
  }
  return invoke("run_program");
}

/** Removes the applied config file and quits the app. */
export function closeAndCleanup(): Promise<void> {
  if (!inTauri) {
    console.info("[предпросмотр] Закрыть");
    return Promise.resolve();
  }
  return invoke("close_and_cleanup");
}

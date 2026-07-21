import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "./types";

// Thin, typed wrapper over the Rust commands defined in src-tauri/src/commands.rs.

export function loadSettings(): Promise<Settings> {
  return invoke<Settings>("load_settings");
}

export function saveSettings(settings: Settings): Promise<void> {
  return invoke("save_settings", { settings });
}

/** Copies <gpFolder>/<folder>/parsec.ini into destFilePath. Returns the applied path. */
export function applyProfile(folder: string): Promise<string> {
  return invoke<string>("apply_profile", { folder });
}

/** Launches the configured ParsecNET program without blocking. */
export function runProgram(): Promise<void> {
  return invoke("run_program");
}

/** Removes the applied config file and quits the app. */
export function closeAndCleanup(): Promise<void> {
  return invoke("close_and_cleanup");
}

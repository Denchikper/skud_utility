import { useCallback, useEffect, useState } from "react";
import type { Settings, Theme, View } from "./types";
import * as api from "./api";
import { MainView } from "./components/MainView";
import { SettingsView } from "./components/SettingsView";

export type Status =
  | { kind: "idle" }
  | { kind: "info" | "success" | "running"; text: string }
  | { kind: "error"; text: string };

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolved =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  root.setAttribute("data-theme", resolved);
}

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [view, setView] = useState<View>("main");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load settings once on startup.
  useEffect(() => {
    api
      .loadSettings()
      .then(setSettings)
      .catch((e) => setLoadError(String(e)));
  }, []);

  // Keep the document theme in sync, including live OS changes for "system".
  useEffect(() => {
    if (!settings) return;
    applyTheme(settings.theme);
    if (settings.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings?.theme]);

  const handleSelect = useCallback(
    async (id: string, folder: string, label: string) => {
      setSelectedId(id);
      setStatus({ kind: "info", text: `Применяю профиль ${label}…` });
      try {
        await api.applyProfile(folder);
        setStatus({ kind: "success", text: `Профиль ${label} применён` });
      } catch (e) {
        setSelectedId(null);
        setStatus({ kind: "error", text: `Не удалось применить ${label}: ${e}` });
      }
    },
    []
  );

  const handleRun = useCallback(async () => {
    setStatus({ kind: "running", text: "Запускаю ParsecNET…" });
    try {
      await api.runProgram();
      setStatus({ kind: "running", text: "ParsecNET запущен" });
    } catch (e) {
      setStatus({ kind: "error", text: `Ошибка запуска: ${e}` });
    }
  }, []);

  const handleClose = useCallback(async () => {
    try {
      await api.closeAndCleanup();
    } catch (e) {
      setStatus({ kind: "error", text: `Ошибка при закрытии: ${e}` });
    }
  }, []);

  const handleSaveSettings = useCallback(async (next: Settings) => {
    await api.saveSettings(next);
    setSettings(next);
    // Applied selection may reference a removed profile — reset it.
    setSelectedId((cur) =>
      cur && next.profiles.some((p) => p.id === cur) ? cur : null
    );
    setView("main");
    setStatus({ kind: "success", text: "Настройки сохранены" });
  }, []);

  if (loadError) {
    return (
      <div className="app app--error">
        <p className="fatal">Не удалось загрузить настройки:</p>
        <pre className="fatal-detail">{loadError}</pre>
      </div>
    );
  }

  if (!settings) {
    return <div className="app app--loading">Загрузка…</div>;
  }

  return view === "main" ? (
    <MainView
      settings={settings}
      selectedId={selectedId}
      status={status}
      onSelect={handleSelect}
      onRun={handleRun}
      onClose={handleClose}
      onOpenSettings={() => setView("settings")}
    />
  ) : (
    <SettingsView
      settings={settings}
      onSave={handleSaveSettings}
      onCancel={() => setView("main")}
    />
  );
}

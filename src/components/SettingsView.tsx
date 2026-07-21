import { useState } from "react";
import type { Profile, Settings, Theme } from "../types";
import { SettingsRow } from "./SettingsRow";
import { SegmentedControl } from "./SegmentedControl";
import { BackIcon, PlusIcon, TrashIcon } from "./Icon";

type Props = {
  settings: Settings;
  onSave: (next: Settings) => Promise<void>;
  onCancel: () => void;
};

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
  { value: "system", label: "Системная" },
];

function newId() {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function SettingsView({ settings, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Settings>(() => ({
    ...settings,
    profiles: settings.profiles.map((p) => ({ ...p })),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Settings>) => setDraft((d) => ({ ...d, ...p }));

  const updateProfile = (id: string, field: keyof Profile, value: string) =>
    setDraft((d) => ({
      ...d,
      profiles: d.profiles.map((pr) =>
        pr.id === id ? { ...pr, [field]: value } : pr
      ),
    }));

  const addProfile = () =>
    setDraft((d) => ({
      ...d,
      profiles: [...d.profiles, { id: newId(), label: "", folder: "" }],
    }));

  const removeProfile = (id: string) =>
    setDraft((d) => ({
      ...d,
      profiles: d.profiles.filter((pr) => pr.id !== id),
    }));

  const save = async () => {
    const cleaned: Settings = {
      ...draft,
      gpFolder: draft.gpFolder.trim(),
      programPath: draft.programPath.trim(),
      destFilePath: draft.destFilePath.trim(),
      profiles: draft.profiles
        .map((p) => ({ ...p, label: p.label.trim(), folder: p.folder.trim() }))
        .filter((p) => p.label !== "" && p.folder !== ""),
    };
    setSaving(true);
    setError(null);
    try {
      await onSave(cleaned);
    } catch (e) {
      setError(String(e));
      setSaving(false);
    }
  };

  return (
    <div className="app app--settings">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={onCancel}
          aria-label="Назад"
          title="Назад"
        >
          <BackIcon />
        </button>
        <div className="topbar__title">
          <h1>Настройки</h1>
        </div>
        <span className="icon-btn icon-btn--ghost" aria-hidden />
      </header>

      <main className="content content--scroll">
        <section className="settings-section">
          <div className="settings-section__head">
            <h2>Профили (группы приборов)</h2>
            <button type="button" className="text-btn" onClick={addProfile}>
              <PlusIcon size={16} />
              Добавить
            </button>
          </div>
          <div className="profile-editor">
            <div className="profile-editor__header">
              <span>Название</span>
              <span>Папка в GP</span>
              <span />
            </div>
            {draft.profiles.length === 0 && (
              <p className="profile-editor__empty">Нет профилей. Добавьте первый.</p>
            )}
            {draft.profiles.map((p) => (
              <div className="profile-editor__row" key={p.id}>
                <input
                  className="input"
                  value={p.label}
                  placeholder="ГП1"
                  onChange={(e) => updateProfile(p.id, "label", e.target.value)}
                />
                <input
                  className="input"
                  value={p.folder}
                  placeholder="GP1"
                  onChange={(e) => updateProfile(p.id, "folder", e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => removeProfile(p.id)}
                  aria-label={`Удалить ${p.label || "профиль"}`}
                  title="Удалить"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2>Пути</h2>
          <SettingsRow
            label="Программа ParsecNET"
            hint="Полный путь к MDO.Parsec.Win.exe"
            htmlFor="programPath"
          >
            <input
              id="programPath"
              className="input"
              value={draft.programPath}
              onChange={(e) => patch({ programPath: e.target.value })}
            />
          </SettingsRow>
          <SettingsRow
            label="Целевой parsec.ini"
            hint="Куда копируется конфиг выбранного профиля"
            htmlFor="destFilePath"
          >
            <input
              id="destFilePath"
              className="input"
              value={draft.destFilePath}
              onChange={(e) => patch({ destFilePath: e.target.value })}
            />
          </SettingsRow>
          <SettingsRow
            label="Папка профилей GP"
            hint="Содержит подпапки профилей с parsec.ini"
            htmlFor="gpFolder"
          >
            <input
              id="gpFolder"
              className="input"
              value={draft.gpFolder}
              onChange={(e) => patch({ gpFolder: e.target.value })}
            />
          </SettingsRow>
        </section>

        <section className="settings-section">
          <h2>Оформление</h2>
          <SettingsRow label="Тема">
            <SegmentedControl
              ariaLabel="Тема оформления"
              value={draft.theme}
              options={THEME_OPTIONS}
              onChange={(theme) => patch({ theme })}
            />
          </SettingsRow>
        </section>

        {error && <p className="settings-error">{error}</p>}
      </main>

      <footer className="actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Отмена
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </footer>
    </div>
  );
}

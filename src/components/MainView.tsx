import type { Settings } from "../types";
import type { Status } from "../App";
import { ProfileGrid } from "./ProfileGrid";
import { StatusBar } from "./StatusBar";
import { GearIcon, PowerIcon } from "./Icon";

type Props = {
  settings: Settings;
  selectedId: string | null;
  status: Status;
  onSelect: (id: string, folder: string, label: string) => void;
  onRun: () => void;
  onClose: () => void;
  onOpenSettings: () => void;
};

export function MainView({
  settings,
  selectedId,
  status,
  onSelect,
  onRun,
  onClose,
  onOpenSettings,
}: Props) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">
          <span className="topbar__mark" aria-hidden>СКУД</span>
          <h1>Утилита СКУД</h1>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Настройки"
          title="Настройки"
        >
          <GearIcon />
        </button>
      </header>

      <main className="content">
        <p className="section-label">Группа приборов</p>
        <ProfileGrid
          profiles={settings.profiles}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </main>

      <StatusBar status={status} />

      <footer className="actions">
        <button type="button" className="btn btn--danger" onClick={onClose}>
          Закрыть
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onRun}
        >
          <PowerIcon size={18} />
          Пуск
        </button>
      </footer>
    </div>
  );
}

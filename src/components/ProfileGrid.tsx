import type { Profile } from "../types";
import { ProfileCard } from "./ProfileCard";

type Props = {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string, folder: string, label: string) => void;
};

export function ProfileGrid({ profiles, selectedId, onSelect }: Props) {
  if (profiles.length === 0) {
    return (
      <div className="profile-grid__empty">
        Профили не заданы. Откройте настройки и добавьте группы приборов.
      </div>
    );
  }
  return (
    <div className="profile-grid">
      {profiles.map((p) => (
        <ProfileCard
          key={p.id}
          profile={p}
          selected={p.id === selectedId}
          onClick={() => onSelect(p.id, p.folder, p.label)}
        />
      ))}
    </div>
  );
}

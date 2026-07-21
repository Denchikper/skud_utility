import type { Profile } from "../types";
import { CheckIcon } from "./Icon";

type Props = {
  profile: Profile;
  selected: boolean;
  onClick: () => void;
};

export function ProfileCard({ profile, selected, onClick }: Props) {
  return (
    <button
      type="button"
      className={`profile-card${selected ? " profile-card--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="profile-card__label">{profile.label}</span>
      <span className="profile-card__check" aria-hidden={!selected}>
        <CheckIcon size={16} />
      </span>
    </button>
  );
}

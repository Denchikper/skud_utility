import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
};

export function SettingsRow({ label, hint, htmlFor, children }: Props) {
  return (
    <div className="settings-row">
      <label className="settings-row__label" htmlFor={htmlFor}>
        {label}
        {hint && <span className="settings-row__hint">{hint}</span>}
      </label>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

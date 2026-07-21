import type { Status } from "../App";

const dotClass: Record<Status["kind"], string> = {
  idle: "status__dot--idle",
  info: "status__dot--info",
  success: "status__dot--success",
  running: "status__dot--running",
  error: "status__dot--error",
};

export function StatusBar({ status }: { status: Status }) {
  const text = status.kind === "idle" ? "Готово к работе" : status.text;
  return (
    <div className={`status status--${status.kind}`} role="status" aria-live="polite">
      <span className={`status__dot ${dotClass[status.kind]}`} />
      <span className="status__text">{text}</span>
    </div>
  );
}

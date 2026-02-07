import { getStage, getNextStage, getStageProgress } from "../lib/dragon";

export default function XpBar({ xp }) {
  const stage = getStage(xp);
  const next = getNextStage(xp);
  const progress = getStageProgress(xp);
  const pct = Math.round(progress * 100);

  return (
    <div className="xp-bar-wrapper">
      <div className="xp-bar-header">
        <span>{stage.label}</span>
        <span>
          {next ? `${xp} / ${next.minXp} XP` : `${xp} XP (MAX)`}
        </span>
      </div>
      <div className="xp-bar-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {next && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
          {next.minXp - xp} XP until {next.label}
        </div>
      )}
    </div>
  );
}

import { getStage, getDragonPlaceholderText } from "../lib/dragon";
import XpBar from "./XpBar.jsx";

export default function DragonPanel({ profile }) {
  const xp = profile?.xp ?? 0;
  const eggChoice = profile?.eggChoice ?? "red";
  const stage = getStage(xp);
  return (
    <div className="dragon-panel card">
      <div className="dragon-stage-label">{stage.label}</div>

      {/* Placeholder display — swap with <img> when sprites are ready */}
      <div className="dragon-display" data-egg={eggChoice}>
        {getDragonPlaceholderText(eggChoice, stage)}
      </div>

      <XpBar xp={xp} />
    </div>
  );
}

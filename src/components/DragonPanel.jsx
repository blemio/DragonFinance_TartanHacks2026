import { getStage } from "../lib/dragon";
import { getDragonSprite } from "../lib/dragonSprites";

import XpBar from "./XpBar.jsx";

export default function DragonPanel({ profile }) {
  const xp = profile?.xp ?? 0;
  const eggChoice = profile?.eggChoice ?? "red";

  const EGG_ID_TO_TYPE = {
  red: "archer",
  blue: "knight",
  green: "wizard",
  archer: "archer",
  knight: "knight",
  wizard: "wizard",
};

    const type = EGG_ID_TO_TYPE[eggChoice] ?? eggChoice;

  const stage = getStage(xp);

  // mood rule:
  // - only baby dragons can be sad (no sad egg pngs)
  // - sad if the most recent spending verdict is BAD
  const lastVerdict =
    profile?.spendings?.[profile.spendings.length - 1]?.verdict;

  const mood = stage.name === "baby" && lastVerdict === "BAD" ? "sad" : "happy";

  const img = getDragonSprite(type, xp, mood);

  return (
    <div className="dragon-panel card">
      <div className="dragon-stage-label">{stage.label}</div>

      {/* Placeholder display — swap with <img> when sprites are ready */}
     <div className="dragon-display" data-egg={eggChoice}>
  <img src={img} alt={`${type} dragon`} className="w-full h-full object-contain" />
</div>


      <XpBar xp={xp} />
    </div>
  );
}

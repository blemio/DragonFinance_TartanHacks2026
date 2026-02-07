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
  const img = getDragonSprite(type, xp, "happy");



  const stage = getStage(xp);
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

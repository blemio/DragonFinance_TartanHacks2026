import { Flame } from "lucide-react";
import { getStreakBonus, getStreakTierLabel } from "../lib/xp";

/**
 * Duolingo-style streak counter widget.
 * Shows a flame icon, the streak count, tier label, and daily XP bonus.
 */
export default function StreakCounter({ streak }) {
  const days = streak?.current ?? 0;
  const bonus = getStreakBonus(days);
  const tier = getStreakTierLabel(days);

  /* Flame intensity based on tier -- drives colour via CSS data-attr */
  const intensity =
    days >= 30 ? "max" :
    days >= 14 ? "high" :
    days >= 7  ? "mid" :
    days >= 1  ? "low" :
    "none";

  return (
    <div className="streak-counter" data-intensity={intensity}>
      <div className="streak-flame" aria-hidden="true">
        <Flame size={24} />
      </div>

      <div className="streak-info">
        <span className="streak-days">{days}</span>
        <span className="streak-label">
          {days === 0 ? "No streak" : `${tier}`}
        </span>
      </div>

      {days > 0 && (
        <div className="streak-xp-pill">+{bonus} XP/day</div>
      )}
    </div>
  );
}

import { Wallet, TrendingDown, Zap, Target } from "lucide-react";
import { getCurrentBudget, getTodaySpending, todayKey } from "../lib/budget";
import { getStreakBonus } from "../lib/xp";
import { getStage } from "../lib/dragon";

export default function StatTiles({ profile }) {
  const budget = getCurrentBudget(profile.budgetHistory);
  const todaySpent = getTodaySpending(profile.spendings);
  const remaining = budget !== null ? budget - todaySpent : null;
  const streak = profile.streak?.current ?? 0;
  const streakXp = getStreakBonus(streak);
  const stage = getStage(profile.xp);

  // Count today's XP changes from spendings
  const todaySpendings = profile.spendings.filter((s) => s.date === todayKey());
  const todayGood = todaySpendings.filter((s) => s.verdict === "GOOD" || s.necessary === true).length;
  const todayBad = todaySpendings.filter((s) => s.verdict === "BAD" || (s.necessary === false && !s.verdict)).length;

  return (
    <div className="stat-tiles">
      <div className="stat-tile stat-tile-accent">
        <div className="stat-tile-icon">
          <Wallet size={18} />
        </div>
        <div className="stat-tile-content">
          <span className="stat-tile-value">
            ${todaySpent.toFixed(2)}
          </span>
          <span className="stat-tile-label">Spent Today</span>
        </div>
      </div>

      <div className={`stat-tile ${remaining !== null && remaining < 0 ? "stat-tile-red" : "stat-tile-green"}`}>
        <div className="stat-tile-icon">
          <TrendingDown size={18} />
        </div>
        <div className="stat-tile-content">
          <span className="stat-tile-value">
            {remaining !== null ? `$${remaining.toFixed(2)}` : "--"}
          </span>
          <span className="stat-tile-label">Remaining</span>
        </div>
      </div>

      <div className="stat-tile stat-tile-blue">
        <div className="stat-tile-icon">
          <Zap size={18} />
        </div>
        <div className="stat-tile-content">
          <span className="stat-tile-value">{profile.xp}</span>
          <span className="stat-tile-label">{stage.label}</span>
        </div>
      </div>

      <div className="stat-tile stat-tile-purple">
        <div className="stat-tile-icon">
          <Target size={18} />
        </div>
        <div className="stat-tile-content">
          <span className="stat-tile-value">{todayGood}G / {todayBad}B</span>
          <span className="stat-tile-label">Today Verdicts</span>
        </div>
      </div>
    </div>
  );
}

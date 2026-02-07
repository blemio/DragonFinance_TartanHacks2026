/* ── XP Configuration ─────────────────────────── */
/* All values are easily tuneable from this single file. */

export const XP = {
  NECESSARY_PURCHASE:    5,   // good spending
  UNNECESSARY_PURCHASE: -15,  // impulse / not needed
  UNDER_BUDGET_BONUS:    20,  // daily budget respected
  OVER_BUDGET_PENALTY:  -25,  // daily budget exceeded
  STREAK_BONUS:          10,  // per consecutive day of logging
  SAVINGS_GOAL_BONUS:    50,  // one-time bonus when a savings goal is hit
  SAVINGS_DEPOSIT:        3,  // small reward for each deposit towards goal
};

/**
 * Escalating streak bonus tiers (Duolingo-style).
 * Each entry: [minDays, xpPerDay].
 * Checked top-to-bottom; first match wins.
 * Cap is 60 XP/day at 30+ days.
 */
export const STREAK_TIERS = [
  [30, 60],   // 30+ days  -> 60 XP
  [21, 50],   // 21-29     -> 50 XP
  [14, 40],   // 14-20     -> 40 XP
  [7,  25],   // 7-13      -> 25 XP
  [3,  15],   // 3-6       -> 15 XP
  [1,  10],   // 1-2       -> 10 XP (base)
];

/**
 * Returns the daily streak XP bonus for a given streak length.
 * Returns 0 if streak is 0.
 */
export function getStreakBonus(streakDays) {
  if (streakDays <= 0) return 0;
  for (const [minDays, bonus] of STREAK_TIERS) {
    if (streakDays >= minDays) return bonus;
  }
  return XP.STREAK_BONUS; // fallback
}

/**
 * Returns a label for the current streak tier.
 */
export function getStreakTierLabel(streakDays) {
  if (streakDays >= 30) return "Inferno";
  if (streakDays >= 21) return "Blazing";
  if (streakDays >= 14) return "On Fire";
  if (streakDays >= 7) return "Heated";
  if (streakDays >= 3) return "Warming Up";
  if (streakDays >= 1) return "Sparked";
  return "No Streak";
}

/** XP can never drop below this floor. */
export const XP_FLOOR = 0;

/**
 * Apply an XP delta, clamping at the floor.
 * Returns the new XP value.
 */
export function applyXp(currentXp, delta) {
  return Math.max(XP_FLOOR, currentXp + delta);
}

/**
 * Determine XP change for a spending entry.
 * `necessary` is a boolean – true = good, false = bad.
 *
 * NOTE: This is the simple version. When you add the AI agent later,
 * replace the `necessary` boolean with the AI classification result
 * and expand this function to handle more categories (e.g. "discretionary").
 */
export function xpForSpending(necessary) {
  return necessary ? XP.NECESSARY_PURCHASE : XP.UNNECESSARY_PURCHASE;
}

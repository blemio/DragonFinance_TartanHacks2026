/* ── Budget Configuration ─────────────────────── */

/**
 * Maximum number of times the user may change their daily budget per day.
 * Set to 1 so they must commit. Easily tuneable.
 */
export const MAX_BUDGET_CHANGES_PER_DAY = 1;

/**
 * Get today's date as a YYYY-MM-DD string (local time).
 */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Can the user change their budget right now?
 * `budgetHistory` is an array of { date, amount } entries.
 */
export function canChangeBudget(budgetHistory) {
  const today = todayKey();
  const changesToday = budgetHistory.filter((b) => b.date === today).length;
  return changesToday < MAX_BUDGET_CHANGES_PER_DAY;
}

/**
 * Get the current active budget (the most recent entry).
 * Returns the amount or null if never set.
 */
export function getCurrentBudget(budgetHistory) {
  if (!budgetHistory || budgetHistory.length === 0) return null;
  return budgetHistory[budgetHistory.length - 1].amount;
}

/**
 * Sum of spending amounts for today.
 */
export function getTodaySpending(spendings) {
  const today = todayKey();
  return spendings
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.amount, 0);
}

/**
 * Remaining budget for today. Can be negative if over-budget.
 */
export function getRemainingBudget(budgetHistory, spendings) {
  const budget = getCurrentBudget(budgetHistory);
  if (budget === null) return null;
  return budget - getTodaySpending(spendings);
}

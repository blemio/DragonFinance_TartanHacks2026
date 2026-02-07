const KEY = "dragonProfile";

/**
 * Default profile shape.
 * `eggChoice` is null until the user picks an egg.
 */
function defaultProfile() {
  return {
    eggChoice: null,
    xp: 0,
    budgetHistory: [],       // [{ date: "YYYY-MM-DD", amount: number }]
    spendings: [],           // [{ id, amount, merchant, category, necessary, date, timestamp }]
    streak: {
      current: 0,
      lastActiveDate: null,  // "YYYY-MM-DD"
    },
    savingsGoal: null,       // null | { target: number, saved: number, deposits: [{ amount, date, timestamp }], completed: bool, xpClaimed: bool }
    subscriptions: [],       // [{ id, name, amount, billingCycle: 'weekly'|'monthly'|'yearly', lastUsed: ISO|null, createdAt: ISO }]
    createdAt: new Date().toISOString(),
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields are always present
    return { ...defaultProfile(), ...parsed };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(KEY);
}

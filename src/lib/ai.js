/* ── AI Evaluation Engine ─────────────────────── */
/* Heuristic-based spending evaluation with a clear hook for future AI API. */

/**
 * Spending categories mapped to their "essential" weight.
 * Higher = more likely to be a reasonable purchase.
 * Scale: 0 (pure luxury) to 1 (essential).
 */
const CATEGORY_WEIGHTS = {
  "Bills & Utilities": 0.95,
  "Health":            0.9,
  "Food & Groceries":  0.8,
  "Education":         0.85,
  "Transport":         0.7,
  "Other":             0.4,
  "Shopping":          0.25,
  "Entertainment":     0.2,
};

/**
 * Evaluate a purchase using heuristics.
 *
 * @param {object} entry - { amount, merchant, category, necessary }
 * @param {object} context - { dailyBudget, todaySpent, streak }
 * @returns {{ verdict: "GOOD"|"OKAY"|"BAD", explanation: string, suggestion: string }}
 */
export function evaluatePurchase(entry, context) {
  const { amount, category, necessary } = entry;
  const { dailyBudget, todaySpent } = context;

  const weight = CATEGORY_WEIGHTS[category] ?? 0.4;
  const budgetRatio = dailyBudget ? amount / dailyBudget : 0;
  const wouldExceed = dailyBudget ? (todaySpent + amount) > dailyBudget : false;

  // Score from 0 (bad) to 100 (great)
  let score = 50;

  // Necessity is the strongest signal
  if (necessary) {
    score += 30;
  } else {
    score -= 30;
  }

  // Category weight shifts score
  score += (weight - 0.5) * 20;

  // Budget impact
  if (wouldExceed) {
    score -= 20;
  } else if (dailyBudget && budgetRatio < 0.2) {
    score += 10; // small purchase relative to budget
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Map score to verdict
  if (score >= 60) {
    return {
      verdict: "GOOD",
      explanation: getGoodExplanation(category, necessary),
      suggestion: getGoodSuggestion(),
    };
  } else if (score >= 35) {
    return {
      verdict: "OKAY",
      explanation: getOkayExplanation(category, necessary, wouldExceed),
      suggestion: getOkaySuggestion(category),
    };
  } else {
    return {
      verdict: "BAD",
      explanation: getBadExplanation(category, necessary, wouldExceed),
      suggestion: getBadSuggestion(category),
    };
  }
}

/**
 * FUTURE: AI-powered evaluation.
 * Replace the body of this function with an API call when ready.
 * The function signature stays the same so nothing else needs to change.
 *
 * Example integration:
 *   const res = await fetch("/api/classify-spending", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ entry, context }),
 *   });
 *   return res.json(); // { verdict, explanation, suggestion }
 */
export async function evaluateWithAI(entry, context) {
  // For now, fall back to heuristic
  return evaluatePurchase(entry, context);
}

/* ── Explanation generators ─────────────────────── */

function getGoodExplanation(category, necessary) {
  if (necessary && (category === "Bills & Utilities" || category === "Health")) {
    return "This looks like an essential expense. Keeping up with obligations is responsible.";
  }
  if (necessary && category === "Food & Groceries") {
    return "Groceries are a daily essential. Good call on keeping yourself fueled.";
  }
  if (necessary) {
    return "This seems like a well-considered, necessary purchase.";
  }
  return "This purchase fits within your spending pattern. Keep it up.";
}

function getOkayExplanation(category, necessary, wouldExceed) {
  if (wouldExceed) {
    return "This one is pushing you close to your daily limit. Something to keep an eye on.";
  }
  if (!necessary) {
    return `${category} can be a nice treat. Just make sure it's intentional, not impulsive.`;
  }
  return "This is a reasonable expense, though there might be room to optimize.";
}

function getBadExplanation(category, necessary, wouldExceed) {
  if (wouldExceed && !necessary) {
    return "This pushes you over budget on something non-essential. Worth pausing on next time.";
  }
  if (!necessary) {
    return "This looks like an impulse purchase. Consider whether you'd buy it again tomorrow.";
  }
  return "This is a large expense that impacts your daily budget significantly.";
}

function getGoodSuggestion() {
  const suggestions = [
    "Your dragon is proud of you.",
    "Solid financial discipline.",
    "Keep this up and watch your dragon grow.",
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function getOkaySuggestion(category) {
  const suggestions = [
    "Try the 24-hour rule: wait a day before non-essential purchases.",
    `Could you find a more affordable ${category.toLowerCase()} alternative?`,
    "Consider setting aside a small \"fun budget\" so these feel guilt-free.",
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

function getBadSuggestion(category) {
  const suggestions = [
    "Next time, sleep on it. If you still want it tomorrow, reconsider then.",
    "Try tracking how often you spend on " + category.toLowerCase() + " this week.",
    "Your dragon felt that one. Make it up with a savings deposit.",
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

/**
 * Maps verdict to XP delta.
 * Centralised here so both the spending page and any future AI caller use the same values.
 */
export function xpForVerdict(verdict) {
  switch (verdict) {
    case "GOOD": return 5;
    case "OKAY": return -5;
    case "BAD":  return -15;
    default:     return 0;
  }
}

export async function evaluatePurchaseAPI(entry, context, justification = null) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      purchase: entry,
      context,
      justification,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "AI analyze failed");
  return data;
}


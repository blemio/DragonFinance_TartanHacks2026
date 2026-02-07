'use client';

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Camera, ImageIcon, X } from "lucide-react";
import { todayKey, getTodaySpending, getCurrentBudget } from "../lib/budget";
import { applyXp, XP } from "../lib/xp";
import { evaluatePurchaseAPI } from "../lib/ai";

const CATEGORIES = [
  "Food & Groceries",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills & Utilities",
  "Health",
  "Education",
  "Other",
];

const VERDICT_CONFIG = {
  GOOD: { className: "verdict-good", icon: CheckCircle, label: "Good decision" },
  OKAY: { className: "verdict-okay", icon: AlertTriangle, label: "Could be better" },
  BAD:  { className: "verdict-bad",  icon: XCircle, label: "Needs attention" },
};

export default function AddPurchase({ profile, persist }) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [necessary, setNecessary] = useState(null);

  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Justification modal
  const [justifyOpen, setJustifyOpen] = useState(false);
  const [justifyText, setJustifyText] = useState("");
  const [followupQuestion, setFollowupQuestion] = useState("");
  const [pendingEntry, setPendingEntry] = useState(null);
  const [pendingContext, setPendingContext] = useState(null);

  // Large purchase intervention modal
  const [interveneOpen, setInterveneOpen] = useState(false);
  const [interveneQuestion, setInterveneQuestion] = useState("");

  // Receipt capture
  const [receiptPreview, setReceiptPreview] = useState(null);
  const fileInputRef = useRef(null);

  const budget = getCurrentBudget(profile.budgetHistory);
  const todaySpent = getTodaySpending(profile.spendings);
  const remaining = budget !== null ? budget - todaySpent : null;

  const handleReceiptCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceiptPreview(ev.target.result);
      // FUTURE: parse receipt with AI vision and autofill fields.
    };
    reader.readAsDataURL(file);
  };

  const finalizePurchase = ({ entry, verdict, reason, xpDelta }) => {
    const num = entry.amount;

    const spending = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: num,
      merchant: entry.merchant,
      category: entry.category,
      necessary: entry.necessary,
      verdict,
      date: todayKey(),
      timestamp: new Date().toISOString(),
    };

    // Budget penalty logic stays the same
    const newTodayTotal = todaySpent + num;
    let budgetPenalty = 0;
    if (budget !== null && todaySpent <= budget && newTodayTotal > budget) {
      budgetPenalty = XP.OVER_BUDGET_PENALTY;
    }

    persist((p) => {
      const newXp = applyXp(applyXp(p.xp, xpDelta), budgetPenalty);
      return {
        ...p,
        xp: newXp,
        spendings: [...p.spendings, spending],
      };
    });

    setResult({
      xpDelta: xpDelta + budgetPenalty,
      verdict,
      explanation: reason,
      suggestion: "",
      budgetPenalty,
    });

    // Reset form
    setAmount("");
    setMerchant("");
    setCategory(CATEGORIES[0]);
    setNecessary(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setTimeout(() => setResult(null), 6000);
  };

  // Runs evaluation and routes to justification ONLY if necessary===true
  // Runs evaluation and routes to justification ONLY if necessary===true
// IMPORTANT: AI does NOT decide xpDelta here. Baseline XP is deterministic.
// AI is ONLY allowed to decide xpDelta in the justification (summoned) path.
const runEvaluation = async (entry, context) => {
  const first = await evaluatePurchaseAPI(entry, context, null);

  // Only ask for justification if user claimed it's necessary
  const shouldAskJustification = entry.necessary === true && first.needsJustification === true;

  if (shouldAskJustification) {
    setPendingEntry(entry);
    setPendingContext(context);
    setFollowupQuestion(first.followupQuestion || "Why was this purchase necessary?");
    setJustifyText("");
    setJustifyOpen(true);
    return;
  }

  // -------- Deterministic baseline XP (AI cannot change it here) --------
  let xpDelta = 0;
  let verdict = first.verdict;
  let reason = first.reason;

  // Always punish unnecessary
  if (entry.necessary === false) {
    xpDelta = XP.UNNECESSARY_PURCHASE; // -15
    verdict = "BAD";
    if (typeof reason !== "string" || reason.trim().length === 0) {
      reason = "You marked this purchase as not necessary.";
    }
  } else {
    // Reward consistent +15 for good/necessary/reasonable purchases
    const num = entry.amount;
    const b = context?.dailyBudget;
    const hasBudget = typeof b === "number" && b > 0;

    // "reasonable" (tweakable): <= 40% of daily budget AND does not push over budget
    // fallback if no budget: <= $80
    const reasonable =
      (hasBudget && num <= 0.4 * b && (context.todaySpent + num) <= b) ||
      (!hasBudget && num <= 80);

    if (reasonable) {
      xpDelta = 15;
      verdict = "GOOD";
      if (typeof reason !== "string" || reason.trim().length === 0) {
        reason = "Necessary and within a reasonable range for today.";
      }
    } else {
      // Not reasonable: no reward by default (still can show AI's verdict/reason)
      xpDelta = 0;
      if (verdict !== "BAD") verdict = "OKAY";
      if (typeof reason !== "string" || reason.trim().length === 0) {
        reason = "This seems large for today. Consider if it was truly needed.";
      }
    }
  }

  finalizePurchase({
    entry,
    verdict,
    reason,
    xpDelta,
  });
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (necessary === null) return;

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    const entry = {
      amount: num,
      merchant: merchant.trim() || "Unknown",
      category,
      necessary,
    };

    const context = {
      dailyBudget: budget,
      todaySpent,
      streak: profile.streak?.current ?? 0,
    };

    // Deterministic “noticeably too large” trigger:
    // - If budget exists: amount >= 50% of budget OR this purchase pushes over budget
    // - If no budget: amount >= $100
    const hasBudget = typeof budget === "number" && budget > 0;
    const largeByBudget = hasBudget && (num >= 0.5 * budget || (todaySpent + num) > budget);
    const largeByAbsolute = !hasBudget && num >= 100;
    const shouldIntervene = largeByBudget || largeByAbsolute;

    try {
      setSubmitting(true);

      // If it’s a large purchase, pause and ask FIRST (no XP applied yet).
      if (shouldIntervene) {
        setPendingEntry(entry);
        setPendingContext(context);

        const q = hasBudget
          ? `This is a big purchase ($${num.toFixed(2)} vs daily budget $${budget.toFixed(2)}). Was this a good decision?`
          : `This is a big purchase ($${num.toFixed(2)}). Was this a good decision?`;

        setInterveneQuestion(q);
        setInterveneOpen(true);
        return;
      }

      await runEvaluation(entry, context);
    } catch (err) {
      console.error(err);
      alert("AI evaluation failed. Check Vercel logs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-header">
        <h1>Log Spending</h1>
        <p>Record what you spent. We will evaluate how it fits your goals.</p>
      </div>

      {/* Receipt capture */}
      <div className="receipt-capture card" style={{ marginBottom: 20 }}>
        <div className="receipt-capture-row">
          <div className="receipt-capture-info">
            <Camera size={20} style={{ color: "var(--accent)" }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>
                Snap a receipt
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Photo capture -- AI parsing coming soon
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => fileInputRef.current?.click()}
            style={{ whiteSpace: "nowrap" }}
          >
            <ImageIcon size={16} /> Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleReceiptCapture}
            style={{ display: "none" }}
            aria-label="Capture receipt photo"
          />
        </div>
        {receiptPreview && (
          <div className="receipt-preview">
            <img src={receiptPreview || "/placeholder.svg"} alt="Receipt preview" />
            <button
              type="button"
              className="receipt-remove"
              onClick={() => { setReceiptPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              aria-label="Remove receipt"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Remaining budget indicator */}
      {remaining !== null && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="budget-status">
            <div className="budget-stat">
              <div className="budget-stat-label">Spent Today</div>
              <div className="budget-stat-value">${todaySpent.toFixed(2)}</div>
            </div>
            <div className="budget-stat">
              <div className="budget-stat-label">Remaining</div>
              <div className={`budget-stat-value ${remaining >= 0 ? "under" : "over"}`}>
                ${remaining.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verdict result panel */}
      {result && (() => {
        const vc = VERDICT_CONFIG[result.verdict];
        const Icon = vc.icon;
        return (
          <div className={`verdict-panel ${vc.className}`}>
            <div className="verdict-header">
              <Icon size={20} />
              <span className="verdict-label">{vc.label}</span>
              <span className="verdict-xp">
                {result.xpDelta >= 0 ? "+" : ""}{result.xpDelta} XP
              </span>
            </div>
            <p className="verdict-explanation">{result.explanation}</p>
            <p className="verdict-suggestion">{result.suggestion}</p>
            {result.budgetPenalty < 0 && (
              <p className="verdict-warning">You went over your daily budget ({result.budgetPenalty} XP penalty)</p>
            )}
          </div>
        );
      })()}

      <form
        className="card"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        <label>
          Amount ($)
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="12.34"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Merchant
          <input
            type="text"
            placeholder="e.g. Starbucks"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <fieldset style={{ border: "none", padding: 0 }}>
          <legend
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 10,
            }}
          >
            Was this a necessary purchase?
          </legend>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              className={`btn ${necessary === true ? "btn-primary" : ""}`}
              onClick={() => setNecessary(true)}
              style={{ flex: 1 }}
            >
              Yes, necessary
            </button>

            <button
              type="button"
              className={`btn ${necessary === false ? "btn-primary" : ""}`}
              onClick={() => setNecessary(false)}
              style={{ flex: 1 }}
            >
              No, not really
            </button>
          </div>
        </fieldset>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting || necessary === null || !amount || parseFloat(amount) <= 0}
        >
          Log Purchase
        </button>
      </form>

      {/* Today's spending log */}
      {(() => {
        const todayItems = profile.spendings.filter((s) => s.date === todayKey());
        if (todayItems.length === 0) return null;
        return (
          <div className="card" style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 4, fontSize: "0.95rem", color: "var(--text)" }}>
              {"Today's Purchases"}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
              {todayItems.length} {todayItems.length === 1 ? "entry" : "entries"} &middot; Resets daily
            </p>
            <ol className="spending-list">
              {todayItems.map((s) => {
                const v = s.verdict || (s.necessary ? "GOOD" : "BAD");
                const vc = VERDICT_CONFIG[v] || VERDICT_CONFIG.OKAY;
                const Icon = vc.icon;
                return (
                  <li key={s.id} className="spending-list-item">
                    <span className={`spending-list-badge ${vc.className}`}>
                      <Icon size={14} />
                    </span>
                    <div className="spending-list-details">
                      <div className="spending-list-top">
                        <span className="spending-merchant">{s.merchant}</span>
                        <span className="spending-amount">${s.amount.toFixed(2)}</span>
                      </div>
                      <div className="spending-list-bottom">
                        <span className="spending-category">{s.category}</span>
                        <span className={`tag ${vc.className}`}>{vc.label}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })()}

      {/* Large purchase intervention modal */}
      {interveneOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ maxWidth: 520, width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Hold up 👀</h2>
            <p>{interveneQuestion}</p>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                className="btn"
                onClick={() => {
                  setInterveneOpen(false);
                  setPendingEntry(null);
                  setPendingContext(null);
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="btn"
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    setInterveneOpen(false);

                    // continue normally (still uses necessary flag + AI evaluation)
                    await runEvaluation(pendingEntry, pendingContext);

                    setPendingEntry(null);
                    setPendingContext(null);
                  } catch (err) {
                    console.error(err);
                    alert("AI evaluation failed. Check Vercel logs.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                Log anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Justification modal */}
      {justifyOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div className="card" style={{ maxWidth: 520, width: "100%" }}>
            <h2 style={{ marginTop: 0 }}>Quick question</h2>
            <p>{followupQuestion}</p>

            <textarea
              value={justifyText}
              onChange={(e) => setJustifyText(e.target.value)}
              rows={4}
              style={{ width: "100%", marginBottom: 12 }}
              placeholder="Type your justification..."
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                className="btn"
                onClick={() => {
                  setJustifyOpen(false);
                  setPendingEntry(null);
                  setPendingContext(null);
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                disabled={submitting || justifyText.trim().length === 0}
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    const second = await evaluatePurchaseAPI(
                      pendingEntry,
                      pendingContext,
                      justifyText.trim()
                    );
                    // In the summoned/justification path, AI is allowed to decide xpDelta,
// EXCEPT: if the user marked it unnecessary, we still force -15.
if (pendingEntry?.necessary === false) {
  second.xpDelta = XP.UNNECESSARY_PURCHASE; // -15
  second.verdict = "BAD";
  if (typeof second.reason !== "string" || second.reason.trim().length === 0) {
    second.reason = "You marked this purchase as not necessary.";
  }
}


                    finalizePurchase({
                      entry: pendingEntry,
                      verdict: second.verdict,
                      reason: second.reason,
                      xpDelta: second.xpDelta,
                    });

                    setJustifyOpen(false);
                    setPendingEntry(null);
                    setPendingContext(null);
                  } catch (err) {
                    console.error(err);
                    alert("AI justification failed. Check Vercel logs.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

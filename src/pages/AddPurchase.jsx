'use client';

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Camera, ImageIcon, X } from "lucide-react";
import { todayKey, getTodaySpending, getCurrentBudget } from "../lib/budget";
import { applyXp, XP } from "../lib/xp";
import { evaluatePurchase, xpForVerdict } from "../lib/ai";

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
      // FUTURE: Send this image to an AI vision model to auto-extract
      // merchant, amount, and category from the receipt.
      // e.g. parseReceiptWithAI(ev.target.result).then(({ merchant, amount, category }) => { ... })
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
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

    // Evaluate purchase
    const evaluation = evaluatePurchase(entry, context);
    const xpDelta = xpForVerdict(evaluation.verdict);

    const spending = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: num,
      merchant: entry.merchant,
      category,
      necessary,
      verdict: evaluation.verdict,
      date: todayKey(),
      timestamp: new Date().toISOString(),
    };

    // Check if this purchase pushes the user over budget
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
      verdict: evaluation.verdict,
      explanation: evaluation.explanation,
      suggestion: evaluation.suggestion,
      budgetPenalty,
    });

    // Reset form
    setAmount("");
    setMerchant("");
    setCategory(CATEGORIES[0]);
    setNecessary(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Auto-clear result
    setTimeout(() => setResult(null), 6000);
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
          disabled={necessary === null || !amount || parseFloat(amount) <= 0}
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
              {todayItems.map((s, idx) => {
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
    </div>
  );
}

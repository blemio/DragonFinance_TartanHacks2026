'use client';

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  canChangeBudget,
  getCurrentBudget,
  todayKey,
  MAX_BUDGET_CHANGES_PER_DAY,
} from "../lib/budget";

export default function Budget({ profile, persist }) {
  const currentBudget = getCurrentBudget(profile.budgetHistory);
  const allowed = canChangeBudget(profile.budgetHistory);
  const [amount, setAmount] = useState(currentBudget !== null ? String(currentBudget) : "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    persist((p) => ({
      ...p,
      budgetHistory: [
        ...p.budgetHistory,
        { date: todayKey(), amount: num },
      ],
    }));

    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-header">
        <h1>Daily Budget</h1>
        <p>
          Set a spending limit for yourself each day.
          You can change it up to {MAX_BUDGET_CHANGES_PER_DAY} time{MAX_BUDGET_CHANGES_PER_DAY > 1 ? "s" : ""} per day.
        </p>
      </div>

      {currentBudget !== null && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="budget-stat-label">Current Daily Budget</div>
          <div className="budget-stat-value">${currentBudget.toFixed(2)}</div>
        </div>
      )}

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Budget Amount ($)
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!allowed}
          />
        </label>

        {!allowed && (
          <p style={{ color: "var(--red)", fontSize: "0.85rem", margin: 0 }}>
            You have already changed your budget today. Try again tomorrow.
          </p>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!allowed || !amount || parseFloat(amount) <= 0}
        >
          {currentBudget === null ? "Set Budget" : "Update Budget"}
        </button>
      </div>

      {saved && (
        <div className="toast toast-good">
          Budget saved!
        </div>
      )}
    </div>
  );
}

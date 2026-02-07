'use client';

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { applyXp, XP } from "../lib/xp";
import { todayKey } from "../lib/budget";

export default function SavingsGoal({ profile, persist }) {
  const goal = profile.savingsGoal;
  const [target, setTarget] = useState("");
  const [deposit, setDeposit] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Create a new goal ──────────────────────── */
  const handleCreate = (e) => {
    e.preventDefault();
    const num = parseFloat(target);
    if (isNaN(num) || num <= 0) return;
    persist((p) => ({
      ...p,
      savingsGoal: {
        target: num,
        saved: 0,
        deposits: [],
        completed: false,
        xpClaimed: false,
      },
    }));
    setTarget("");
    showToast("Goal set! Start saving.", "good");
  };

  /* ── Add a deposit ──────────────────────────── */
  const handleDeposit = (e) => {
    e.preventDefault();
    const num = parseFloat(deposit);
    if (isNaN(num) || num <= 0 || !goal) return;

    const newSaved = Math.min(goal.saved + num, goal.target);
    const justCompleted = !goal.completed && newSaved >= goal.target;

    persist((p) => {
      let xp = applyXp(p.xp, XP.SAVINGS_DEPOSIT);
      if (justCompleted) {
        xp = applyXp(xp, XP.SAVINGS_GOAL_BONUS);
      }
      return {
        ...p,
        xp,
        savingsGoal: {
          ...p.savingsGoal,
          saved: newSaved,
          deposits: [
            ...p.savingsGoal.deposits,
            { amount: num, date: todayKey(), timestamp: new Date().toISOString() },
          ],
          completed: newSaved >= p.savingsGoal.target,
        },
      };
    });

    setDeposit("");
    if (justCompleted) {
      showToast(`Goal reached! +${XP.SAVINGS_GOAL_BONUS + XP.SAVINGS_DEPOSIT} XP`, "good");
    } else {
      showToast(`+${XP.SAVINGS_DEPOSIT} XP for saving`, "good");
    }
  };

  /* ── Reset goal (start a new one) ───────────── */
  const handleReset = () => {
    persist((p) => ({ ...p, savingsGoal: null }));
    showToast("Goal cleared", "neutral");
  };

  /* ── Progress fraction ──────────────────────── */
  const progress = goal ? Math.min(goal.saved / goal.target, 1) : 0;

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-header">
        <h1>Savings Goal</h1>
        <p>Set a long-term savings target and earn bonus XP when you hit it.</p>
      </div>

      {/* ── No goal yet: creation form ─────────── */}
      {!goal && (
        <form
          className="card"
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <label>
            Target Amount ($)
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="e.g. 500"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </label>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {"You'll earn +{0} XP for each deposit and a +{1} XP bonus when you reach your target."
              .replace("{0}", XP.SAVINGS_DEPOSIT)
              .replace("{1}", XP.SAVINGS_GOAL_BONUS)}
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!target || parseFloat(target) <= 0}
          >
            Set Goal
          </button>
        </form>
      )}

      {/* ── Active goal ───────────────────────── */}
      {goal && (
        <>
          {/* Progress card */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Progress
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: goal.completed ? "var(--green)" : "var(--accent)" }}>
                {(progress * 100).toFixed(0)}%
              </span>
            </div>

            <div className="savings-bar-track">
              <div
                className={`savings-bar-fill ${goal.completed ? "complete" : ""}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: "0.9rem" }}>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>
                ${goal.saved.toFixed(2)}
              </span>
              <span style={{ color: "var(--text-muted)" }}>
                of ${goal.target.toFixed(2)}
              </span>
            </div>

            {goal.completed && (
              <div className="savings-complete-badge">
                Goal Reached!
                {goal.xpClaimed ? "" : ` +${XP.SAVINGS_GOAL_BONUS} XP earned`}
              </div>
            )}
          </div>

          {/* Deposit form */}
          {!goal.completed && (
            <form
              className="card"
              onSubmit={handleDeposit}
              style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 20 }}
            >
              <label>
                Deposit Amount ($)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="e.g. 25"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  required
                />
              </label>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!deposit || parseFloat(deposit) <= 0}
              >
                Add Deposit
              </button>
            </form>
          )}

          {/* Deposit history */}
          {goal.deposits.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 4, fontSize: "0.95rem", color: "var(--text)" }}>
                Deposit History
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                {goal.deposits.length} {goal.deposits.length === 1 ? "deposit" : "deposits"}
              </p>
              <ol className="spending-list">
                {goal.deposits.map((d, idx) => (
                  <li key={d.timestamp} className="spending-list-item">
                    <span className="spending-list-number">{idx + 1}</span>
                    <div className="spending-list-details">
                      <div className="spending-list-top">
                        <span className="spending-merchant">Deposit</span>
                        <span className="spending-amount necessary">
                          +${d.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="spending-list-bottom">
                        <span className="spending-category">{d.date}</span>
                        <span className="tag tag-good">+{XP.SAVINGS_DEPOSIT} XP</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Reset / new goal */}
          <button
            className="btn btn-danger"
            onClick={handleReset}
            style={{ fontSize: "0.82rem" }}
          >
            {goal.completed ? "Set New Goal" : "Cancel Goal"}
          </button>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "good" ? "toast-good" : "toast-bad"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

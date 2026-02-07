'use client';

import { Link } from "react-router-dom";
import { Wallet, PlusCircle, Target, BarChart3 } from "lucide-react";
import { getCurrentBudget, getRemainingBudget } from "../lib/budget";

export default function MenuPanel({ profile, onReset }) {
  const budget = getCurrentBudget(profile.budgetHistory);
  const remaining = getRemainingBudget(profile.budgetHistory, profile.spendings);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Budget status */}
      {budget !== null && (
        <div className="budget-status">
          <div className="budget-stat">
            <div className="budget-stat-label">Daily Budget</div>
            <div className="budget-stat-value">${budget.toFixed(2)}</div>
          </div>
          <div className="budget-stat">
            <div className="budget-stat-label">Remaining</div>
            <div
              className={`budget-stat-value ${remaining >= 0 ? "under" : "over"}`}
            >
              ${remaining !== null ? remaining.toFixed(2) : "--"}
            </div>
          </div>
        </div>
      )}

      {/* Action cards */}
      <Link to="/budget" className="menu-card">
        <div className="menu-card-icon accent" aria-hidden="true">
          <Wallet size={20} />
        </div>
        <div className="menu-card-text">
          <h3>{budget === null ? "Set Daily Budget" : "Update Budget"}</h3>
          <p>
            {budget === null
              ? "Set a spending limit to start tracking"
              : "Review or change your daily limit"}
          </p>
        </div>
      </Link>

      <Link
        to="/add"
        className="menu-card"
        style={budget === null ? { opacity: 0.45, pointerEvents: "none" } : {}}
        aria-disabled={budget === null}
      >
        <div className="menu-card-icon green" aria-hidden="true">
          <PlusCircle size={20} />
        </div>
        <div className="menu-card-text">
          <h3>Log Spending</h3>
          <p>Record a purchase and see its XP impact</p>
        </div>
      </Link>

      <Link to="/savings" className="menu-card">
        <div className="menu-card-icon red" aria-hidden="true">
          <Target size={20} />
        </div>
        <div className="menu-card-text">
          <h3>Savings Goal</h3>
          <p>Set a target, log deposits, earn bonus XP</p>
        </div>
      </Link>

      <Link to="/summary" className="menu-card">
        <div className="menu-card-icon blue" aria-hidden="true">
          <BarChart3 size={20} />
        </div>
        <div className="menu-card-text">
          <h3>Weekly Summary</h3>
          <p>See your spending breakdown and progress</p>
        </div>
      </Link>

      {/* Dev reset */}
      <button
        className="btn btn-danger"
        onClick={onReset}
        style={{ marginTop: 8, alignSelf: "flex-start", fontSize: "0.82rem" }}
      >
        Reset All Data
      </button>
    </div>
  );
}

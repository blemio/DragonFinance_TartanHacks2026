'use client';

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, ArrowUpDown } from "lucide-react";

/* ── Helpers ──────────────────────────────────── */

/** Normalize any billing cycle to a monthly cost */
function toMonthlyCost(amount, cycle) {
  if (cycle === "weekly") return amount * (52 / 12);
  if (cycle === "yearly") return amount / 12;
  return amount; // monthly
}

/** Friendly time-ago string from ISO date */
function timeAgo(isoString) {
  if (!isoString) return "Never used";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString();
}

/** Format date + time for the detail line */
function formatDateTime(isoString) {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " at " + d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Component ────────────────────────────────── */

export default function Subscriptions({ profile, persist }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [sortMode, setSortMode] = useState("cost"); // "cost" | "recent"
  const [toast, setToast] = useState(null);

  const subs = profile.subscriptions || [];

  /* ── Add subscription ────────────────────────── */
  const handleAdd = () => {
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) return;

    persist((p) => ({
      ...p,
      subscriptions: [
        ...(p.subscriptions || []),
        {
          id: Date.now().toString(),
          name: name.trim(),
          amount: num,
          billingCycle,
          lastUsed: null,
          createdAt: new Date().toISOString(),
        },
      ],
    }));

    setName("");
    setAmount("");
    setBillingCycle("monthly");
    showToast("Subscription added!");
  };

  /* ── Log usage ───────────────────────────────── */
  const handleLogUsage = (id) => {
    persist((p) => ({
      ...p,
      subscriptions: (p.subscriptions || []).map((s) =>
        s.id === id ? { ...s, lastUsed: new Date().toISOString() } : s
      ),
    }));
    showToast("Usage logged!");
  };

  /* ── Delete subscription ─────────────────────── */
  const handleDelete = (id) => {
    persist((p) => ({
      ...p,
      subscriptions: (p.subscriptions || []).filter((s) => s.id !== id),
    }));
    showToast("Subscription removed");
  };

  /* ── Toast helper ────────────────────────────── */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  /* ── Sort subscriptions ──────────────────────── */
  const sorted = [...subs].sort((a, b) => {
    if (sortMode === "cost") {
      return toMonthlyCost(b.amount, b.billingCycle) - toMonthlyCost(a.amount, a.billingCycle);
    }
    // "recent" — most recently used first, never-used at bottom
    const aTime = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
    const bTime = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
    return bTime - aTime;
  });

  /* ── Total monthly cost ──────────────────────── */
  const totalMonthly = subs.reduce(
    (sum, s) => sum + toMonthlyCost(s.amount, s.billingCycle),
    0
  );

  /* ── Cycle label helper ──────────────────────── */
  const cycleLabel = (c) =>
    c === "weekly" ? "/wk" : c === "yearly" ? "/yr" : "/mo";

  return (
    <div className="page" style={{ maxWidth: 620 }}>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-header">
        <h1>Subscriptions</h1>
        <p>Track your recurring costs and how often you actually use them.</p>
      </div>

      {/* ── Summary tiles ─────────────────────────── */}
      {subs.length > 0 && (
        <div className="sub-summary-row">
          <div className="sub-summary-tile">
            <div className="sub-summary-label">Total Monthly Cost</div>
            <div className="sub-summary-value">${totalMonthly.toFixed(2)}</div>
          </div>
          <div className="sub-summary-tile">
            <div className="sub-summary-label">Active Subscriptions</div>
            <div className="sub-summary-value">{subs.length}</div>
          </div>
        </div>
      )}

      {/* ── Add form ──────────────────────────────── */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <label>
          Subscription Name
          <input
            type="text"
            placeholder="e.g. Netflix, Spotify, ChatGPT..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className="sub-form-row">
          <label style={{ flex: 1 }}>
            Amount ($)
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="9.99"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label style={{ flex: 1 }}>
            Billing Cycle
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleAdd}
          disabled={!name.trim() || !amount || parseFloat(amount) <= 0}
        >
          Add Subscription
        </button>
      </div>

      {/* ── Sort control ──────────────────────────── */}
      {subs.length > 1 && (
        <div className="sub-sort-bar">
          <ArrowUpDown size={14} />
          <span className="sub-sort-label">Sort by:</span>
          <button
            className={`sub-sort-btn ${sortMode === "cost" ? "active" : ""}`}
            onClick={() => setSortMode("cost")}
          >
            Most Expensive
          </button>
          <button
            className={`sub-sort-btn ${sortMode === "recent" ? "active" : ""}`}
            onClick={() => setSortMode("recent")}
          >
            Recently Used
          </button>
        </div>
      )}

      {/* ── Subscription list ─────────────────────── */}
      {sorted.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
          <p style={{ fontSize: "0.95rem", marginBottom: 4 }}>No subscriptions yet</p>
          <p style={{ fontSize: "0.85rem" }}>Add your first subscription above to start tracking.</p>
        </div>
      ) : (
        <div className="sub-list">
          {sorted.map((sub) => {
            const monthly = toMonthlyCost(sub.amount, sub.billingCycle);
            return (
              <div className="sub-card" key={sub.id}>
                <div className="sub-card-header">
                  <div className="sub-card-name">{sub.name}</div>
                  <div className="sub-card-cost">
                    <span className="sub-card-amount">${sub.amount.toFixed(2)}</span>
                    <span className="sub-card-cycle">{cycleLabel(sub.billingCycle)}</span>
                  </div>
                </div>

                {sub.billingCycle !== "monthly" && (
                  <div className="sub-card-normalized">
                    ~${monthly.toFixed(2)}/mo
                  </div>
                )}

                <div className="sub-card-usage">
                  <Clock size={14} />
                  <span className="sub-card-last-used">
                    {sub.lastUsed ? (
                      <>
                        Last used: <strong>{timeAgo(sub.lastUsed)}</strong>
                        <span className="sub-card-datetime">{formatDateTime(sub.lastUsed)}</span>
                      </>
                    ) : (
                      "Never used"
                    )}
                  </span>
                </div>

                <div className="sub-card-actions">
                  <button
                    className="btn sub-log-btn"
                    onClick={() => handleLogUsage(sub.id)}
                  >
                    Log Usage
                  </button>
                  <button
                    className="btn btn-danger sub-delete-btn"
                    onClick={() => handleDelete(sub.id)}
                    aria-label={`Delete ${sub.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="toast toast-good">{toast}</div>}
    </div>
  );
}

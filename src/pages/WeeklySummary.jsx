import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStage } from "../lib/dragon";

/**
 * Get all spendings from the last 7 days (including today).
 */
function getWeekSpendings(spendings) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  return spendings.filter((s) => {
    const d = new Date(s.timestamp);
    return d >= sevenDaysAgo;
  });
}

/**
 * Group spendings by category, returning { category, total, count }.
 */
function groupByCategory(spendings) {
  const map = {};
  for (const s of spendings) {
    if (!map[s.category]) map[s.category] = { category: s.category, total: 0, count: 0 };
    map[s.category].total += s.amount;
    map[s.category].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export default function WeeklySummary({ profile }) {
  const week = getWeekSpendings(profile.spendings);
  const categories = groupByCategory(week);

  const totalSpent = week.reduce((sum, s) => sum + s.amount, 0);
  const necessaryCount = week.filter((s) => s.necessary).length;
  const unnecessaryCount = week.filter((s) => !s.necessary).length;
  const stage = getStage(profile.xp);

  // Find the max category total to make bar widths relative
  const maxCatTotal = categories.length > 0 ? categories[0].total : 1;

  return (
    <div className="page" style={{ maxWidth: 620 }}>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="page-header">
        <h1>Weekly Summary</h1>
        <p>Your spending and dragon progress over the last 7 days.</p>
      </div>

      {/* Top-level stats */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-card-label">Total Spent</div>
          <div className="summary-card-value" style={{ color: "var(--text)" }}>
            ${totalSpent.toFixed(2)}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Purchases</div>
          <div className="summary-card-value" style={{ color: "var(--blue)" }}>
            {week.length}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Necessary</div>
          <div className="summary-card-value" style={{ color: "var(--green)" }}>
            {necessaryCount}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Unnecessary</div>
          <div className="summary-card-value" style={{ color: "var(--red)" }}>
            {unnecessaryCount}
          </div>
        </div>
      </div>

      {/* Dragon progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="budget-stat-label">Dragon Status</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
          <span className="budget-stat-value" style={{ color: "var(--accent)" }}>
            {stage.label}
          </span>
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {profile.xp} XP
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 ? (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Spending by Category
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {categories.map((cat) => (
              <div key={cat.category}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ color: "var(--text)" }}>{cat.category}</span>
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>
                    ${cat.total.toFixed(2)}
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginLeft: 6,
                      }}
                    >
                      ({cat.count})
                    </span>
                  </span>
                </div>
                {/* Simple bar chart */}
                <div
                  style={{
                    height: 8,
                    background: "var(--bg-card)",
                    borderRadius: 4,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(cat.total / maxCatTotal) * 100}%`,
                      background: "var(--accent)",
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            No spending data this week. Start logging purchases to see your summary.
          </p>
        </div>
      )}
    </div>
  );
}

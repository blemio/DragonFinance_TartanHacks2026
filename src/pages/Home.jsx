import { Link } from "react-router-dom";
import { useProfile } from "../state/ProfileContext";

export default function Home() {
  const { profile, dollarsFromCents, spentTodayCents } = useProfile();
  const spent = spentTodayCents();
  const budget = profile.dailyBudgetCents;
  const remaining = budget == null ? null : Math.max(0, budget - spent);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>

      {budget == null ? (
        <div style={{ maxWidth: 560 }}>
          <p style={{ marginTop: 0, opacity: 0.85 }}>
            Step 3: set your daily budget so it stays fixed at the top of the app.
          </p>
          <Link to="/budget" style={cta}>Set daily budget</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
          <div style={card}>
            <div style={label}>Daily budget</div>
            <div style={value}>${dollarsFromCents(budget)}</div>
          </div>

          <div style={card}>
            <div style={label}>Spent today</div>
            <div style={value}>${dollarsFromCents(spent)}</div>
          </div>

          <div style={card}>
            <div style={label}>Safe to spend today</div>
            <div style={value}>${dollarsFromCents(remaining)}</div>
          </div>

          <Link to="/add" style={cta}>Log spending</Link>
        </div>
      )}
    </div>
  );
}

const card = {
  border: "1px solid #444",
  borderRadius: 16,
  padding: 14,
};

const label = { fontSize: 12, opacity: 0.75, marginBottom: 4 };
const value = { fontSize: 18, fontWeight: 900 };

const cta = {
  display: "inline-block",
  marginTop: 6,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #444",
  textDecoration: "none",
  color: "inherit",
  fontWeight: 900,
};

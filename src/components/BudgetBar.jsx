import { useNavigate } from "react-router-dom";
import { useProfile } from "../state/ProfileContext";

export default function BudgetBar() {
  const navigate = useNavigate();
  const { profile, dollarsFromCents, spentTodayCents } = useProfile();

  const budgetCents = profile.dailyBudgetCents;
  if (budgetCents === null) return null;

  const spent = spentTodayCents();
  const remaining = Math.max(0, budgetCents - spent);

  function handleEdit() {
    const ok = window.confirm(
      "Change your daily budget? (Try not to change it too often—this is your daily target.)"
    );
    if (ok) navigate("/budget");
  }

  return (
    <div style={wrap}>
      <div style={inner}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "baseline" }}>
          <div>
            <div style={label}>Daily budget</div>
            <div style={value}>${dollarsFromCents(budgetCents)}</div>
          </div>

          <div>
            <div style={label}>Spent today</div>
            <div style={value}>${dollarsFromCents(spent)}</div>
          </div>

          <div>
            <div style={label}>Remaining</div>
            <div style={value}>${dollarsFromCents(remaining)}</div>
          </div>
        </div>

        <button onClick={handleEdit} style={btn}>Modify</button>
      </div>
    </div>
  );
}

const wrap = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "white",
  borderBottom: "1px solid #ddd",
};

const inner = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
};

const label = { fontSize: 12, opacity: 0.75, marginBottom: 2 };
const value = { fontSize: 16, fontWeight: 800 };

const btn = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

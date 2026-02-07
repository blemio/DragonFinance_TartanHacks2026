import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "../state/ProfileContext";

const CATEGORIES = [
  "Food",
  "Coffee",
  "Groceries",
  "Transport",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export default function AddPurchase() {
  const { profile, addPurchase, deletePurchase, purchasesForToday, dollarsFromCents } = useProfile();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [merchant, setMerchant] = useState("");
  const [error, setError] = useState("");

  const todays = purchasesForToday();

  function handleSave(e) {
    e.preventDefault();
    setError("");

    if (profile.dailyBudgetCents == null) {
      setError("Set your daily budget first.");
      return;
    }

    const res = addPurchase({ amountDollars: amount, category, merchant });
    if (!res.ok) {
      setError(res.error);
      return;
    }

    setAmount("");
    setMerchant("");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Log spending</h1>
      <p style={{ marginTop: 0, opacity: 0.85, maxWidth: 560 }}>
        Add what you spent and what it was for. Your budget stays fixed at the top.
        {profile.dailyBudgetCents == null ? (
          <>
            {" "}
            <b><Link to="/budget">Set your daily budget</Link></b> first.
          </>
        ) : null}
      </p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label style={labelStyle}>
          Amount (USD)
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="12.34"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={labelStyle}>
          What was it for?
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          Merchant / note (optional)
          <input
            type="text"
            placeholder="Starbucks, Uber, Target…"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error ? <div style={{ color: "#b00020", fontWeight: 600 }}>{error}</div> : null}

        <button type="submit" style={buttonStyle}>
          Add purchase
        </button>
      </form>

      <div style={{ marginTop: 22, maxWidth: 720 }}>
        <div style={{ fontWeight: 900, marginBottom: 10 }}>Today’s purchases</div>

        {todays.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Nothing logged yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {todays.map((p) => (
              <div key={p.id} style={rowStyle}>
                <div>
                  <div style={{ fontWeight: 900 }}>
                    ${dollarsFromCents(p.amountCents)} · {p.category}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 2 }}>
                    {p.merchant || "(no note)"} ·{" "}
                    {new Date(p.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <button onClick={() => deletePurchase(p.id)} style={smallBtn}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 6, fontWeight: 700 };

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "white",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 800,
  maxWidth: 240,
};

const rowStyle = {
  border: "1px solid #444",
  borderRadius: 14,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const smallBtn = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "transparent",
  cursor: "pointer",
  opacity: 0.9,
};

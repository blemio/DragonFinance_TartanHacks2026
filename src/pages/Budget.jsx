import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../state/ProfileContext";

export default function Budget() {
  const navigate = useNavigate();
  const { profile, setDailyBudget, dollarsFromCents } = useProfile();

  const starting = useMemo(() => {
    return profile.dailyBudgetCents == null ? "" : dollarsFromCents(profile.dailyBudgetCents);
  }, [profile.dailyBudgetCents, dollarsFromCents]);

  const [daily, setDaily] = useState(starting);
  const [error, setError] = useState("");

  function handleSave(e) {
    e.preventDefault();
    setError("");
    const res = setDailyBudget(daily);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/add");
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Set your daily budget</h1>
      <p style={{ marginTop: 0, opacity: 0.85, maxWidth: 560 }}>
        This is your <b>daily target</b>. We keep it fixed at the top of the screen so you can make decisions throughout the day.
      </p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <label style={labelStyle}>
          Daily budget (USD)
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="40"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error ? (
          <div style={{ color: "#b00020", fontWeight: 600 }}>{error}</div>
        ) : null}

        <button type="submit" style={buttonStyle}>
          Save daily budget
        </button>

        {profile.dailyBudgetCents != null ? (
          <button
            type="button"
            onClick={() => navigate("/add")}
            style={{ ...buttonStyle, opacity: 0.85 }}
          >
            Back to spending
          </button>
        ) : null}
      </form>
    </div>
  );
}

const labelStyle = { display: "grid", gap: 6, fontWeight: 700 };

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #444",
};

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "transparent",
  cursor: "pointer",
  fontWeight: 800,
};

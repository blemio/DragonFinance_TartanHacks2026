import { getDragonDisplayLabel, getStageFromXp } from "../lib/dragon";

export default function DragonPanel({ profile, onAddXp, onReset }) {
  const xp = profile?.xp ?? 0;
  const eggChoice = profile?.eggChoice ?? "???";
  const stage = getStageFromXp(xp);

  const label = getDragonDisplayLabel(eggChoice, stage, xp);

  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #333",
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 420,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Your Dragon</div>

        {/* Placeholder panel (swap to <img> later) */}
        <div
          style={{
            borderRadius: 16,
            border: "1px dashed #555",
            height: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            opacity: 0.95,
            padding: 12,
            textAlign: "center",
          }}
        >
          {label}
        </div>

        <div style={{ marginTop: 12, opacity: 0.8 }}>
          Stage changes at XP 50 / 120 / 250 / 500.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => onAddXp(25)}
          style={buttonStyle}
        >
          +25 XP (test)
        </button>

        <button
          onClick={() => onAddXp(100)}
          style={buttonStyle}
        >
          +100 XP (test)
        </button>

        <button
          onClick={onReset}
          style={{ ...buttonStyle, opacity: 0.85 }}
        >
          Reset egg
        </button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #444",
  background: "transparent",
  cursor: "pointer",
};

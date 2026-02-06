import { EGGS } from "../lib/dragon";

export default function EggPicker({ onPick }) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Choose your dragon egg</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Your egg will crack, hatch, and grow as you earn financial XP.
      </p>

      <div style={{ display: "flex", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
        {EGGS.map((egg) => (
          <button
            key={egg.id}
            onClick={() => onPick(egg.id)}
            style={{
              padding: 18,
              borderRadius: 14,
              border: "1px solid #444",
              background: "transparent",
              cursor: "pointer",
              minWidth: 170,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800 }}>{egg.label}</div>
            <div style={{ marginTop: 6, opacity: 0.8 }}>
              Pick this egg →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

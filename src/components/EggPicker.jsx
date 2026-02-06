export default function EggPicker({ onPick }) {
  const eggs = [
    { id: "red", label: "Fire Egg" },
    { id: "blue", label: "Ice Egg" },
    { id: "green", label: "Forest Egg" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 900, width: "100%" }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>
          Choose your dragon egg
        </h1>
        <p style={{ textAlign: "center", opacity: 0.85, marginTop: 0 }}>
          Your egg will grow as you gain financial XP.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 18,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          {eggs.map((egg) => (
            <button
              key={egg.id}
              onClick={() => onPick(egg.id)}
              style={{
                width: 220,
                padding: 18,
                borderRadius: 18,
                border: "1px solid #444",
                background: "transparent",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800 }}>{egg.label}</div>
              <div style={{ marginTop: 8, opacity: 0.8 }}>Pick this egg →</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

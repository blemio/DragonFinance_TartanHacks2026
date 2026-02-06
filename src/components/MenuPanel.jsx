import { Link } from "react-router-dom";

export default function MenuPanel() {
  return (
    <div
      style={{
        flex: 1,
        border: "1px solid #333",
        borderRadius: 16,
        padding: 16,
        minHeight: 420,
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 12 }}>Menu</div>

      <div style={{ display: "grid", gap: 12 }}>
        <MenuCard title="Budget" desc="Set a daily/weekly target." to="/stats" />
        <MenuCard title="Spending" desc="See spending breakdown." to="/stats" />
        <MenuCard title="Savings" desc="Track streaks and progress." to="/stats" />
        <MenuCard title="Quests" desc="Complete quests to earn XP." to="/quests" />
      </div>
    </div>
  );
}

function MenuCard({ title, desc, to }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #444",
        borderRadius: 14,
        padding: 14,
        display: "block",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 6, opacity: 0.85 }}>{desc}</div>
    </Link>
  );
}

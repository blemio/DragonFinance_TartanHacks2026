import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AddPurchase from "./pages/AddPurchase.jsx";
import Budget from "./pages/Budget.jsx";
import { ProfileProvider } from "./state/ProfileContext.jsx";
import BudgetBar from "./components/BudgetBar.jsx";

function Nav() {
  const linkStyle = ({ isActive }) => ({
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    background: isActive ? "#eaeaea" : "transparent",
    color: "inherit",
  });

  return (
    <div style={{ display: "flex", gap: 8, padding: 12, borderBottom: "1px solid #ddd" }}>
      <NavLink to="/" style={linkStyle}>Home</NavLink>
      <NavLink to="/add" style={linkStyle}>Add</NavLink>
      <NavLink to="/budget" style={linkStyle}>Budget</NavLink>
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <div>
        {/* Dev nav (you can delete later once the menu screen is wired in) */}
        <Nav />

        {/* Shows only after the user sets a daily budget */}
        <BudgetBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddPurchase />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ProfileProvider>
  );
}

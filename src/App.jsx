import { NavLink, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AddPurchase from "./pages/AddPurchase.jsx";
import Budget from "./pages/Budget.jsx";

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
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddPurchase />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </div>
  );
}

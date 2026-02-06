import { useState } from "react";
import { NavLink, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import AddPurchase from "./pages/AddPurchase.jsx";
import Budget from "./pages/Budget.jsx";

import EggPicker from "./components/EggPicker.jsx";
import { loadProfile, saveProfile } from "./lib/storage.js";

function Nav() {
  const linkStyle = ({ isActive }) => ({
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    background: isActive ? "#eaeaea" : "transparent",
    color: "inherit",
  });

  return (
    <div style={{ display: "flex", gap: 10, padding: 16 }}>
      <NavLink to="/" style={linkStyle} end>
        Home
      </NavLink>
      <NavLink to="/add" style={linkStyle}>
        Add Purchase
      </NavLink>
      <NavLink to="/budget" style={linkStyle}>
        Budget
      </NavLink>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());

  // ✅ Gate: only show egg picker if user has never chosen an egg
  if (!profile?.eggChoice) {
    return (
      <EggPicker
        onPick={(eggChoice) => {
          const next = { eggChoice, xp: 0 };
          saveProfile(next);
          setProfile(next);
        }}
      />
    );
  }

  // ✅ After egg chosen: show Darren's app exactly as before
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

'use client';

import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { loadProfile, saveProfile, clearProfile } from "./lib/storage";
import { applyXp } from "./lib/xp";

import EggPicker from "./components/EggPicker.jsx";
import Home from "./pages/Home.jsx";
import Budget from "./pages/Budget.jsx";
import AddPurchase from "./pages/AddPurchase.jsx";
import WeeklySummary from "./pages/WeeklySummary.jsx";
import SavingsGoal from "./pages/SavingsGoal.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile());

  const persist = useCallback((updater) => {
    setProfile((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveProfile(next);
      return next;
    });
  }, []);

  /* ── Egg selection (first-time flow) ─────────── */
  const handlePickEgg = useCallback(
    (eggId) => {
      persist((p) => ({ ...p, eggChoice: eggId }));
    },
    [persist],
  );

  /* ── XP helpers ──────────────────────────────── */
  const handleAddXp = useCallback(
    (delta) => {
      persist((p) => ({ ...p, xp: applyXp(p.xp, delta) }));
    },
    [persist],
  );

  /* ── Reset (dev helper) ─────────────────────── */
  const handleReset = useCallback(() => {
    clearProfile();
    setProfile(loadProfile());
  }, []);

  /* ── First-time: no egg chosen yet ──────────── */
  if (!profile.eggChoice) {
    return <EggPicker onPick={handlePickEgg} />;
  }

  /* ── Main app shell ─────────────────────────── */
  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={
            <Home
              profile={profile}
              onAddXp={handleAddXp}
              onReset={handleReset}
            />
          }
        />
        <Route
          path="/budget"
          element={<Budget profile={profile} persist={persist} />}
        />
        <Route
          path="/add"
          element={
            <AddPurchase
              profile={profile}
              persist={persist}
            />
          }
        />
        <Route
          path="/savings"
          element={
            <SavingsGoal profile={profile} persist={persist} />
          }
        />
        <Route
          path="/summary"
          element={<WeeklySummary profile={profile} />}
        />
        <Route
  path="/subscriptions"
  element={<Subscriptions profile={profile} persist={persist} />}
/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

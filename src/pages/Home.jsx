'use client';

import DragonPanel from "../components/DragonPanel.jsx";
import MenuPanel from "../components/MenuPanel.jsx";
import StreakCounter from "../components/StreakCounter.jsx";
import StatTiles from "../components/StatTiles.jsx";
import SpendChart from "../components/SpendChart.jsx";

export default function Home({ profile, onAddXp, onReset }) {
  return (
    <div className="page">
      {/* Top bar with streak counter */}
      <div className="home-top-bar">
        <h2 className="home-title">Dragon Finance</h2>
        <StreakCounter streak={profile.streak} />
      </div>

      {/* Stat tiles row */}
      <StatTiles profile={profile} />

      {/* 7-day spending chart */}
      <SpendChart spendings={profile.spendings} />

      <div className="home-layout">
        {/* Left: dragon display */}
        <div className="home-left">
          <DragonPanel profile={profile} />
        </div>

        {/* Right: action menu */}
        <div className="home-right">
          <MenuPanel
            profile={profile}
            onReset={onReset}
          />
        </div>

        
      </div>
    </div>
  );
}

'use client';

import { EGGS } from "../lib/dragon";

export default function EggPicker({ onPick }) {
  return (
    <div className="egg-picker-wrapper">
      <h1>Choose Your Dragon Egg</h1>
      <p style={{ maxWidth: 420, marginTop: 8 }}>
        Your dragon will hatch and grow as you make smart financial decisions.
        Pick wisely — this choice is permanent.
      </p>

      <div className="egg-grid">
        {EGGS.map((egg) => (
          <button
            key={egg.id}
            className="egg-card"
            data-egg={egg.id}
            onClick={() => onPick(egg.id)}
            aria-label={`Select ${egg.label}`}
          >
            <div className="egg-placeholder" data-egg={egg.id} aria-hidden="true">
              ?
            </div>
            <div className="egg-card-label">{egg.label}</div>
            <div className="egg-card-sub">{egg.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

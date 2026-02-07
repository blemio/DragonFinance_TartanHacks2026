import { getDragonSprite } from "../lib/dragonSprites";

const EGG_ID_TO_TYPE = {
  red: "archer",
  blue: "knight",
  green: "wizard",
  archer: "archer",
  knight: "knight",
  wizard: "wizard",
};


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
        {EGGS.map((egg) => {
          const type = EGG_ID_TO_TYPE[egg.id] ?? egg.id;
          const img = getDragonSprite(type, 0, "happy"); // xp=0 => egg sprite

          return (
            <button
              key={egg.id}
              className="egg-card"
              data-egg={egg.id}
              onClick={() => onPick(egg.id)}
              aria-label={`Select ${egg.label}`}
            >
              <div className="egg-placeholder" data-egg={egg.id} aria-hidden="true">
                <img
                  src={img}
                  alt={egg.label}
                  className="w-40 h-40 object-contain"
                />
              </div>

              <div className="egg-card-label">{egg.label}</div>
              <div className="egg-card-sub">{egg.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


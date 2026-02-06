export const EGGS = [
  { id: "red", label: "Fire Egg" },
  { id: "blue", label: "Ice Egg" },
  { id: "green", label: "Forest Egg" },
];

export const STAGES = [
  { name: "egg", minXp: 0 },
  { name: "cracked", minXp: 50 },
  { name: "hatchling", minXp: 120 },
  { name: "young", minXp: 250 },
  { name: "adult", minXp: 500 },
];

export function getStageFromXp(xp) {
  let stage = STAGES[0].name;
  for (const s of STAGES) {
    if (xp >= s.minXp) stage = s.name;
  }
  return stage;
}

/**
 * Later you can map to images. For now we return a label so the UI works.
 * Replace this with an <img src={...}/> mapping when you have art.
 */
export function getDragonDisplayLabel(eggChoice, stage, xp) {
  return `${eggChoice.toUpperCase()} • ${stage.toUpperCase()} • XP ${xp}`;
}

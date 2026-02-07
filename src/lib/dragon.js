/* ── Eggs ──────────────────────────────────────── */
export const EGGS = [
  { id: "red",   label: "Archer Egg", desc: "Quick reflexes, sharper aim." },
  { id: "blue",  label: "Knight Egg", desc: "Steady defense, disciplined spending." },
  { id: "green", label: "Mage Egg",   desc: "Big brain budgeting and long-term planning." },
];


/* ── Stages (3 total) ─────────────────────────── */
export const STAGES = [
  { name: "egg",   label: "Egg",          minXp: 0 },
  { name: "baby",  label: "Baby Dragon",  minXp: 100 },
  { name: "adult", label: "Adult Dragon", minXp: 300 },
];

/**
 * Returns the current stage object based on XP.
 */
export function getStage(xp) {
  let stage = STAGES[0];
  for (const s of STAGES) {
    if (xp >= s.minXp) stage = s;
  }
  return stage;
}

/**
 * Returns the *next* stage, or null if already at max.
 */
export function getNextStage(xp) {
  const current = getStage(xp);
  const idx = STAGES.indexOf(current);
  return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
}

/**
 * Progress fraction (0-1) towards the next stage.
 */
export function getStageProgress(xp) {
  const current = getStage(xp);
  const next = getNextStage(xp);
  if (!next) return 1; // maxed
  const range = next.minXp - current.minXp;
  const progress = xp - current.minXp;
  return Math.min(progress / range, 1);
}

/**
 * Placeholder label for the dragon display area.
 * Replace this function body with <img> mapping once sprites are ready.
 */
export function getDragonPlaceholderText(eggChoice, stage) {
  return `[${eggChoice.toUpperCase()} ${stage.label}]`;
}

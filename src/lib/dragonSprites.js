import archerEgg from "../assets/dragons/archer_egg.png";
import archerHappy from "../assets/dragons/archer_happy.png";
import archerSad from "../assets/dragons/archer_sad.png";

import knightEgg from "../assets/dragons/knight_egg.png";
import knightHappy from "../assets/dragons/knight_happy.png";
import knightSad from "../assets/dragons/knight_sad.png";

import wizardEgg from "../assets/dragons/wizard_egg.png";
import wizardHappy from "../assets/dragons/wizard_happy.png";
import wizardSad from "../assets/dragons/wizard_sad.png";

// adjust later (you mentioned 300)
export const HATCH_XP = 300;

const SPRITES = {
  archer: { egg: archerEgg, happy: archerHappy, sad: archerSad },
  knight: { egg: knightEgg, happy: knightHappy, sad: knightSad },
  wizard: { egg: wizardEgg, happy: wizardHappy, sad: wizardSad },
};

export function getDragonSprite(type, xp, mood = "happy") {
  const t = SPRITES[type];
  if (!t) return null;
  if (xp < HATCH_XP) return t.egg;
  return t[mood] || t.happy;
}

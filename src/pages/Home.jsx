import { useState } from "react";
import EggPicker from "../components/EggPicker";
import DragonPanel from "../components/DragonPanel";
import MenuPanel from "../components/MenuPanel";
import { loadProfile, saveProfile, clearProfile } from "../lib/storage";

export default function Home() {
  const [profile, setProfile] = useState(() => loadProfile());

  // If user hasn't chosen an egg yet, show the egg picker screen
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

  function addXp(amount) {
    const xp = (profile.xp ?? 0) + amount;
    const next = { ...profile, xp };
    saveProfile(next);
    setProfile(next);
  }

  function reset() {
    clearProfile();
    setProfile(null);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 16 }}>Money Dragon</h1>

      <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
        <DragonPanel profile={profile} onAddXp={addXp} onReset={reset} />
        <MenuPanel />
      </div>
    </div>
  );
}

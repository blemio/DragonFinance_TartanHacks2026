import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadProfile, saveProfile, clearProfile } from "../lib/storage";

const ProfileContext = createContext(null);

function centsFromDollars(input) {
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return Math.round(n * 100);
}

function dollarsFromCents(cents) {
  if (!Number.isFinite(cents)) return "";
  return (cents / 100).toFixed(2);
}

function startOfLocalDayMs(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => loadProfile());

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const api = useMemo(() => {
    function setDailyBudget(dollars) {
      const cents = centsFromDollars(dollars);
      if (cents === null) return { ok: false, error: "Enter a valid budget." };
      setProfile((p) => ({ ...p, dailyBudgetCents: cents }));
      return { ok: true };
    }

    function addPurchase({ amountDollars, category, merchant }) {
      const cents = centsFromDollars(amountDollars);
      if (cents === null || cents === 0) {
        return { ok: false, error: "Enter a valid amount." };
      }
      const trimmedCategory = (category ?? "").trim();
      const trimmedMerchant = (merchant ?? "").trim();

      const entry = {
        id: crypto?.randomUUID?.() ?? String(Date.now()),
        ts: Date.now(),
        amountCents: cents,
        category: trimmedCategory || "Other",
        merchant: trimmedMerchant,
      };

      setProfile((p) => ({ ...p, purchases: [entry, ...(p.purchases ?? [])] }));
      return { ok: true, entry };
    }

    function deletePurchase(id) {
      setProfile((p) => ({
        ...p,
        purchases: (p.purchases ?? []).filter((x) => x.id !== id),
      }));
    }

    function resetAll() {
      clearProfile();
      setProfile(loadProfile());
    }

    function purchasesForToday() {
      const start = startOfLocalDayMs();
      return (profile.purchases ?? []).filter((p) => p.ts >= start);
    }

    function spentTodayCents() {
      return purchasesForToday().reduce((sum, p) => sum + (p.amountCents ?? 0), 0);
    }

    return {
      profile,
      setDailyBudget,
      addPurchase,
      deletePurchase,
      resetAll,
      purchasesForToday,
      spentTodayCents,
      dollarsFromCents,
    };
  }, [profile]);

  return <ProfileContext.Provider value={api}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

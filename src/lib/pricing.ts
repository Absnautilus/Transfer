// Price tiers are keyed by pax band ("1-4", "5", "6", "7", "8", ...) and split
// day/night. Matches the hotel's real NCC rate card (PAX 1-4 flat, then one
// price per extra passenger up to 8).
export type PriceTiers = {
  day: Record<string, number>;
  night: Record<string, number>;
};

export const PAX_BANDS = ["1-4", "5", "6", "7", "8"] as const;

export function emptyPriceTiers(): PriceTiers {
  return {
    day: { "1-4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
    night: { "1-4": 0, "5": 0, "6": 0, "7": 0, "8": 0 },
  };
}

function paxBandKey(pax: number): string {
  if (pax <= 4) return "1-4";
  if (pax >= 8) return "8";
  return String(pax);
}

export function computePrice(tiers: PriceTiers, pax: number, isNight: boolean): number | null {
  const table = isNight ? tiers.night : tiers.day;
  const key = paxBandKey(pax);
  const value = table[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function isValidPriceTiers(value: unknown): value is PriceTiers {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.day === "object" && v.day !== null && typeof v.night === "object" && v.night !== null;
}

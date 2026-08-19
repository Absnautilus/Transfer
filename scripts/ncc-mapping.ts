export function parseItalianDate(value: string): string | null {
  const v = value.trim();
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const year = yyyy.length === 2 ? `20${yyyy}` : yyyy.padStart(4, "0");
  return `${year}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export function parseDotTime(value: string): string {
  const v = value.trim();
  const m = v.match(/^(\d{1,2})\.(\d{1,2})$/);
  if (!m) return "00:00";
  const [, hh, mm] = m;
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")}`;
}

export function parseBool(value: string): boolean {
  return value.trim().toUpperCase() === "TRUE";
}

export function parsePrice(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function splitRoute(value: string): [string, string] {
  const parts = value.split(">>>").map((p) => p.trim());
  if (parts.length >= 2) return [parts[0], parts[parts.length - 1]];
  return [value.trim(), ""];
}

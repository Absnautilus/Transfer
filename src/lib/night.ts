// Night service window: 22:00 (inclusive) to 07:00 (exclusive).
export function isNightTime(time: string): boolean {
  const [hoursStr] = time.split(":");
  const hours = Number(hoursStr);
  if (Number.isNaN(hours)) return false;
  return hours >= 22 || hours < 7;
}

// Derives a short operator initials tag from a staff member's full name,
// e.g. "Reception Palazzo Veneziano" -> "RPV", "Marco Bianchi" -> "MB".
export function deriveInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

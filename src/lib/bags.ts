export function formatBags(personal: number, cabin: number, standard: number, large: number): string | null {
  const parts: string[] = [];
  if (personal > 0) parts.push(`${personal} piccolo/i`);
  if (cabin > 0) parts.push(`${cabin} a mano`);
  if (standard > 0) parts.push(`${standard} da stiva`);
  if (large > 0) parts.push(`${large} grande/i`);
  return parts.length > 0 ? parts.join(", ") : null;
}

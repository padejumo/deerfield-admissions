export const US_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export function getOccupancyColor(
  occupied: number,
  reserved: number,
  total: number
): string {
  const rate = (occupied + reserved) / total;
  if (rate > 0.95) return "oklch(0.63 0.21 25)"; // red
  if (rate > 0.85) return "oklch(0.75 0.18 85)"; // amber/yellow
  return "oklch(0.6 0.18 155)"; // green
}

export function getMarkerRadius(totalBeds: number): number {
  // Scale from 8px (30 beds) to 18px (48 beds)
  const min = 8;
  const max = 18;
  const bedMin = 30;
  const bedMax = 48;
  return min + ((totalBeds - bedMin) / (bedMax - bedMin)) * (max - min);
}

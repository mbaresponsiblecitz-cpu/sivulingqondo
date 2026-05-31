export function progressPercent(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

export function formatRand(amount: number): string {
  return 'R' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface Tier {
  label: string;
  unit: number;
}

export function tiersFromAmount(amount: number, tiers: Tier[]) {
  return tiers.map((t) => ({ ...t, count: Math.floor(amount / t.unit) }));
}

import { describe, it, expect } from 'vitest';
import { progressPercent, formatRand, tiersFromAmount } from './campaign';

describe('progressPercent', () => {
  it('returns rounded percent of goal', () => {
    expect(progressPercent(8250, 16500)).toBe(50);
  });
  it('clamps to 100 when raised exceeds goal', () => {
    expect(progressPercent(20000, 16500)).toBe(100);
  });
  it('returns 0 for a zero or invalid goal', () => {
    expect(progressPercent(500, 0)).toBe(0);
  });
});

describe('formatRand', () => {
  it('formats whole rands with thousands separator and R prefix', () => {
    expect(formatRand(16500)).toBe('R16,500');
  });
});

describe('tiersFromAmount', () => {
  it('labels how many items a donation funds', () => {
    const tiers = [
      { label: 'chair', unit: 350 },
      { label: 'table', unit: 1200 },
    ];
    expect(tiersFromAmount(2400, tiers)).toEqual([
      { label: 'chair', unit: 350, count: 6 },
      { label: 'table', unit: 1200, count: 2 },
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { aspectLineStyle, calculateExactness } from './aspectStyle';

describe('calculateExactness', () => {
  it('is 1 (fully exact) when orb is 0', () => {
    expect(calculateExactness(0, 8)).toBe(1);
  });

  it('is 0 when the orb equals the max orb allowed', () => {
    expect(calculateExactness(8, 8)).toBe(0);
  });

  it('is proportional between those two ends', () => {
    expect(calculateExactness(4, 8)).toBeCloseTo(0.5);
  });

  it('clamps to 0 rather than going negative past the max orb', () => {
    expect(calculateExactness(12, 8)).toBe(0);
  });
});

describe('aspectLineStyle', () => {
  it('draws the thinnest, faintest line at the edge of orb', () => {
    const { strokeWidth, opacity } = aspectLineStyle(8, 8);
    expect(strokeWidth).toBeCloseTo(0.5);
    expect(opacity).toBeCloseTo(0.35);
  });

  it('draws the thickest, boldest line at exact orb', () => {
    const { strokeWidth, opacity } = aspectLineStyle(0, 8);
    expect(strokeWidth).toBeCloseTo(0.5 + 1.2);
    expect(opacity).toBeCloseTo(0.35 + 0.5);
  });

  it('gets louder the closer the orb is to exact', () => {
    const loose = aspectLineStyle(6, 8);
    const tight = aspectLineStyle(2, 8);
    expect(tight.strokeWidth).toBeGreaterThan(loose.strokeWidth);
    expect(tight.opacity).toBeGreaterThan(loose.opacity);
  });
});

import { describe, expect, it } from 'vitest';
import type { LocatedPoint, Point } from '../types';
import {
  angularDistance,
  assembleLocatedPoints,
  convertShiftInDegrees,
  FULL_CIRCLE,
  getPointPosition,
  getSign,
  normalizeAngle,
  SIGN_ARC,
} from './geometry';

describe('normalizeAngle', () => {
  it('leaves an in-range angle untouched', () => {
    expect(normalizeAngle(90)).toBe(90);
  });

  it('wraps a negative angle into [0, 360)', () => {
    expect(normalizeAngle(-10)).toBe(350);
  });

  it('wraps an angle past 360 back into range', () => {
    expect(normalizeAngle(370)).toBe(10);
  });

  it('treats exactly 360 as 0', () => {
    expect(normalizeAngle(360)).toBe(0);
  });
});

describe('getSign', () => {
  it('resolves 0° to Aries, the first sign', () => {
    expect(getSign(0)).toBe('Aries');
  });

  it('resolves the last degree of a 30° arc to the same sign as its start', () => {
    expect(getSign(29.99)).toBe('Aries');
    expect(getSign(30)).toBe('Taurus');
  });

  it('wraps a negative or over-360 angle before resolving the sign', () => {
    expect(getSign(-1)).toBe('Pisces');
    expect(getSign(360 + 15)).toBe('Aries');
  });

  it('divides the wheel into twelve equal 30° arcs', () => {
    expect(SIGN_ARC).toBe(30);
  });
});

describe('angularDistance', () => {
  it('returns 0 for identical angles', () => {
    expect(angularDistance(45, 45)).toBe(0);
  });

  it('returns the plain difference when it is under 180°', () => {
    expect(angularDistance(10, 100)).toBe(90);
  });

  it('wraps the long way around past 180°', () => {
    // 350° and 10° are only 20° apart going the short way around the wheel.
    expect(angularDistance(350, 10)).toBe(20);
  });

  it('is symmetric', () => {
    expect(angularDistance(10, 350)).toBe(angularDistance(350, 10));
  });

  it('caps out at exactly 180° for opposite points', () => {
    expect(angularDistance(0, 180)).toBe(180);
  });
});

describe('convertShiftInDegrees', () => {
  it('maps 180° (the wheel origin) to 0 radians', () => {
    expect(convertShiftInDegrees(180)).toBeCloseTo(0);
  });

  it('maps 0° to π radians', () => {
    expect(convertShiftInDegrees(0)).toBeCloseTo(Math.PI);
  });
});

describe('getPointPosition', () => {
  const center: Point = { x: 100, y: 100 };

  it('places the wheel-left position (angle 0°) directly left of center', () => {
    const { x, y } = getPointPosition(center, 50, 0);
    expect(x).toBeCloseTo(50);
    expect(y).toBeCloseTo(100);
  });

  it('places angle 90° directly below center', () => {
    const { x, y } = getPointPosition(center, 50, 90);
    expect(x).toBeCloseTo(100);
    expect(y).toBeCloseTo(150);
  });

  it('places angle 180° directly right of center — opposite angle 0°', () => {
    const { x, y } = getPointPosition(center, 50, 180);
    expect(x).toBeCloseTo(150);
    expect(y).toBeCloseTo(100);
  });

  it('stays exactly `radius` away from center at any angle', () => {
    for (const angle of [0, 37, 90, 180, 271, 359]) {
      const { x, y } = getPointPosition(center, 50, angle);
      const distance = Math.hypot(x - center.x, y - center.y);
      expect(distance).toBeCloseTo(50);
    }
  });
});

describe('assembleLocatedPoints', () => {
  const center: Point = { x: 0, y: 0 };
  const radius = 100;
  const pointRadius = 10; // collision radius per point

  function locatedAt(planetName: string, angle: number): LocatedPoint {
    return {
      planetName: planetName as LocatedPoint['planetName'],
      point: getPointPosition(center, radius, angle),
      radius: pointRadius,
      angle,
      pointer: angle,
    };
  }

  it('places the first point without needing to resolve a collision', () => {
    const result = assembleLocatedPoints([], locatedAt('sun', 0), center, radius);
    expect(result).toHaveLength(1);
    expect(result[0].angle).toBe(0);
  });

  it('leaves two well-separated points at their original angles', () => {
    const first = locatedAt('sun', 0);
    const result = assembleLocatedPoints([first], locatedAt('moon', 90), center, radius);

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.angle).sort((a, b) => a - b)).toEqual([0, 90]);
  });

  it('nudges two points apart when their glyphs collide', () => {
    const first = locatedAt('sun', 10);
    const result = assembleLocatedPoints([first], locatedAt('moon', 10), center, radius);

    expect(result).toHaveLength(2);
    const [a, b] = result;
    // They started on top of each other; resolving the collision must not
    // leave them at the exact same angle any more.
    expect(a.angle).not.toBe(b.angle);
  });

  it('keeps every angle normalized into [0, 360) even after nudging past 0°', () => {
    const first = locatedAt('sun', 0);
    const result = assembleLocatedPoints([first], locatedAt('moon', 0), center, radius);

    for (const { angle } of result) {
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(FULL_CIRCLE);
    }
  });
});

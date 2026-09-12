import { describe, expect, it } from 'vitest';
import { signKey, signKeyOf } from './signs';

describe('signKey', () => {
  it('lowercases the sign name for a given degree', () => {
    expect(signKey(0)).toBe('aries');
    expect(signKey(35)).toBe('taurus');
  });
});

describe('signKeyOf', () => {
  it("prefers the library's own resolved Sign key when present", () => {
    expect(signKeyOf({ Sign: { key: 'scorpio' } }, 0)).toBe('scorpio');
  });

  it('falls back to computing the sign from degrees when there is no Sign', () => {
    expect(signKeyOf(undefined, 45)).toBe('taurus');
    expect(signKeyOf({}, 45)).toBe('taurus');
  });

  it('falls back to degrees when Sign is present but keyless', () => {
    expect(signKeyOf({ Sign: {} }, 200)).toBe(signKey(200));
  });
});

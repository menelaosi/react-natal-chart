import { describe, expect, it } from 'vitest';
import { zodiacFromNumber, zodiacNumber, ZODIAC_SIGNS } from './types';

describe('zodiacNumber', () => {
  it('is 1-based, Aries first', () => {
    expect(zodiacNumber('Aries')).toBe(1);
  });

  it('is 12 for the last sign, Pisces', () => {
    expect(zodiacNumber('Pisces')).toBe(12);
  });
});

describe('zodiacFromNumber', () => {
  it('is the inverse of zodiacNumber for every sign', () => {
    for (const sign of ZODIAC_SIGNS) {
      expect(zodiacFromNumber(zodiacNumber(sign))).toBe(sign);
    }
  });

  it('wraps 13 back around to Aries', () => {
    expect(zodiacFromNumber(13)).toBe('Aries');
  });
});

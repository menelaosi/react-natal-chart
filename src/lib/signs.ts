import { getSign } from './geometry';
import type { ZodiacSign } from '../types';

/** Lowercase sign key (`'aries'`), matching the server's astrology_signs.key. */
export function signKey(degrees: number): string {
  return getSign(degrees).toLowerCase();
}

/** A library object carrying its own resolved Sign — a celestial body/point or an angle. */
export type Signed = { Sign?: { key?: string } };

/** The library's own Sign.key when `point` has one, else computed from degrees. */
export function signKeyOf(point: Signed | undefined, degree: number): string {
  return point?.Sign?.key ?? signKey(degree);
}

/** Capitalizes a lowercase sign key back to its ZodiacSign label, e.g. 'aries' -> 'Aries'. */
export function zodiacSignFromKey(key: string): ZodiacSign {
  return (key.charAt(0).toUpperCase() + key.slice(1)) as ZodiacSign;
}

import type { Horoscope } from 'circular-natal-horoscope-js';
import { Planet } from '../types';
import { calculateExactness } from './aspectStyle';
import { angularDistance } from './geometry';
import { getCelestialBody, longitudeOf, longitudeOfMidheavenAscendant } from './horoscope';

/** Exact separation, in degrees, for each major aspect. */
export const MAJOR_ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

// Transit orbs are deliberately tighter than natal ones — a day reading should
// only surface transits that are actually live now, not every loose contact.
const TRANSIT_ORBS: Record<string, number> = {
  conjunction: 4,
  sextile: 2,
  square: 3,
  trine: 3,
  opposition: 4,
};

// How much weight a transiting body carries: the slower it moves, the rarer and
// more defining the transit, so Pluto outranks the Moon by a wide margin.
const TRANSITING_WEIGHT: Record<string, number> = {
  pluto: 10,
  neptune: 9,
  uranus: 9,
  saturn: 8,
  jupiter: 6,
  chiron: 5,
  nnode: 5,
  mars: 4,
  sun: 4,
  venus: 3,
  mercury: 3,
  lilith: 3,
  moon: 2,
};

// A hit to a personal point (luminaries, the rising/MC axis) lands harder than
// one to an outer planet buried in the natal chart.
const NATAL_WEIGHT: Record<string, number> = {
  sun: 3,
  moon: 3,
  ascendant: 3,
  midheaven: 3,
  mercury: 2,
  venus: 2,
  mars: 2,
};

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 3,
  opposition: 3,
  square: 3,
  trine: 2,
  sextile: 1.5,
};

export type TransitContact = {
  transiting: string; // Planet key of the moving body (Planet value: 'mars', 'nnode', …).
  natal: string; // Natal point it contacts: a Planet value, or 'ascendant' / 'midheaven'.
  type: string;
  orb: number; // Degrees from exact right now.
  applying: boolean; // true = tightening toward exact (intensifying), false = separating.
};

/** Widest orb (degrees) a transit of this type is reported within. */
export function transitAspectMaxOrb(type: string): number {
  return TRANSIT_ORBS[type] ?? 3;
}

function bodyLongitude(horoscope: Horoscope, planet: Planet): number | undefined {
  return longitudeOf(getCelestialBody(horoscope, planet));
}

/** Natal longitudes of every body plus the Ascendant/MC axis, keyed as the reading expects. */
function natalLongitudes(natal: Horoscope): Record<string, number> {
  const longitudes: Record<string, number> = {};

  for (const planet of Object.values(Planet)) {
    const longitude = bodyLongitude(natal, planet);
    if (longitude != null) longitudes[planet] = longitude;
  }

  return longitudeOfMidheavenAscendant(natal, longitudes);
}

/**
 * Every major aspect a transiting body currently makes to a natal point, within
 * the tight transit orbs. `transitNext` is the same sky one day later — comparing
 * the two orbs is how we tell an applying transit from a separating one.
 */
export function getTransitContacts(
  natal: Horoscope,
  transitNow: Horoscope,
  transitNext: Horoscope,
): TransitContact[] {
  const natalPoints = natalLongitudes(natal);
  const contacts: TransitContact[] = [];

  for (const transiting of Object.values(Planet)) {
    const now = bodyLongitude(transitNow, transiting);
    const next = bodyLongitude(transitNext, transiting);

    if (now == null) continue;

    for (const [natalKey, natalLongitude] of Object.entries(natalPoints)) {
      // A body does not aspect its own natal position in a day reading.
      if (natalKey === transiting) continue;

      for (const [type, exact] of Object.entries(MAJOR_ASPECT_ANGLES)) {
        const orb = Math.abs(angularDistance(now, natalLongitude) - exact);
        if (orb > TRANSIT_ORBS[type]) continue;

        const orbNext =
          next == null ? orb : Math.abs(angularDistance(next, natalLongitude) - exact);

        contacts.push({ transiting, natal: natalKey, type, orb, applying: orbNext < orb });
      }
    }
  }

  return contacts;
}

/** Significance score — bigger is more worth leading the reading with. */
function score({ transiting, natal, type, orb, applying }: TransitContact): number {
  return (
    (TRANSITING_WEIGHT[transiting] ?? 3) *
    (NATAL_WEIGHT[natal] ?? 1) *
    (ASPECT_WEIGHT[type] ?? 1) *
    (1 + calculateExactness(orb, transitAspectMaxOrb(type))) *
    (applying ? 1.15 : 1)
  );
}

/** Contacts ordered most significant first, so the prompt and UI lead with them. */
export function rankTransitContacts(contacts: TransitContact[]): TransitContact[] {
  return [...contacts].sort((a, b) => score(b) - score(a));
}

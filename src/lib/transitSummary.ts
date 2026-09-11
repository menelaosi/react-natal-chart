import type { Horoscope } from 'circular-natal-horoscope-js';
import { Planet, type PlaceInput } from '../types';
import { normalizeAngle } from './geometry';
import { cuspLongitude, getCelestialBody, isRetrograde, longitudeOf } from './horoscope';
import { signKeyOf } from './signs';
import { getTransitContacts, rankTransitContacts, type TransitContact } from './transits';

/** Where and when the transiting chart is anchored. */
export type TransitFrame = {
  at: string; // ISO instant the transit chart is cast for.
  date: string; // Calendar day (YYYY-MM-DD) the reading is for.
  location: PlaceInput; // Birthplace, or the browser's current location when the user opts in.
};

export type TransitingPlacement = {
  body: Planet;
  sign: string;
  degreeInSign: number;
  retrograde: boolean;
  natalHouse: number | null; // Natal house the transiting body is currently passing through.
};

export type TransitSummary = TransitFrame & {
  transitingPlacements: TransitingPlacement[];
  contacts: TransitContact[]; // Most significant first
};

/** Which natal house (whole-sign, so 30° wide) a longitude falls in. */
function natalHouseOf({ Houses }: Horoscope, longitude: number): number | null {
  if (!Array.isArray(Houses)) return null;

  for (let i = 0; i < Houses.length; i += 1) {
    const { id } = Houses[i];
    const decimalDegrees = cuspLongitude(Houses[i]);

    if (typeof decimalDegrees !== 'number') continue;
    if (normalizeAngle(longitude - decimalDegrees) < 30) return id ?? i + 1;
  }

  return null;
}

/**
 * Flattens the natal chart + today's sky (and tomorrow's, for applying/separating)
 * into the payload `/api/astrology/transits` enriches with reference data.
 */
export function buildTransitSummary(
  natal: Horoscope,
  transitNow: Horoscope,
  transitNext: Horoscope,
  frame: TransitFrame,
): TransitSummary {
  const transitingPlacements: TransitingPlacement[] = [];

  for (const body of Object.values(Planet)) {
    const celestialBody = getCelestialBody(transitNow, body);
    const decimalDegrees = longitudeOf(celestialBody);
    if (typeof decimalDegrees !== 'number') continue;

    transitingPlacements.push({
      body,
      sign: signKeyOf(celestialBody, decimalDegrees),
      degreeInSign: decimalDegrees % 30,
      retrograde: isRetrograde(celestialBody),
      natalHouse: natalHouseOf(natal, decimalDegrees),
    });
  }

  return {
    ...frame,
    transitingPlacements,
    contacts: rankTransitContacts(getTransitContacts(natal, transitNow, transitNext)),
  };
}

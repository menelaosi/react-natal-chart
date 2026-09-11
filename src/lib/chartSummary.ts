import type { Horoscope } from 'circular-natal-horoscope-js';
import { Planet, type PlaceInput } from '../types';
import { FULL_CIRCLE, SHIFT_IN_DEGREES } from './geometry';
import { getCelestialBody, isRetrograde, longitudeOf } from './horoscope';
import { signKeyOf, type Signed } from './signs';

// Matches the server's chartSummary zod schema (server/lib/astrology-schema.ts) —
// keep the field name in sync with `placeLabel` there.
export type BirthInput = {
  dateTime: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
};

export type Placement = {
  body: Planet;
  sign: string;
  house: number | null;
  degree: number;
  degreeInSign: number;
  retrograde: boolean;
};

export type AngleSummary = { sign: string; degree: number };

export type AspectSummary = { from: string; to: string; type: string; orb: number };

export type ChartSummary = {
  birth: BirthInput;
  placements: Placement[];
  angles: {
    ascendant: AngleSummary;
    midheaven: AngleSummary;
    descendant: AngleSummary;
    imumCoeli: AngleSummary;
  };
  aspects: AspectSummary[];
};

/** Degrees exactly opposite a point on the wheel (e.g. Descendant from Ascendant). */
function oppositeOf(degrees: number): number {
  return (degrees + SHIFT_IN_DEGREES) % FULL_CIRCLE;
}

function angleAt(degree: number, point?: Signed): AngleSummary {
  return { sign: signKeyOf(point, degree), degree };
}

/**
 * Flattens the library's Horoscope into the compact payload the
 * `/api/astrology/interpret` endpoint enriches with reference data. Takes
 * `dateTime` and `place` separately (rather than one pre-merged object) so
 * `place.label` is explicitly mapped to `birth.placeLabel` here instead of
 * relying on a spread that only works if the field names happen to match.
 */
export function buildChartSummary(
  horoscope: Horoscope,
  dateTime: string,
  { latitude, longitude, label: placeLabel }: PlaceInput,
): ChartSummary {
  const birth: BirthInput = { dateTime, latitude, longitude, placeLabel };

  const placements: Placement[] = [];
  for (const body of Object.values(Planet)) {
    const raw = getCelestialBody(horoscope, body);
    const degree = longitudeOf(raw);
    if (typeof degree !== 'number') continue;

    const house = raw?.House?.id ?? null;
    placements.push({
      body,
      sign: signKeyOf(raw, degree),
      house,
      degree,
      degreeInSign: degree % 30,
      retrograde: isRetrograde(raw),
    });
  }

  const { Ascendant, Midheaven, Aspects } = horoscope;

  const ascDegree = longitudeOf(Ascendant) ?? 0;
  const mcDegree = longitudeOf(Midheaven) ?? 0;

  const aspects: AspectSummary[] = (Aspects?.all ?? [])
    .filter(({ aspectLevel }) => aspectLevel === 'major')
    .map(({ point1Key: from, point2Key: to, aspectKey: type, orb }) => ({ from, to, type, orb }));

  return {
    birth,
    placements,
    angles: {
      ascendant: angleAt(ascDegree, Ascendant),
      midheaven: angleAt(mcDegree, Midheaven),
      descendant: angleAt(oppositeOf(ascDegree)),
      imumCoeli: angleAt(oppositeOf(mcDegree)),
    },
    aspects,
  };
}

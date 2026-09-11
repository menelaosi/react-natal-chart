// Wraps circular-natal-horoscope-js: casting a chart and reading positions
// back out of it.
import { Horoscope, Origin } from 'circular-natal-horoscope-js';
import { Planet, type Coordinates } from '../types';

const CUSTOM_ORBS = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 7,
  sextile: 6,
  quincunx: 5,
  quintile: 1,
  septile: 1,
  'semi-square': 1,
  'semi-sextile': 1,
};

type CelestialBody = {
  ChartPosition?: { Ecliptic?: { DecimalDegrees?: number } };
};

export type Cusp = {
  ChartPosition?: { StartPosition?: { Ecliptic?: { DecimalDegrees?: number } } };
};

export function getHoroscope(date: Date, place: Coordinates): Horoscope {
  const origin = new Origin({
    year: date.getFullYear(),
    month: date.getMonth(), // 0-indexed, which is what the library expects
    date: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    ...place,
  });

  return new Horoscope({
    origin,
    houseSystem: 'whole-sign',
    zodiac: 'tropical',
    aspectTypes: ['major', 'minor'],
    customOrbs: CUSTOM_ORBS,
    language: 'en',
  });
}

// circular-natal-horoscope-js splits its results: the Sun through Pluto plus
// Chiron live in CelestialBodies, while the lunar node and Lilith are in
// CelestialPoints under their own key names.
const CELESTIAL_POINT_KEY: Partial<Record<Planet, string>> = {
  [Planet.NorthNode]: 'northnode',
};

/** The raw library object for a planet/point, from whichever collection holds it. */
export function getCelestialBody({ CelestialBodies, CelestialPoints }: Horoscope, planet: Planet) {
  return CelestialBodies?.[planet] ?? CelestialPoints?.[CELESTIAL_POINT_KEY[planet] ?? planet];
}

/** Whether a body/point from {@link getCelestialBody} is currently retrograde. */
export function isRetrograde(body: ReturnType<typeof getCelestialBody>): boolean {
  return Boolean(body?.isRetrograde);
}

export function longitudeOf(body: CelestialBody | undefined) {
  const longitude = body?.ChartPosition?.Ecliptic?.DecimalDegrees;
  return typeof longitude === 'number' ? longitude : undefined;
}

/** A house cusp's starting ecliptic longitude — same idea as {@link longitudeOf}, one level deeper. */
export function cuspLongitude(cusp: Cusp | undefined) {
  const longitude = cusp?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees;
  return typeof longitude === 'number' ? longitude : undefined;
}

export function longitudeOfMidheavenAscendant(
  { Ascendant, Midheaven }: Horoscope,
  record: Record<string, number>,
) {
  const ascendant = longitudeOf(Ascendant);
  if (ascendant != null) record.ascendant = ascendant;

  const midheaven = longitudeOf(Midheaven);
  if (midheaven != null) record.midheaven = midheaven;

  return record;
}

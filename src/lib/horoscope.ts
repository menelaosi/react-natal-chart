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

// The full set circular-natal-horoscope-js reports from Horoscope.HouseSystems().
export type HouseSystem =
  'equal-house' | 'koch' | 'campanus' | 'placidus' | 'regiomontanus' | 'topocentric' | 'whole-sign';

// From Horoscope.ZodiacSystems() — the library only supports these two.
export type ZodiacSystem = 'tropical' | 'sidereal';

// From Horoscope.AspectLabels() — every aspect falls into one of these two levels.
export type AspectType = 'major' | 'minor';

// Every field circular-natal-horoscope-js' Horoscope constructor accepts
// besides `origin`, which getHoroscope derives from `date` and `place`.
export type HoroscopeOptions = {
  language?: string; // ISO 639-1 code for house/sign/aspect labels
  houseSystem?: HouseSystem;
  zodiac?: ZodiacSystem;
  aspectPoints?: string[]; // which bodies/points can be an aspect's origin
  aspectWithPoints?: string[]; // which bodies/points they can aspect to
  aspectTypes?: AspectType[];
  customOrbs?: Record<string, number>; // orb, in degrees, per aspect key
};

// getHoroscope's defaults; callers override only the fields they care about.
const DEFAULT_HOROSCOPE_OPTIONS: HoroscopeOptions = {
  houseSystem: 'whole-sign',
  zodiac: 'tropical',
  aspectTypes: ['major', 'minor'],
  customOrbs: CUSTOM_ORBS,
  language: 'en',
};

type CelestialBody = {
  ChartPosition?: { Ecliptic?: { DecimalDegrees?: number } };
};

export type Cusp = {
  ChartPosition?: { StartPosition?: { Ecliptic?: { DecimalDegrees?: number } } };
};

/**
 * Casts a chart for a date and place using circular-natal-horoscope-js.
 * @param date - The moment to cast for, in the local time of `place`.
 * @param place - The latitude/longitude the chart is cast for.
 * @param options - Overrides for house system, zodiac, aspects, orbs, and
 * language; any field left out falls back to {@link DEFAULT_HOROSCOPE_OPTIONS}.
 */
export function getHoroscope(
  date: Date,
  place: Coordinates,
  options?: HoroscopeOptions,
): Horoscope {
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
    ...DEFAULT_HOROSCOPE_OPTIONS,
    ...options,
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

/** Get longitude or DecimalDegree */
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

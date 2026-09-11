import { Dignity, Planet, type DefaultDignities, type ZodiacSign } from '../types';
import { getSign, normalizeAngle } from './geometry';

// Essential dignities: whether a planet is especially strong or weak by
// virtue of the sign it's in (rulership / detriment / exaltation / fall), plus
// an exact-exaltation marker for tight orbs to a planet's exaltation degree.
const DIGNITIES_EXACT_EXALTATIONS_DEFAULT: DefaultDignities[] = [
  { name: Planet.Sun, position: 19, orbit: 2 },
  { name: Planet.Moon, position: 33, orbit: 2 },
  { name: Planet.Mercury, position: 33, orbit: 2 },
  { name: Planet.Venus, position: 357, orbit: 2 },
  { name: Planet.Mars, position: 298, orbit: 2 },
  { name: Planet.Jupiter, position: 105, orbit: 2 },
  { name: Planet.Saturn, position: 201, orbit: 2 },
  { name: Planet.NorthNode, position: 63, orbit: 2 },
];

const planetDignities: Record<Planet, Partial<Record<ZodiacSign, Dignity>>> = {
  [Planet.Sun]: {
    Leo: Dignity.Rulership,
    Aquarius: Dignity.Detriment,
    Aries: Dignity.Exaltation,
    Virgo: Dignity.Fall,
  },
  [Planet.Moon]: {
    Cancer: Dignity.Rulership,
    Capricorn: Dignity.Detriment,
    Taurus: Dignity.Exaltation,
    Scorpio: Dignity.Fall,
  },
  [Planet.Mercury]: {
    Gemini: Dignity.Rulership,
    Sagittarius: Dignity.Detriment,
    Virgo: Dignity.Exaltation,
    Pisces: Dignity.Fall,
  },
  [Planet.Venus]: {
    Taurus: Dignity.Rulership,
    Libra: Dignity.Rulership,
    Aries: Dignity.Detriment,
    Scorpio: Dignity.Detriment,
    Pisces: Dignity.Exaltation,
    Virgo: Dignity.Fall,
  },
  [Planet.Mars]: {
    Aries: Dignity.Rulership,
    Scorpio: Dignity.Rulership,
    Taurus: Dignity.Detriment,
    Libra: Dignity.Detriment,
    Capricorn: Dignity.Exaltation,
    Cancer: Dignity.Fall,
  },
  [Planet.Jupiter]: {
    Sagittarius: Dignity.Rulership,
    Pisces: Dignity.Rulership,
    Gemini: Dignity.Detriment,
    Virgo: Dignity.Detriment,
    Cancer: Dignity.Exaltation,
    Capricorn: Dignity.Fall,
  },
  [Planet.Saturn]: {
    Capricorn: Dignity.Rulership,
    Aquarius: Dignity.Rulership,
    Cancer: Dignity.Detriment,
    Leo: Dignity.Detriment,
    Libra: Dignity.Exaltation,
    Aries: Dignity.Fall,
  },
  [Planet.Uranus]: {
    Aquarius: Dignity.Rulership,
    Leo: Dignity.Detriment,
    Scorpio: Dignity.Exaltation,
    Taurus: Dignity.Fall,
  },
  [Planet.Neptune]: {
    Pisces: Dignity.Rulership,
    Virgo: Dignity.Detriment,
    Leo: Dignity.Exaltation,
    Sagittarius: Dignity.Exaltation,
    Aquarius: Dignity.Fall,
    Gemini: Dignity.Fall,
  },
  [Planet.Pluto]: {
    Scorpio: Dignity.Rulership,
    Taurus: Dignity.Detriment,
    Aries: Dignity.Exaltation,
    Libra: Dignity.Fall,
  },
  [Planet.Chiron]: {},
  [Planet.Lilith]: {},
  [Planet.NorthNode]: {},
};

/** Whether `planetPosition` falls within `orbit` degrees of `pointPosition`, wrapping past 0°/360°. */
function hasConjunction(planetPosition: number, pointPosition: number, orbit: number): boolean {
  const halfOrbit = orbit / 2;
  const minimumOrbit = normalizeAngle(pointPosition - halfOrbit);
  const maximumOrbit = normalizeAngle(pointPosition + halfOrbit);

  return minimumOrbit <= maximumOrbit
    ? planetPosition >= minimumOrbit && planetPosition <= maximumOrbit
    : planetPosition >= minimumOrbit || planetPosition <= maximumOrbit;
}

/**
 * Dignities for a planet at a longitude: its essential dignity in that sign
 * (rulership / detriment / exaltation / fall), plus an exact-exaltation marker
 * when it's within orb of its exaltation degree.
 */
export function getDignities(planetName: Planet, planetPosition: number): Dignity[] {
  const result: Dignity[] = [];

  const dignity = planetDignities[planetName]?.[getSign(planetPosition)];
  if (dignity) result.push(dignity);

  for (const { name, position, orbit } of DIGNITIES_EXACT_EXALTATIONS_DEFAULT) {
    if (planetName === name && hasConjunction(planetPosition, position, orbit)) {
      result.push(Dignity.ExactExaltation);
    }
  }

  return result;
}

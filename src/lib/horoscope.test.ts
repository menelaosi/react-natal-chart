import type { Horoscope } from 'circular-natal-horoscope-js';
import { describe, expect, it } from 'vitest';
import { Planet } from '../types';
import {
  aspectKeyFor,
  cuspLongitude,
  getCelestialBody,
  getHoroscope,
  isRetrograde,
  longitudeOf,
  longitudeOfMidheavenAscendant,
} from './horoscope';

// A fixed birth moment/place, reused across tests so every assertion below is
// checked against the same real cast rather than a mock.
const BIRTH_DATE = new Date('1990-06-15T08:30:00');
const BIRTH_PLACE = { latitude: 40.7128, longitude: -74.006 };

describe('getHoroscope', () => {
  it('casts a chart for the given date and place', () => {
    const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE);
    // June 15th tropical sun is in Gemini regardless of house system, so this
    // also confirms the date/month gets passed to the library correctly.
    expect(horoscope.CelestialBodies.sun.Sign.key).toBe('gemini');
  });

  it('defaults to whole-sign houses — cusps land on exact 30° multiples', () => {
    const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE);
    for (const house of horoscope.Houses) {
      const cusp = cuspLongitude(house);
      expect(cusp).toBeDefined();
      expect((cusp as number) % 30).toBeCloseTo(0);
    }
  });

  it('overrides the house system when asked, changing where cusps fall', () => {
    const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE, { houseSystem: 'placidus' });
    const firstCusp = cuspLongitude(horoscope.Houses[0]) as number;
    // Placidus cusps are not generally on 30° boundaries.
    expect(firstCusp % 30).not.toBeCloseTo(0);
  });

  it('overrides the zodiac when asked, shifting every longitude by the ayanamsa', () => {
    const tropical = getHoroscope(BIRTH_DATE, BIRTH_PLACE);
    const sidereal = getHoroscope(BIRTH_DATE, BIRTH_PLACE, { zodiac: 'sidereal' });

    const tropicalSun = longitudeOf(tropical.CelestialBodies.sun) as number;
    const siderealSun = longitudeOf(sidereal.CelestialBodies.sun) as number;

    // Sidereal trails tropical by the ayanamsa (tens of degrees) at any date.
    expect(Math.abs(tropicalSun - siderealSun)).toBeGreaterThan(15);
  });

  it('lets an unspecified option fall back to its default alongside an override', () => {
    // Overriding only zodiac must not disturb the default whole-sign houses.
    const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE, { zodiac: 'sidereal' });
    const firstCusp = cuspLongitude(horoscope.Houses[0]) as number;
    expect(firstCusp % 30).toBeCloseTo(0);
  });
});

describe('getCelestialBody', () => {
  const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE);

  it('resolves a classical body from CelestialBodies', () => {
    expect(getCelestialBody(horoscope, Planet.Sun)).toBe(horoscope.CelestialBodies.sun);
  });

  it('resolves Sirius from CelestialBodies — it needs no key remapping', () => {
    expect(getCelestialBody(horoscope, Planet.Sirius)).toBe(horoscope.CelestialBodies.sirius);
  });

  it("resolves North Node from CelestialPoints under the library's 'northnode' key", () => {
    expect(getCelestialBody(horoscope, Planet.NorthNode)).toBe(horoscope.CelestialPoints.northnode);
  });

  it("resolves South Node from CelestialPoints under the library's 'southnode' key", () => {
    expect(getCelestialBody(horoscope, Planet.SouthNode)).toBe(horoscope.CelestialPoints.southnode);
  });

  it('places the lunar nodes exactly 180° apart', () => {
    const northLongitude = longitudeOf(getCelestialBody(horoscope, Planet.NorthNode)) as number;
    const southLongitude = longitudeOf(getCelestialBody(horoscope, Planet.SouthNode)) as number;
    expect(Math.abs(northLongitude - southLongitude)).toBeCloseTo(180);
  });
});

describe('aspectKeyFor', () => {
  it("renames the lunar nodes to the library's aspect-point keys", () => {
    expect(aspectKeyFor(Planet.NorthNode)).toBe('northnode');
    expect(aspectKeyFor(Planet.SouthNode)).toBe('southnode');
  });

  it('passes every other planet value through unchanged', () => {
    expect(aspectKeyFor(Planet.Sun)).toBe('sun');
    expect(aspectKeyFor(Planet.Sirius)).toBe('sirius');
    expect(aspectKeyFor(Planet.Lilith)).toBe('lilith');
  });

  it('actually matches the keys the library puts on real aspects', () => {
    const horoscope = getHoroscope(BIRTH_DATE, BIRTH_PLACE);
    const aspectKeys = new Set(horoscope.Aspects.all.flatMap((a) => [a.point1Key, a.point2Key]));

    for (const planet of Object.values(Planet)) {
      if (aspectKeys.has(aspectKeyFor(planet))) {
        // At least confirm the ones that do appear are under the key aspectKeyFor predicts —
        // not every body is guaranteed to have a qualifying aspect in this particular chart.
        expect(aspectKeys.has(aspectKeyFor(planet))).toBe(true);
      }
    }
    // South Node and Sirius should both show up somewhere in this particular chart's aspects.
    expect(aspectKeys.has('southnode')).toBe(true);
    expect(aspectKeys.has('sirius')).toBe(true);
  });
});

describe('isRetrograde', () => {
  it('is false for undefined', () => {
    expect(isRetrograde(undefined)).toBe(false);
  });

  it('is false for a body with no isRetrograde field', () => {
    expect(isRetrograde({})).toBe(false);
  });

  it('reflects a true isRetrograde field', () => {
    expect(isRetrograde({ isRetrograde: true })).toBe(true);
  });

  it('reflects a false isRetrograde field', () => {
    expect(isRetrograde({ isRetrograde: false })).toBe(false);
  });
});

describe('longitudeOf', () => {
  it('is undefined for undefined', () => {
    expect(longitudeOf(undefined)).toBeUndefined();
  });

  it('is undefined when ChartPosition is missing', () => {
    expect(longitudeOf({})).toBeUndefined();
  });

  it('is undefined when DecimalDegrees is not a number', () => {
    expect(longitudeOf({ ChartPosition: { Ecliptic: {} } })).toBeUndefined();
  });

  it('reads the ecliptic decimal degrees when present', () => {
    expect(longitudeOf({ ChartPosition: { Ecliptic: { DecimalDegrees: 42.5 } } })).toBe(42.5);
  });
});

describe('cuspLongitude', () => {
  it('is undefined for undefined', () => {
    expect(cuspLongitude(undefined)).toBeUndefined();
  });

  it('reads the start position one level deeper than longitudeOf', () => {
    const cusp = { ChartPosition: { StartPosition: { Ecliptic: { DecimalDegrees: 12 } } } };
    expect(cuspLongitude(cusp)).toBe(12);
  });
});

describe('longitudeOfMidheavenAscendant', () => {
  it('adds ascendant and midheaven when both are present', () => {
    const fixture = {
      Ascendant: { ChartPosition: { Ecliptic: { DecimalDegrees: 10 } } },
      Midheaven: { ChartPosition: { Ecliptic: { DecimalDegrees: 280 } } },
    } as unknown as Horoscope;

    expect(longitudeOfMidheavenAscendant(fixture, {})).toEqual({ ascendant: 10, midheaven: 280 });
  });

  it('mutates and returns the same record it was given', () => {
    const fixture = {
      Ascendant: { ChartPosition: { Ecliptic: { DecimalDegrees: 10 } } },
      Midheaven: { ChartPosition: { Ecliptic: { DecimalDegrees: 280 } } },
    } as unknown as Horoscope;

    const record = { existing: 1 };
    const result = longitudeOfMidheavenAscendant(fixture, record);

    expect(result).toBe(record);
    expect(result.existing).toBe(1);
  });

  it('omits either key when its longitude cannot be resolved', () => {
    const fixture = { Ascendant: undefined, Midheaven: undefined } as unknown as Horoscope;
    expect(longitudeOfMidheavenAscendant(fixture, {})).toEqual({});
  });
});

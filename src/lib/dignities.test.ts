import { describe, expect, it } from 'vitest';
import { Dignity, Planet } from '../types';
import { getDignities } from './dignities';

describe('getDignities', () => {
  it("reports a planet's rulership in its own sign", () => {
    // The Sun rules Leo (120°-150°).
    expect(getDignities(Planet.Sun, 135)).toContain(Dignity.Rulership);
  });

  it("reports a planet's detriment opposite its rulership", () => {
    // The Sun is in detriment in Aquarius (300°-330°).
    expect(getDignities(Planet.Sun, 315)).toContain(Dignity.Detriment);
  });

  it('reports fall in its fall sign', () => {
    // The Sun falls in Virgo (150°-180°).
    expect(getDignities(Planet.Sun, 165)).toContain(Dignity.Fall);
  });

  it('reports no dignity in a neutral sign', () => {
    // The Sun in Cancer (90°-120°) has none of the four essential dignities.
    expect(getDignities(Planet.Sun, 100)).toEqual([]);
  });

  it('adds an exact-exaltation marker within orb of the exact degree', () => {
    // The Sun exalts in Aries with an exact degree of 19°, orb 2 (±1°).
    const dignities = getDignities(Planet.Sun, 19);
    expect(dignities).toContain(Dignity.Exaltation);
    expect(dignities).toContain(Dignity.ExactExaltation);
  });

  it('does not add the exact-exaltation marker outside its orb', () => {
    // Still exalted (Aries), but 5° away from the exact 19° degree — outside the ±1° orb.
    const dignities = getDignities(Planet.Sun, 24);
    expect(dignities).toContain(Dignity.Exaltation);
    expect(dignities).not.toContain(Dignity.ExactExaltation);
  });

  it('includes the boundary degree of an orb (inclusive on both ends)', () => {
    // 19° ± 1° orb: 18° and 20° are the inclusive edges.
    expect(getDignities(Planet.Sun, 18)).toContain(Dignity.ExactExaltation);
    expect(getDignities(Planet.Sun, 20)).toContain(Dignity.ExactExaltation);
  });

  it('gives the lunar North Node an exact-exaltation degree despite no sign dignities', () => {
    // North Node has no rulership table, but does have an exact-exaltation degree (63°).
    expect(getDignities(Planet.NorthNode, 63)).toEqual([Dignity.ExactExaltation]);
  });

  it('assigns no dignities at all to points with neither table (South Node, Sirius, Chiron, Lilith)', () => {
    for (const planet of [Planet.SouthNode, Planet.Sirius, Planet.Chiron, Planet.Lilith]) {
      // Sweep a handful of signs — none of these should ever produce a dignity.
      expect(getDignities(planet, 10)).toEqual([]);
      expect(getDignities(planet, 100)).toEqual([]);
      expect(getDignities(planet, 250)).toEqual([]);
    }
  });
});

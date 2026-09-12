import { describe, expect, it } from 'vitest';
import { Planet, type PlaceInput } from '../types';
import { buildChartSummary } from './chartSummary';
import { getHoroscope } from './horoscope';

const BIRTH_DATE_TIME = '1990-06-15T08:30:00';
const PLACE: PlaceInput = { latitude: 40.7128, longitude: -74.006, label: 'New York, NY' };
const horoscope = getHoroscope(new Date(BIRTH_DATE_TIME), PLACE);
const summary = buildChartSummary(horoscope, BIRTH_DATE_TIME, PLACE);

describe('buildChartSummary', () => {
  it('passes birth data through, mapping the place label to placeLabel', () => {
    expect(summary.birth).toEqual({
      dateTime: BIRTH_DATE_TIME,
      latitude: PLACE.latitude,
      longitude: PLACE.longitude,
      placeLabel: PLACE.label,
    });
  });

  it('includes a placement for every body the library reports a longitude for', () => {
    const bodies = summary.placements.map((p) => p.body);
    expect(bodies).toContain(Planet.Sun);
    // Both new points must actually make it into the summary the app sends on.
    expect(bodies).toContain(Planet.SouthNode);
    expect(bodies).toContain(Planet.Sirius);
  });

  it("derives degreeInSign as the placement's degree mod 30", () => {
    for (const { degree, degreeInSign } of summary.placements) {
      expect(degreeInSign).toBeCloseTo(degree % 30);
      expect(degreeInSign).toBeGreaterThanOrEqual(0);
      expect(degreeInSign).toBeLessThan(30);
    }
  });

  it('resolves the four chart angles, descendant/IC opposite ascendant/midheaven', () => {
    const { ascendant, midheaven, descendant, imumCoeli } = summary.angles;

    expect((descendant.degree - ascendant.degree + 360) % 360).toBeCloseTo(180);
    expect((imumCoeli.degree - midheaven.degree + 360) % 360).toBeCloseTo(180);
  });

  it('includes only major aspects, matching the horoscope’s own major aspect count', () => {
    const majorCount = (horoscope.Aspects?.all ?? []).filter(
      ({ aspectLevel }) => aspectLevel === 'major',
    ).length;

    expect(summary.aspects).toHaveLength(majorCount);
  });
});

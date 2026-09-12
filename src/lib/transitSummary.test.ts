import { describe, expect, it } from 'vitest';
import { Planet, type PlaceInput } from '../types';
import { getHoroscope } from './horoscope';
import { getTransitContacts, rankTransitContacts } from './transits';
import { buildTransitSummary, type TransitFrame } from './transitSummary';

const BIRTH_DATE = new Date('1990-06-15T08:30:00');
const PLACE: PlaceInput = { latitude: 40.7128, longitude: -74.006, label: 'New York, NY' };

const natal = getHoroscope(BIRTH_DATE, PLACE);
const transitNow = getHoroscope(new Date(), PLACE);
const transitNext = getHoroscope(new Date(Date.now() + 86_400_000), PLACE);

const frame: TransitFrame = { at: new Date().toISOString(), date: '2024-01-01', location: PLACE };
const summary = buildTransitSummary(natal, transitNow, transitNext, frame);

describe('buildTransitSummary', () => {
  it('passes the frame fields through unchanged', () => {
    expect(summary.at).toBe(frame.at);
    expect(summary.date).toBe(frame.date);
    expect(summary.location).toEqual(frame.location);
  });

  it('includes a transiting placement for every body currently reporting a longitude', () => {
    const bodies = summary.transitingPlacements.map((p) => p.body);
    expect(bodies).toContain(Planet.Sun);
    expect(bodies).toContain(Planet.SouthNode);
    expect(bodies).toContain(Planet.Sirius);
  });

  it('assigns every transiting placement to one of the twelve natal houses', () => {
    for (const { natalHouse } of summary.transitingPlacements) {
      expect(natalHouse).not.toBeNull();
      expect(natalHouse).toBeGreaterThanOrEqual(1);
      expect(natalHouse).toBeLessThanOrEqual(12);
    }
  });

  it('wires its contacts through getTransitContacts + rankTransitContacts, in that order', () => {
    // Ranking logic itself is covered in transits.test.ts; this just confirms
    // buildTransitSummary actually calls both rather than returning raw/unranked contacts.
    const expected = rankTransitContacts(getTransitContacts(natal, transitNow, transitNext));
    expect(summary.contacts).toEqual(expected);
  });
});

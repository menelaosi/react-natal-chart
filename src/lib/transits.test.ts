import { describe, expect, it } from 'vitest';
import { getHoroscope } from './horoscope';
import {
  getTransitContacts,
  rankTransitContacts,
  transitAspectMaxOrb,
  type TransitContact,
} from './transits';

const BIRTH_DATE = new Date('1990-06-15T08:30:00');
const BIRTH_PLACE = { latitude: 40.7128, longitude: -74.006 };

function contact(overrides: Partial<TransitContact>): TransitContact {
  return {
    transiting: 'moon',
    natal: 'sun',
    type: 'conjunction',
    orb: 1,
    applying: true,
    ...overrides,
  };
}

describe('transitAspectMaxOrb', () => {
  it('returns the configured orb for a known aspect type', () => {
    expect(transitAspectMaxOrb('conjunction')).toBe(4);
    expect(transitAspectMaxOrb('sextile')).toBe(2);
  });

  it('falls back to 3° for an unrecognized aspect type', () => {
    expect(transitAspectMaxOrb('quincunx')).toBe(3);
  });
});

describe('getTransitContacts', () => {
  const natal = getHoroscope(BIRTH_DATE, BIRTH_PLACE);

  it('never reports a body aspecting its own natal position', () => {
    // Using the natal chart as its own "sky" means every body is exactly
    // conjunct where it started — the self-aspect skip must filter all of these out.
    const contacts = getTransitContacts(natal, natal, natal);
    expect(contacts.every(({ transiting, natal: natalKey }) => transiting !== natalKey)).toBe(true);
  });

  it('only reports aspects within their configured transit orb', () => {
    const contacts = getTransitContacts(natal, natal, natal);
    for (const { type, orb } of contacts) {
      expect(orb).toBeLessThanOrEqual(transitAspectMaxOrb(type));
    }
  });

  it('never marks a contact as applying when the sky has not moved', () => {
    // transitNow and transitNext are identical, so no orb can have tightened.
    const contacts = getTransitContacts(natal, natal, natal);
    expect(contacts.every(({ applying }) => applying === false)).toBe(true);
  });
});

describe('rankTransitContacts', () => {
  it('ranks a heavier transiting body above a lighter one, all else equal', () => {
    const light = contact({ transiting: 'moon' });
    const heavy = contact({ transiting: 'pluto' });

    expect(rankTransitContacts([light, heavy])).toEqual([heavy, light]);
  });

  it('ranks a tighter orb above a looser one, all else equal', () => {
    const loose = contact({ orb: 3.5 });
    const tight = contact({ orb: 0.2 });

    expect(rankTransitContacts([loose, tight])).toEqual([tight, loose]);
  });

  it('ranks an applying contact above an equivalent separating one', () => {
    const separating = contact({ applying: false });
    const applying = contact({ applying: true });

    expect(rankTransitContacts([separating, applying])).toEqual([applying, separating]);
  });

  it('ranks a hit to a personal point above the same hit to an outer planet', () => {
    const outer = contact({ natal: 'saturn' });
    const personal = contact({ natal: 'sun' });

    expect(rankTransitContacts([outer, personal])).toEqual([personal, outer]);
  });

  it('does not mutate the input array', () => {
    const contacts = [contact({ transiting: 'moon' }), contact({ transiting: 'pluto' })];
    const original = [...contacts];

    rankTransitContacts(contacts);

    expect(contacts).toEqual(original);
  });
});

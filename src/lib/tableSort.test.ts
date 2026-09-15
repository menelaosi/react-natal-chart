import { describe, expect, it } from 'vitest';
import { Planet } from '../types';
import type { AspectSummary, Placement } from './chartSummary';
import { sortAspects, sortPlacements } from './tableSort';

function placement(body: Planet, house: number | null): Placement {
  return { body, sign: 'aries', house, degree: 0, degreeInSign: 0, retrograde: false };
}

describe('sortPlacements', () => {
  it('orders by canonical importance (enum declaration order)', () => {
    const placements = [placement(Planet.Moon, 4), placement(Planet.Sun, 1)];
    const sorted = sortPlacements(placements, 'importance');
    expect(sorted.map((p) => p.body)).toEqual([Planet.Sun, Planet.Moon]);
  });

  it('orders by ascending house number', () => {
    const placements = [placement(Planet.Sun, 10), placement(Planet.Moon, 2)];
    const sorted = sortPlacements(placements, 'house');
    expect(sorted.map((p) => p.body)).toEqual([Planet.Moon, Planet.Sun]);
  });

  it('sorts a null house last', () => {
    const placements = [placement(Planet.Sun, null), placement(Planet.Moon, 2)];
    const sorted = sortPlacements(placements, 'house');
    expect(sorted.map((p) => p.body)).toEqual([Planet.Moon, Planet.Sun]);
  });

  it('does not mutate the input array', () => {
    const placements = [placement(Planet.Moon, 4), placement(Planet.Sun, 1)];
    sortPlacements(placements, 'importance');
    expect(placements.map((p) => p.body)).toEqual([Planet.Moon, Planet.Sun]);
  });
});

function aspect(from: string, to: string, orb: number): AspectSummary {
  return { from, to, type: 'trine', orb };
}

describe('sortAspects', () => {
  it('orders by ascending orb (tightest first)', () => {
    const aspects = [aspect('sun', 'moon', 3), aspect('venus', 'mars', 0.5)];
    const sorted = sortAspects(aspects, 'orb');
    expect(sorted.map((a) => a.orb)).toEqual([0.5, 3]);
  });

  it('orders by importance of the from body', () => {
    const aspects = [aspect('moon', 'mars', 1), aspect('sun', 'venus', 1)];
    const sorted = sortAspects(aspects, 'importance');
    expect(sorted.map((a) => a.from)).toEqual(['sun', 'moon']);
  });

  it('breaks importance ties on the to body', () => {
    const aspects = [aspect('sun', 'mars', 1), aspect('sun', 'moon', 1)];
    const sorted = sortAspects(aspects, 'importance');
    expect(sorted.map((a) => a.to)).toEqual(['moon', 'mars']);
  });

  it('maps the node library keys correctly for importance sorting', () => {
    // 'northnode'/'southnode' are the library keys for NorthNode/SouthNode,
    // which sort after the standard planets in Planet's declaration order.
    const aspects = [aspect('northnode', 'sun', 1), aspect('sun', 'moon', 1)];
    const sorted = sortAspects(aspects, 'importance');
    expect(sorted.map((a) => a.from)).toEqual(['sun', 'northnode']);
  });
});

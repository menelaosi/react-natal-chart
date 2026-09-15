import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Placement } from '../lib/chartSummary';
import { Planet } from '../types';
import PlacementTable from './PlacementTable';

function placement(overrides: Partial<Placement> = {}): Placement {
  return {
    body: Planet.Sun,
    sign: 'aries',
    house: 1,
    degree: 15,
    degreeInSign: 15,
    retrograde: false,
    ...overrides,
  };
}

describe('PlacementTable', () => {
  it('draws one row per placement', () => {
    const html = renderToStaticMarkup(
      <PlacementTable placements={[placement(), placement({ body: Planet.Moon })]} />,
    );
    expect(html.match(/<tr/g)).toHaveLength(3); // header row + 2 data rows
  });

  it('renders the planet label, sign, house, degree, and retrograde flag', () => {
    const html = renderToStaticMarkup(
      <PlacementTable
        placements={[
          placement({
            body: Planet.Mercury,
            sign: 'gemini',
            house: 3,
            degreeInSign: 12.7,
            retrograde: true,
          }),
        ]}
      />,
    );
    expect(html).toContain('Mercury');
    expect(html).toContain('Gemini');
    expect(html).toContain('3');
    expect(html).toContain('13°');
    expect(html).toContain('R');
  });

  it('renders a dash for a placement with no house', () => {
    const html = renderToStaticMarkup(<PlacementTable placements={[placement({ house: null })]} />);
    expect(html).toContain('—');
  });

  it('defaults to importance order', () => {
    const html = renderToStaticMarkup(
      <PlacementTable
        placements={[placement({ body: Planet.Moon }), placement({ body: Planet.Sun })]}
      />,
    );
    expect(html.indexOf('Sun')).toBeLessThan(html.indexOf('Moon'));
  });

  it('sorts by house when requested', () => {
    const html = renderToStaticMarkup(
      <PlacementTable
        placements={[
          placement({ body: Planet.Sun, house: 10 }),
          placement({ body: Planet.Moon, house: 2 }),
        ]}
        sortBy="house"
      />,
    );
    expect(html.indexOf('Moon')).toBeLessThan(html.indexOf('Sun'));
  });

  it('draws no data rows for an empty placement list', () => {
    const html = renderToStaticMarkup(<PlacementTable placements={[]} />);
    expect(html.match(/<tr/g)).toHaveLength(1); // header row only
  });
});

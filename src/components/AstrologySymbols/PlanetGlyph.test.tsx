import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BLACK } from '../../lib/theme';
import { Planet, SIGN_COLOR } from '../../types';
import PlanetGlyph from './PlanetGlyph';

describe('PlanetGlyph', () => {
  it('colors the glyph by the zodiac sign its longitude falls in', () => {
    // 45° is early Taurus.
    const html = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={45} />,
    );
    expect(html).toContain(`stroke="${SIGN_COLOR.Taurus}"`);
  });

  it('recolors the same body when its longitude moves into a different sign', () => {
    const aries = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={0} />,
    );
    const taurus = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={45} />,
    );
    expect(aries).toContain(`stroke="${SIGN_COLOR.Aries}"`);
    expect(aries).not.toBe(taurus);
  });

  it('draws no halo group when halo is not given', () => {
    const html = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={0} />,
    );
    expect(html).not.toContain('opacity="0.5"');
  });

  it('draws a soft halo stroke, in the halo color, behind the sign-colored glyph', () => {
    const html = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={0} halo={BLACK} />,
    );
    expect(html).toContain('opacity="0.5"');
    expect(html).toContain(`stroke="${BLACK}"`); // the halo pass
    expect(html).toContain(`stroke="${SIGN_COLOR.Aries}"`); // the real, sign-colored glyph
  });

  it('draws the halo stroke wider than the base glyph stroke', () => {
    const html = renderToStaticMarkup(
      <PlanetGlyph planet={Planet.Sun} point={{ x: 0, y: 0 }} longitude={0} halo={BLACK} />,
    );
    // Halo = POINTS_STROKE(1.8) + 2 = 3.8; the base glyph keeps the default 1.8.
    expect(html).toContain('stroke-width="3.8"');
    expect(html).toContain('stroke-width="1.8"');
  });
});

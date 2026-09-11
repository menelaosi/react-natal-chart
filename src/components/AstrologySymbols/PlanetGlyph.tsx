import { getSign } from '../../lib/geometry';
import { BLACK, POINTS_STROKE } from '../../lib/theme';
import type { Planet, Point } from '../../types';
import { SIGN_COLOR } from '../../types';
import Glyph from './Glyph';
import { PLANET_GLYPHS } from './glyphs/planetGlyphs';

type PlanetGlyphProps = {
  readonly planet: Planet;
  readonly point: Point;
  readonly longitude: number; // Ecliptic longitude, used to color the glyph by the sign it falls in.
  /**
   * Optional color drawn as a soft, wider stroke behind the glyph. Lifts a
   * pale sign color (Libra, Gemini…) off a busy or light ground — used on the
   * transit band.
   */
  readonly halo?: string;
};

/** Draws a planet or point glyph, coloured by the zodiac sign of its longitude. */
function PlanetGlyph({ planet, point, longitude, halo }: PlanetGlyphProps) {
  const spec = PLANET_GLYPHS[planet];
  return (
    <>
      {halo && (
        <g opacity={0.5}>
          <Glyph point={point} spec={spec} stroke={halo} strokeWidth={Number(POINTS_STROKE) + 2} />
        </g>
      )}
      <Glyph point={point} spec={spec} stroke={SIGN_COLOR[getSign(longitude)] ?? BLACK} />
    </>
  );
}

export default PlanetGlyph;

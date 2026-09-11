import { BLACK, CUSPS_STROKE } from '../../lib/theme';
import type { CuspNumber, Point } from '../../types';
import Glyph from './Glyph';
import { CUSP_GLYPHS } from './glyphs/cuspGlyphs';

type CuspGlyphProps = {
  readonly house: CuspNumber;
  readonly point: Point;
};

/** Draws a house cusp numeral (1-12) at the given anchor point. */
function CuspGlyph({ house, point }: CuspGlyphProps) {
  return (
    <Glyph point={point} spec={CUSP_GLYPHS[house]} stroke={BLACK} strokeWidth={CUSPS_STROKE} />
  );
}

export default CuspGlyph;

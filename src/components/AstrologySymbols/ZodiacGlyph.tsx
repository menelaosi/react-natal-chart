import type { Point, ZodiacSign } from '../../types';
import { SIGN_COLOR } from '../../types';
import Glyph from './Glyph';
import { ZODIAC_GLYPHS } from './glyphs/zodiacGlyphs';

type ZodiacGlyphProps = {
  readonly sign: ZodiacSign;
  readonly point: Point;
};

/** Draws a zodiac sign glyph in its sign color at the given anchor point. */
function ZodiacGlyph({ sign, point }: ZodiacGlyphProps) {
  return <Glyph point={point} spec={ZODIAC_GLYPHS[sign]} stroke={SIGN_COLOR[sign]} />;
}

export default ZodiacGlyph;

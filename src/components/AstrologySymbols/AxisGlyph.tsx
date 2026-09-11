import { LIGHT_GRAY, SYMBOL_AXIS_STROKE } from '../../lib/theme';
import type { Axis, Point } from '../../types';
import Glyph from './Glyph';
import { AXIS_GLYPHS } from './glyphs/axisGlyphs';

type AxisGlyphProps = {
  readonly axis: Axis;
  readonly point: Point;
  readonly stroke?: string; // Overrides the default margin grey — the bi-wheel needs a dark label on its light band.
};

/** Draws a chart-angle label (AC / IC / DC / MC) at the given anchor point. */
function AxisGlyph({ axis, point, stroke = LIGHT_GRAY }: AxisGlyphProps) {
  return (
    <Glyph
      point={point}
      spec={AXIS_GLYPHS[axis]}
      stroke={stroke}
      strokeWidth={SYMBOL_AXIS_STROKE}
    />
  );
}

export default AxisGlyph;

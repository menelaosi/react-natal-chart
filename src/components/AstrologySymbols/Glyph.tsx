import { POINTS_STROKE } from '../../lib/theme';
import type { GlyphProps } from './glyphs/types';

/**
 * Renders an astrology glyph as a group of SVG paths. The anchor `point` is
 * shifted by the spec's `(dx, dy)` and rounded to whole pixels; each path body
 * is emitted after a leading `m <origin>`, so specs hold plain relative path
 * data and never repeat the placement arithmetic. An optional `rotate` spins
 * the whole group around that same anchor, for glyphs that reuse another's
 * paths (e.g. South Node = North Node rotated 180°).
 */
function Glyph({
  point: { x, y },
  spec: { dx, dy, paths, rotate },
  stroke,
  strokeWidth = POINTS_STROKE,
}: GlyphProps) {
  const xSum = Math.round(x + dx);
  const ySum = Math.round(y + dy);
  return (
    <g transform={rotate ? `rotate(${rotate}, ${xSum}, ${ySum})` : undefined}>
      {paths.map(({ ox = 0, oy = 0, d }, i) => (
        <path
          key={i}
          d={`m ${xSum + ox},${ySum + oy} ${d}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      ))}
    </g>
  );
}

export default Glyph;

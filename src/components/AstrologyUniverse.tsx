import { getPointPosition, SIGN_ARC } from '../lib/geometry';
import { DARK_GRAY, INNER_CIRCLE_RADIUS_RATIO } from '../lib/theme';
import type { Point } from '../types';
import { ZODIAC_SIGNS } from '../types';
import AstrologySegment from './AstrologySymbols/AstrologySegment';
import ZodiacGlyph from './AstrologySymbols/ZodiacGlyph';

type AstrologyUniverseProps = {
  readonly point: Point;
  readonly shift: number;
  readonly radius: number;
  readonly backgroundRadius: number;
};

/** The zodiac band: 12 sign segments and their coloured glyphs. */
function AstrologyUniverse({ point, shift, radius, backgroundRadius }: AstrologyUniverseProps) {
  const glyphRadius = radius - radius / INNER_CIRCLE_RADIUS_RATIO / 2;

  return (
    <g id="signs">
      {ZODIAC_SIGNS.map((sign, i) => (
        <AstrologySegment
          key={sign}
          point={point}
          radius={radius}
          angleFrom={shift + i * SIGN_ARC}
          angleTo={shift + (i + 1) * SIGN_ARC}
          thickness={backgroundRadius}
          lFlag={0}
          stroke={DARK_GRAY}
          strokeWidth={1}
        />
      ))}
      {ZODIAC_SIGNS.map((sign, i) => (
        <ZodiacGlyph
          key={sign}
          sign={sign}
          point={getPointPosition(point, glyphRadius, shift + SIGN_ARC / 2 + i * SIGN_ARC)}
        />
      ))}
    </g>
  );
}

export default AstrologyUniverse;

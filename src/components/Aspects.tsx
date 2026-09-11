import { aspectLineStyle, type AspectLine } from '../lib/aspectStyle';
import { getPointPosition } from '../lib/geometry';
import { ASPECT_COLOR, NEUTRAL_ASPECT_COLOR } from '../lib/theme';
import type { Point } from '../types';
import AstrologyLine from './AstrologySymbols/AstrologyLine';

type AspectsProps = {
  readonly point: Point;
  readonly radius: number; // radius the chords are anchored at — the inner circle
  readonly shift: number;
  readonly lines: readonly AspectLine[];
};

/**
 * Chords across the inner circle joining the bodies that aspect each other.
 * Color keys the aspect family; each line thins and fades as its orb widens
 * toward the limit, so exact aspects read loudest.
 */
function Aspects({ point, radius, shift, lines }: AspectsProps) {
  return (
    <g id="aspects">
      {lines.map(({ aspect, from, orb, orbUsed, to }, index) => (
        <AstrologyLine
          key={index}
          startingPoint={getPointPosition(point, radius, from + shift)}
          endingPoint={getPointPosition(point, radius, to + shift)}
          stroke={ASPECT_COLOR[aspect] ?? NEUTRAL_ASPECT_COLOR}
          {...aspectLineStyle(orb, orbUsed)}
        />
      ))}
    </g>
  );
}

export default Aspects;

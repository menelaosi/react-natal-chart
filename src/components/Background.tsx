import type { Point } from '../types';
import AstrologySegment from './AstrologySymbols/AstrologySegment';

type BackgroundProps = {
  readonly id: string;
  readonly point: Point;
  readonly radius: number;
  readonly thickness: number;
};

/** The opaque disc behind a wheel (radix or transit), drawn as one wide ring segment. */
function Background({ id, point, radius, thickness }: BackgroundProps) {
  return (
    <g id={id}>
      <AstrologySegment point={point} radius={radius} thickness={thickness} />
    </g>
  );
}

export default Background;

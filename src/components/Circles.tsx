import type { Point } from '../types';
import AstrologyCircle from './AstrologySymbols/AstrologyCircle';

type CirclesProps = {
  readonly point: Point;
  readonly radius: number;
  readonly thickness: number;
  readonly backgroundRadius: number;
};

/** The concentric outline circles that separate the wheel's rings. */
function Circles({ point, radius, thickness, backgroundRadius }: CirclesProps) {
  return (
    <g id="circles">
      <AstrologyCircle point={point} radius={thickness} />
      <AstrologyCircle point={point} radius={radius} />
      <AstrologyCircle point={point} radius={backgroundRadius} />
    </g>
  );
}

export default Circles;

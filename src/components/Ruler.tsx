import { getPointPosition } from '../lib/geometry';
import { CUSPS_STROKE } from '../lib/theme';
import type { Point } from '../types';
import AstrologyCircle from './AstrologySymbols/AstrologyCircle';
import AstrologyLine from './AstrologySymbols/AstrologyLine';

type RulerProps = {
  readonly point: Point;
  readonly startRadius: number;
  readonly rulerRadius: number;
  readonly startAngle: number;
  readonly isTransit?: boolean;
};

function getRulerPositions(
  point: Point,
  startRadius: number,
  endRadius: number,
  startAngle: number,
) {
  const radiusRatio = Math.abs((endRadius - startRadius) / 2);
  const halfRayRadius =
    startRadius <= endRadius ? endRadius - radiusRatio : endRadius + radiusRatio;

  const resultArray = [];
  for (let i = 0; i < 72; i++) {
    const angle = i * 5 + startAngle;

    resultArray.push(
      <AstrologyLine
        key={i}
        startingPoint={getPointPosition(point, startRadius, angle)}
        endingPoint={getPointPosition(point, i % 2 === 0 ? endRadius : halfRayRadius, angle)}
        strokeWidth={CUSPS_STROKE}
      />,
    );
  }

  return resultArray;
}

/** The degree tick ring just inside a wheel's rim (72 ticks, every 5°). */
function Ruler({ point, startRadius, rulerRadius, startAngle, isTransit = false }: RulerProps) {
  // The degree ruler is a band just inside its rim (startRadius), so its ticks
  // sit on the white wheel rather than the dark page margin.
  const endRadius = startRadius - rulerRadius;
  const rulerPositions = getRulerPositions(point, startRadius, endRadius, startAngle);

  return (
    <g id="ruler">
      {rulerPositions}
      <AstrologyCircle
        point={point}
        radius={isTransit ? endRadius : startRadius}
        strokeWidth={CUSPS_STROKE}
      />
    </g>
  );
}

export default Ruler;

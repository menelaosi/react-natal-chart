import { angularDistance, FULL_CIRCLE, getPointPosition } from '../lib/geometry';
import { COLLISION_RADIUS, CUSPS_STROKE, SYMBOL_AXIS_STROKE } from '../lib/theme';
import type { CuspNumber, LocatedPoint, Point } from '../types';
import AstrologyLine from './AstrologySymbols/AstrologyLine';
import CuspGlyph from './AstrologySymbols/CuspGlyph';

type AstrologyCuspsProps = {
  readonly point: Point;
  readonly numbersRadius: number;
  readonly pointRadius: number;
  readonly endDashedLineRadius: number;
  readonly cuspPositions: number[];
  readonly shift: number;
  readonly locatedPoints: LocatedPoint[];
};

function isInCollision(angle: number, locatedPoints: LocatedPoint[]): boolean {
  const collisionRadius = COLLISION_RADIUS / 2;
  return locatedPoints.some(
    ({ angle: pointAngle }) => angularDistance(pointAngle, angle) <= collisionRadius,
  );
}

/** House cusp spokes and their numerals; a spoke near a planet cluster is drawn shorter to clear the glyphs. */
function AstrologyCusps({
  point,
  numbersRadius,
  pointRadius,
  endDashedLineRadius,
  cuspPositions,
  shift,
  locatedPoints,
}: AstrologyCuspsProps) {
  const startRadius = numbersRadius - COLLISION_RADIUS;
  const dashedLineRadius = pointRadius + 2 * COLLISION_RADIUS;

  const radialLine = (fromRadius: number, toRadius: number, angle: number, strokeWidth: number) => (
    <AstrologyLine
      startingPoint={getPointPosition(point, fromRadius, angle)}
      endingPoint={getPointPosition(point, toRadius, angle)}
      strokeWidth={strokeWidth}
    />
  );

  return (
    <g>
      {cuspPositions.map((cuspPosition, i) => {
        const strokeWidth = i % 3 === 0 ? SYMBOL_AXIS_STROKE : CUSPS_STROKE;
        const angle = cuspPosition + shift;
        const collision = isInCollision(angle, locatedPoints);
        const innerRadius = collision ? pointRadius - COLLISION_RADIUS : endDashedLineRadius;
        const showDashedLine = collision && dashedLineRadius < endDashedLineRadius;

        const nextCusp = cuspPositions[(i + 1) % 12];
        const difference = nextCusp - cuspPosition;
        const gap = difference > 0 ? difference : difference + FULL_CIRCLE;
        const glyphAngle = cuspPosition + ((gap / 2) % FULL_CIRCLE) + shift;

        return (
          <g key={i}>
            {radialLine(startRadius, innerRadius, angle, strokeWidth)}
            {showDashedLine &&
              radialLine(dashedLineRadius, endDashedLineRadius, angle, strokeWidth)}
            <CuspGlyph
              house={(i + 1) as CuspNumber}
              point={getPointPosition(point, numbersRadius, glyphAngle)}
            />
          </g>
        );
      })}
    </g>
  );
}

export default AstrologyCusps;

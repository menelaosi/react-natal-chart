import { getPointPosition } from '../lib/geometry';
import { INNER_CIRCLE_RADIUS_RATIO, LIGHT_GRAY, SYMBOL_AXIS_STROKE } from '../lib/theme';
import { Axis, type Point } from '../types';
import AstrologyLine from './AstrologySymbols/AstrologyLine';
import AxisGlyph from './AstrologySymbols/AxisGlyph';

type AstrologyAxisProps = {
  readonly point: Point;
  readonly radius: number;
  readonly cuspPositions: number[];
  readonly shift: number;
  readonly stroke?: string;
};

/** The four angles drawn, in cusp order, with how far past the wheel their label sits. */
const AXES: readonly { axis: Axis; labelOffset: number }[] = [
  { axis: Axis.Ascendant, labelOffset: 20 },
  { axis: Axis.ImmumCoeli, labelOffset: 2 },
  { axis: Axis.Descendant, labelOffset: 10 },
  { axis: Axis.Midheaven, labelOffset: 10 },
];

/** The four angle spokes (AC/IC/DC/MC) and their labels, past the wheel's rim. */
function AstrologyAxis({
  point,
  radius,
  cuspPositions,
  shift,
  stroke = LIGHT_GRAY,
}: AstrologyAxisProps) {
  const axisRadius = radius + radius / INNER_CIRCLE_RADIUS_RATIO / 4;

  return (
    <g>
      {AXES.map(({ axis, labelOffset }) => {
        const shiftPosition = cuspPositions[axis] + shift;
        return (
          <g key={axis}>
            <AstrologyLine
              startingPoint={getPointPosition(point, radius, shiftPosition)}
              endingPoint={getPointPosition(point, axisRadius, shiftPosition)}
              stroke={stroke}
              strokeWidth={SYMBOL_AXIS_STROKE}
            />
            <AxisGlyph
              axis={axis}
              point={getPointPosition(point, axisRadius + labelOffset, shiftPosition)}
              stroke={stroke}
            />
          </g>
        );
      })}
    </g>
  );
}

export default AstrologyAxis;

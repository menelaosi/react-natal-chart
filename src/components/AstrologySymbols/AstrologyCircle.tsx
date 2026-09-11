import { CIRCLE_STROKE, DARK_GRAY } from '../../lib/theme';
import type { Point } from '../../types';

type CircleProps = {
  readonly point: Point;
  readonly radius: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly fill?: string;
};

/** SVG <circle> primitive; `fill` defaults to none so callers get an outline. */
function AstrologyCircle({
  point: { x, y },
  radius,
  stroke = DARK_GRAY,
  strokeWidth = CIRCLE_STROKE,
  fill = 'none',
}: CircleProps) {
  return <circle cx={x} cy={y} r={radius} stroke={stroke} strokeWidth={strokeWidth} fill={fill} />;
}

export default AstrologyCircle;

import { DARK_GRAY } from '../../lib/theme';
import type { Point } from '../../types';

type AstrologyLineProps = {
  readonly startingPoint: Point;
  readonly endingPoint: Point;
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly opacity?: number;
  readonly dashed?: boolean;
};

/** SVG <line> primitive between two points. */
function AstrologyLine({
  startingPoint: { x: x1, y: y1 },
  endingPoint: { x: x2, y: y2 },
  stroke = DARK_GRAY,
  strokeWidth,
  opacity,
  dashed = false,
}: AstrologyLineProps) {
  return (
    <line
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      strokeDasharray={dashed ? '3 3' : undefined}
    />
  );
}

export default AstrologyLine;

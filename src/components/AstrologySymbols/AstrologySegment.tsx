import { convertShiftInDegrees } from '../../lib/geometry';
import { WHITE } from '../../lib/theme';
import type { Point } from '../../types';

type AstrologySegmentProps = {
  readonly point: Point;
  readonly radius: number;
  readonly angleFrom?: number;
  readonly angleTo?: number;
  readonly thickness: number;
  readonly lFlag?: number;
  readonly sFlag?: number;
  readonly stroke?: string;
  readonly strokeWidth?: number;
};

/**
 * A ring (donut) segment: the wedge between radii `thickness`..`radius` and
 * angles `angleFrom`..`angleTo`, as a single <path> (two lines + two arcs). Used
 * for the wheel backgrounds and the 12 zodiac-band slices. `lFlag`/`sFlag` are
 * the SVG arc large-arc / sweep flags for spans over 180°.
 */
function AstrologySegment({
  point: { x, y },
  radius,
  angleFrom = 0,
  angleTo = 359.99,
  thickness,
  lFlag = 1,
  sFlag = 0,
  stroke,
  strokeWidth,
}: AstrologySegmentProps) {
  // Some constants for angles in degrees and radius minus thickness
  const angleFromShift = convertShiftInDegrees(angleFrom);
  const angleToShift = convertShiftInDegrees(angleTo);
  const radiusMinusThickness = radius - thickness;

  // Some constants for cos and sin for angleFrom and angleTo
  const cosineAngleFromShift = Math.cos(angleFromShift);
  const sineAngleFromShift = Math.sin(angleFromShift);
  const cosineAngleToShift = Math.cos(angleToShift);
  const sineAngleToShift = Math.sin(angleToShift);

  // Define the points for the SVG
  const p1X = x + thickness * cosineAngleFromShift;
  const p1Y = y + thickness * sineAngleFromShift;
  const p2X = radiusMinusThickness * cosineAngleFromShift;
  const p2Y = radiusMinusThickness * sineAngleFromShift;
  const p3X = x + radius * cosineAngleToShift;
  const p3Y = y + radius * sineAngleToShift;
  const p4X = radiusMinusThickness * -cosineAngleToShift;
  const p4Y = radiusMinusThickness * -sineAngleToShift;

  // Draw the path based on the constants we've created
  return (
    <path
      d={`
		M ${p1X}, ${p1Y}
		l ${p2X}, ${p2Y}
		A ${radius}, ${radius},0 ,${lFlag}, ${sFlag}, ${p3X}, ${p3Y}
		l ${p4X}, ${p4Y}
		A ${thickness}, ${thickness},0 ,${lFlag}, 1, ${p1X}, ${p1Y}
		`}
      fill={WHITE}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

export default AstrologySegment;

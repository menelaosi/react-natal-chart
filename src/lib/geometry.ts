// Wheel math: placing points on the chart and fanning out glyphs that would
// otherwise overlap. Pure 2D geometry — nothing here knows what a Horoscope
// is. Angles are wheel degrees (0° left, counter-clockwise); convertShiftInDegrees
// turns them into the radians getPointPosition needs.
import {
  ZODIAC_SIGNS,
  zodiacFromNumber,
  type LocatedPoint,
  type Point,
  type ZodiacSign,
} from '../types';

export const FULL_CIRCLE = 360;
export const SHIFT_IN_DEGREES = FULL_CIRCLE / 2;

/** Degrees of arc each zodiac sign occupies on the wheel. */
export const SIGN_ARC = FULL_CIRCLE / ZODIAC_SIGNS.length;

/** Normalizes any degree value — negative, over 360, or already in range — into [0, 360). */
export function normalizeAngle(degrees: number): number {
  return ((degrees % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}

export function getSign(angle: number): ZodiacSign {
  return zodiacFromNumber(Math.floor(normalizeAngle(angle) / 30) + 1);
}

/** Shortest angular distance between two degree values, 0–180, wrapping past 0°/360°. */
export function angularDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % FULL_CIRCLE;
  return diff > SHIFT_IN_DEGREES ? FULL_CIRCLE - diff : diff;
}

/**
 * Converts a wheel angle in degrees to the shifted angle in radians used for
 * placing SVG points (0° at the left, increasing counter-clockwise).
 */
export function convertShiftInDegrees(angle: number): number {
  return (((SHIFT_IN_DEGREES - angle) % FULL_CIRCLE) * Math.PI) / SHIFT_IN_DEGREES;
}

export function getPointPosition({ x, y }: Point, radius: number, angle: number): Point {
  const angleInRadians = convertShiftInDegrees(angle);
  return {
    x: x + radius * Math.cos(angleInRadians),
    y: y + radius * Math.sin(angleInRadians),
  };
}

function isCollision(locatedPoint: LocatedPoint, comparePoint: LocatedPoint): boolean {
  const vX = locatedPoint.point.x - comparePoint.point.x;
  const vY = locatedPoint.point.y - comparePoint.point.y;

  const magnitude = Math.sqrt(vX * vX + vY * vY);
  const totalRadii = locatedPoint.radius + comparePoint.radius;

  return magnitude <= totalRadii;
}

/**
 * Adds `locatedPoint` to `locatedPoints`, nudging any glyph it overlaps (and
 * re-checking, recursively) so tightly-grouped planets fan out instead of
 * stacking. Mutates and returns the array.
 */
export function assembleLocatedPoints(
  locatedPoints: LocatedPoint[],
  locatedPoint: LocatedPoint,
  centerPoint: Point,
  pointRadius: number,
): LocatedPoint[] {
  if (locatedPoints.length === 0) {
    locatedPoints.push(locatedPoint);
    return locatedPoints;
  }

  const placePointsInCollision = (collisionPoint: LocatedPoint, incoming: LocatedPoint) => {
    if (collisionPoint.pointer <= incoming.pointer) {
      collisionPoint.angle--;
      incoming.angle++;
    } else {
      collisionPoint.angle++;
      incoming.angle--;
    }

    collisionPoint.angle = normalizeAngle(collisionPoint.angle);
    incoming.angle = normalizeAngle(incoming.angle);
  };

  locatedPoints.sort((pointA, pointB) => pointA.angle - pointB.angle);

  const collisionIndex = locatedPoints.findIndex((point) => isCollision(point, locatedPoint));
  if (collisionIndex === -1) {
    locatedPoints.push(locatedPoint);
    return locatedPoints;
  }

  const collisionPoint = locatedPoints[collisionIndex];
  placePointsInCollision(collisionPoint, locatedPoint);
  collisionPoint.point = getPointPosition(centerPoint, pointRadius, collisionPoint.angle);
  locatedPoint.point = getPointPosition(centerPoint, pointRadius, locatedPoint.angle);
  locatedPoints.splice(collisionIndex, 1);

  locatedPoints = assembleLocatedPoints(locatedPoints, collisionPoint, centerPoint, pointRadius);
  locatedPoints = assembleLocatedPoints(locatedPoints, locatedPoint, centerPoint, pointRadius);

  return locatedPoints;
}

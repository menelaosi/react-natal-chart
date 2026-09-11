import { getDignities } from '../lib/dignities';
import { getPointPosition } from '../lib/geometry';
import { BLACK, COLLISION_RADIUS, CUSPS_STROKE, DARK_GRAY, POINTS_TEXT_SIZE } from '../lib/theme';
import type {
  CelestialBodyPosition,
  DescriptionPosition,
  LocatedPoint,
  Planet,
  Point,
} from '../types';
import AstrologyLine from './AstrologySymbols/AstrologyLine';
import AstrologyText from './AstrologySymbols/AstrologyText';
import PlanetGlyph from './AstrologySymbols/PlanetGlyph';

type PlanetsProps = {
  readonly point: Point;
  readonly radius: number;
  readonly planets: Record<Planet, CelestialBodyPosition | undefined>;
  readonly locatedPoints: LocatedPoint[];
  readonly rulerRadius: number;
  readonly pointRadius: number;
  readonly shift: number;
};

/** Planet glyphs at their spread (collision-adjusted) positions, each with a pointer back to its true degree and its degree/retrograde/dignity label. */
function Planets({
  point,
  radius,
  planets,
  locatedPoints,
  rulerRadius,
  pointRadius,
  shift,
}: PlanetsProps) {
  // The pointer marks a planet's true degree just inside the ruler; when the
  // glyph is nudged inward to dodge a neighbor, a connector links the two.
  const pointerRadius = radius - rulerRadius;

  const pointerLine = (from: Point, to: Point) => (
    <AstrologyLine
      startingPoint={from}
      endingPoint={to}
      stroke={DARK_GRAY}
      strokeWidth={CUSPS_STROKE}
    />
  );

  return (
    <g id="points">
      {locatedPoints.map((located) => {
        const { planetName, angle, point: locatedPoint } = located;
        const { longitude, retrograde } = planets[planetName] ?? {};

        const planetAngle = longitude ?? -1;
        const planetShift = planetAngle + shift;
        const isDisplaced = planetShift !== angle;

        const pointerStart = getPointPosition(point, pointerRadius, planetShift);
        const pointerEnd = getPointPosition(point, pointerRadius + rulerRadius / 2, planetShift);

        const ratio = COLLISION_RADIUS / 1.4;
        const x = locatedPoint.x + ratio;
        const y = locatedPoint.y - COLLISION_RADIUS;

        const descriptionPositions: DescriptionPosition[] = [
          Math.round(planetAngle % 30).toString(),
          ...(retrograde ? ['R'] : []),
          ...getDignities(planetName, planetAngle),
        ].map((text, i) => ({
          text,
          point: { x, y: y + ratio * i },
        }));

        return (
          <g key={planetName}>
            {pointerLine(pointerStart, pointerEnd)}
            {isDisplaced &&
              pointerLine(
                pointerEnd,
                getPointPosition(point, pointRadius - COLLISION_RADIUS, angle),
              )}
            <PlanetGlyph planet={planetName} point={locatedPoint} longitude={planetAngle} />
            {descriptionPositions.map(({ point: descriptionPoint, text }, i) => (
              <AstrologyText
                key={i}
                text={text}
                point={descriptionPoint}
                size={POINTS_TEXT_SIZE}
                color={BLACK}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

export default Planets;

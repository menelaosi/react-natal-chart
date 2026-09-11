import { Horoscope } from 'circular-natal-horoscope-js';
import { memo } from 'react';
import type { AspectLine } from '../lib/aspectStyle';
import { assembleLocatedPoints, FULL_CIRCLE, getPointPosition } from '../lib/geometry';
import {
  cuspLongitude,
  getCelestialBody,
  isRetrograde,
  longitudeOf,
  longitudeOfMidheavenAscendant,
  type Cusp,
} from '../lib/horoscope';
import {
  COLLISION_RADIUS,
  DARK_GRAY,
  INDOOR_CIRCLE_RADIUS_RATIO,
  INNER_CIRCLE_RADIUS_RATIO,
  LIGHT_GRAY,
  MARGIN,
  PADDING,
  RULER_RADIUS,
  WHITE,
} from '../lib/theme';
import type { TransitContact } from '../lib/transits';
import type { CelestialBodyPosition, LocatedPoint, Point } from '../types';
import { Planet } from '../types';
import Aspects from './Aspects';
import Axes from './Axes';
import Background from './Background';
import Circles from './Circles';
import Cusps from './Cusps';
import Planets from './Planets';
import Ruler from './Ruler';
import Transits from './Transits';
import Universe from './Universe';

type AstrologyChartProps = {
  readonly horoscope: Horoscope;
  readonly height?: number;
  readonly width?: number;
  /**
   * When set, draws the bi-wheel: a ring of the transiting planets outside the
   * natal wheel and dashed chords to the natal points they contact. `horoscope`
   * stays the natal chart; `transit.horoscope` is the sky for the chosen moment.
   */
  readonly transit?: {
    horoscope: Horoscope;
    contacts: readonly TransitContact[];
  };
};

// Extra breathing room outside the natal wheel for the transit ring; the wheel
// shrinks by this much when the bi-wheel is shown.
const TRANSIT_MARGIN = MARGIN + 48;

// The transit band hugs the wheel edge (small gap) rather than floating in the
// margin; Transits derives the band width from this centre line.
const TRANSIT_RING_OFFSET = 18;
function getCelestialBodyPositions(
  horoscope: Horoscope,
): Record<Planet, CelestialBodyPosition | undefined> {
  return Object.values(Planet).reduce<Record<Planet, CelestialBodyPosition | undefined>>(
    (positions, planet) => {
      const body = getCelestialBody(horoscope, planet);
      const longitude = longitudeOf(body);
      positions[planet] =
        longitude == null ? undefined : { longitude, retrograde: isRetrograde(body) };
      return positions;
    },
    {} as Record<Planet, CelestialBodyPosition | undefined>,
  );
}

function getCuspPositions({ Houses }: Horoscope): number[] {
  return Houses.map((cusp: Cusp) => cuspLongitude(cusp) ?? 0);
}

/**
 * Resolves each major aspect from `horoscope.Aspects` into a drawable chord by
 * looking up the ecliptic longitude of both endpoints. Endpoints the wheel does
 * not plot (south node, fixed stars) are dropped. `orbUsed` rides along so the
 * renderer can fade aspects out as they approach the edge of orb.
 */
function getAspectLines(
  horoscope: Horoscope,
  celestialBodyPositions: Record<Planet, CelestialBodyPosition | undefined>,
): AspectLine[] {
  let longitudeByKey: Record<string, number> = {};

  for (const planet of Object.values(Planet)) {
    const { longitude } = celestialBodyPositions[planet] ?? {};
    if (longitude == null) continue;

    // Aspects name the lunar node 'northnode'; every other library key already
    // matches the Planet value we store positions under.
    longitudeByKey[planet === Planet.NorthNode ? 'northnode' : planet] = longitude;
  }

  longitudeByKey = longitudeOfMidheavenAscendant(horoscope, longitudeByKey);

  return (horoscope?.Aspects?.all ?? [])
    .filter(({ aspectLevel }) => aspectLevel === 'major')
    .map(({ point1Key, point2Key, aspectKey: aspect, orb, orbUsed }) => {
      const from = longitudeByKey[point1Key];
      const to = longitudeByKey[point2Key];

      if (from == null || to == null) return undefined;
      return { aspect, from, to, orb, orbUsed };
    })
    .filter((line): line is AspectLine => line != null);
}

/**
 * Natal longitudes keyed the way transit contacts name their target: a Planet
 * value ('sun', 'nnode', …) or 'ascendant' / 'midheaven' for the angles.
 */
function getNatalLongitudes(
  horoscope: Horoscope,
  positions: Record<Planet, CelestialBodyPosition | undefined>,
): Record<string, number> {
  const longitudes: Record<string, number> = {};

  for (const planet of Object.values(Planet)) {
    const { longitude } = positions[planet] ?? {};
    if (longitude != null) longitudes[planet] = longitude;
  }

  return longitudeOfMidheavenAscendant(horoscope, longitudes);
}

function getLocatedPoints(
  celestialBodyPositions: Record<Planet, CelestialBodyPosition | undefined>,
  point: Point,
  pointRadius: number,
  shift: number,
): LocatedPoint[] {
  let locatedPoints: LocatedPoint[] = [];

  for (const planetName of Object.values(Planet)) {
    const planetShift = (celestialBodyPositions[planetName]?.longitude ?? 0) + shift;

    locatedPoints = assembleLocatedPoints(
      locatedPoints,
      {
        planetName,
        point: getPointPosition(point, pointRadius, planetShift),
        radius: COLLISION_RADIUS,
        angle: planetShift,
        pointer: planetShift,
      },
      point,
      pointRadius,
    );
  }

  return locatedPoints;
}

/**
 * The natal wheel as one SVG. Derives each ring's radius from `radius`, resolves
 * body and cusp longitudes from the library `horoscope`, and composes the
 * background / signs / ruler / planets / cusps / axis subcomponents. `shift`
 * rotates the whole wheel so the Ascendant sits on the left.
 */
function AstrologyChartComponent({
  horoscope,
  height = 800,
  width = 800,
  transit,
}: AstrologyChartProps) {
  const x = width / 2;
  const y = height / 2;
  const point: Point = { x, y };

  const radius = y - (transit ? TRANSIT_MARGIN : MARGIN);
  const radiusRatio = radius / INNER_CIRCLE_RADIUS_RATIO;
  const radixRadius = radius - radiusRatio;
  const thickness = radius / INDOOR_CIRCLE_RADIUS_RATIO;
  const rulerRadius = radiusRatio / RULER_RADIUS;
  const pointRadius = radius - (radiusRatio + 2 * rulerRadius + PADDING);
  const numbersRadius = thickness + COLLISION_RADIUS;
  const endDashedLineRadius = radius - (radiusRatio + rulerRadius);
  const celestialBodyPositions = getCelestialBodyPositions(horoscope);
  const cuspPositions = getCuspPositions(horoscope);

  const shift = cuspPositions[0] ? FULL_CIRCLE - cuspPositions[0] : 0;

  const locatedPoints = getLocatedPoints(celestialBodyPositions, point, pointRadius, shift);

  const aspectLines = getAspectLines(horoscope, celestialBodyPositions);

  // Transit overlay geometry: a glyph band just outside the wheel edge, with the
  // moving planets collision-spread the same way the natal ones are.
  const transitRingRadius = radius + TRANSIT_RING_OFFSET;
  const transitPositions = transit ? getCelestialBodyPositions(transit.horoscope) : undefined;

  return (
    <svg id="chart" viewBox={`0 0 ${height} ${width}`} preserveAspectRatio="xMinYMin meet">
      <circle cx={x} cy={y} r={thickness} fill={WHITE} />
      <Aspects point={point} radius={thickness} shift={shift} lines={aspectLines} />
      {transit && transitPositions && (
        <Transits
          point={point}
          hubRadius={thickness}
          wheelRadius={radius}
          ringRadius={transitRingRadius}
          shift={shift}
          transitPositions={transitPositions}
          natalLongitudes={getNatalLongitudes(horoscope, celestialBodyPositions)}
          locatedPoints={getLocatedPoints(transitPositions, point, transitRingRadius, shift)}
          contacts={transit.contacts}
        />
      )}
      <g id="radix">
        <Background
          id="radix-background"
          point={point}
          radius={radixRadius}
          thickness={thickness}
        />
        <Universe point={point} shift={shift} radius={radius} backgroundRadius={radixRadius} />
        <Ruler point={point} startRadius={radius} rulerRadius={rulerRadius} startAngle={shift} />
        <Planets
          point={point}
          radius={radius}
          planets={celestialBodyPositions}
          locatedPoints={locatedPoints}
          rulerRadius={rulerRadius}
          pointRadius={pointRadius}
          shift={shift}
        />
        <Cusps
          point={point}
          numbersRadius={numbersRadius}
          pointRadius={pointRadius}
          endDashedLineRadius={endDashedLineRadius}
          cuspPositions={cuspPositions}
          shift={shift}
          locatedPoints={locatedPoints}
        />
        <Axes
          point={point}
          radius={radius}
          cuspPositions={cuspPositions}
          shift={shift}
          stroke={transit ? DARK_GRAY : LIGHT_GRAY}
        />
        <Circles
          point={point}
          radius={radius}
          thickness={thickness}
          backgroundRadius={radixRadius}
        />
      </g>
    </svg>
  );
}

// Casting + geometry (getCelestialBodyPositions, getAspectLines, the collision
// layout) is real work for an SVG this size, and horoscope/transit are stable
// references from the callers' useMemo — skip re-deriving all of it when a
// sibling state change (e.g. the analyze button's isAnalyzing) re-renders the view.
const AstrologyChart = memo(AstrologyChartComponent);

export default AstrologyChart;

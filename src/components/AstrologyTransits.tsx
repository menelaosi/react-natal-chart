import { aspectLineStyle } from '../lib/aspectStyle';
import { getPointPosition, SIGN_ARC } from '../lib/geometry';
import { ASPECT_COLOR, BLACK, LIGHT_GRAY, NEUTRAL_ASPECT_COLOR } from '../lib/theme';
import { transitAspectMaxOrb, type TransitContact } from '../lib/transits';
import {
  ZODIAC_SIGNS,
  type CelestialBodyPosition,
  type LocatedPoint,
  type Planet,
  type Point,
} from '../types';
import AstrologyCircle from './AstrologySymbols/AstrologyCircle';
import AstrologyLine from './AstrologySymbols/AstrologyLine';
import AstrologySegment from './AstrologySymbols/AstrologySegment';
import PlanetGlyph from './AstrologySymbols/PlanetGlyph';

type AstrologyTransitsProps = {
  readonly point: Point;
  readonly hubRadius: number; // Inner circle — where the transit→natal chords anchor, shared with the natal aspects.
  readonly wheelRadius: number; // Natal wheel edge — the transit band starts just outside this.
  readonly ringRadius: number; // Centre line of the band the transiting glyphs sit on.
  readonly shift: number;
  readonly transitPositions: Record<Planet, CelestialBodyPosition | undefined>; // Transiting-body longitudes, keyed by Planet value.
  readonly natalLongitudes: Record<string, number>; // Natal longitudes, keyed by Planet value plus 'ascendant' / 'midheaven'.
  readonly locatedPoints: readonly LocatedPoint[]; // Collision-spread glyph positions for the transiting bodies, at ringRadius.
  readonly contacts: readonly TransitContact[]; // Transit→natal contacts, already ranked most-significant-first.
};

/** Half the width of the light band the transit glyphs sit on. */
const RING_HALF_WIDTH = 16;

/**
 * The transit overlay: a light band of the currently-transiting planets hugging
 * the outside of the natal wheel, split into the twelve signs so it reads as
 * part of the wheel rather than a floating ring, plus dashed chords from each
 * transiting body to the natal point it contacts. Dashed (vs. the solid natal
 * aspect chords) keeps the two aspect sets distinct on the shared inner circle;
 * each glyph gets a pale halo so it holds up over the band.
 */
function AstrologyTransits({
  point,
  hubRadius,
  wheelRadius,
  ringRadius,
  shift,
  transitPositions,
  natalLongitudes,
  locatedPoints,
  contacts,
}: AstrologyTransitsProps) {
  const innerRadius = ringRadius - RING_HALF_WIDTH;
  const outerRadius = ringRadius + RING_HALF_WIDTH;

  return (
    <g id="transits">
      <AstrologySegment point={point} radius={outerRadius} thickness={innerRadius} />
      <AstrologyCircle point={point} radius={outerRadius} stroke={LIGHT_GRAY} strokeWidth={1} />

      {ZODIAC_SIGNS.map((sign, index) => {
        const angle = shift + index * SIGN_ARC;
        return (
          <AstrologyLine
            key={sign}
            startingPoint={getPointPosition(point, wheelRadius, angle)}
            endingPoint={getPointPosition(point, outerRadius, angle)}
            stroke={LIGHT_GRAY}
            strokeWidth={1}
          />
        );
      })}

      {contacts.map(({ natal, orb, transiting, type }, index) => {
        const fromLongitude = transitPositions[transiting as Planet]?.longitude;
        const toLongitude = natalLongitudes[natal];
        if (fromLongitude == null || toLongitude == null) return null;

        return (
          <AstrologyLine
            key={index}
            startingPoint={getPointPosition(point, hubRadius, fromLongitude + shift)}
            endingPoint={getPointPosition(point, hubRadius, toLongitude + shift)}
            stroke={ASPECT_COLOR[type] ?? NEUTRAL_ASPECT_COLOR}
            dashed
            {...aspectLineStyle(orb, transitAspectMaxOrb(type))}
          />
        );
      })}

      {locatedPoints.map(({ planetName, point: locatedPoint }) => {
        const longitude = transitPositions[planetName]?.longitude ?? -1;
        const longShift = longitude + shift;

        // Short spoke from the wheel rim to the true degree, so a nudged glyph
        // still points back to where the planet actually is.
        return (
          <g key={planetName}>
            <AstrologyLine
              startingPoint={getPointPosition(point, wheelRadius, longShift)}
              endingPoint={getPointPosition(point, innerRadius, longShift)}
              strokeWidth={0.75}
            />
            <PlanetGlyph
              planet={planetName}
              point={locatedPoint}
              longitude={longitude}
              halo={BLACK}
            />
          </g>
        );
      })}
    </g>
  );
}

export default AstrologyTransits;

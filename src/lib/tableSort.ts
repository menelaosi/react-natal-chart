import { Planet } from '../types';
import type { AspectSummary, Placement } from './chartSummary';
import { planetForAspectKey } from './horoscope';

// The enum's own declaration order doubles as "importance" elsewhere in this
// codebase (see dignities.ts's planetDignities key order) — reused here.
const IMPORTANCE_ORDER: Planet[] = Object.values(Planet);

function importanceOf(planet?: Planet): number {
  return planet ? IMPORTANCE_ORDER.indexOf(planet) : Infinity;
}

// One named comparator per sort key, so each mode below is a one-line pick
// between two — no inline branching, no separate `sorted` variable to return.
const houseSort = ({ house: a }: Placement, { house: b }: Placement) => {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  return a - b;
};

const importanceSort = ({ body: a }: Placement, { body: b }: Placement) =>
  importanceOf(a) - importanceOf(b);

// A missing/unmapped planet key (e.g. an aspect to the ascendant) sorts last.
const importanceCompare = (a: string, b: string) =>
  importanceOf(planetForAspectKey(a)) - importanceOf(planetForAspectKey(b));

const aspectImportanceSort = (
  { to: aTo, from: aFrom }: AspectSummary,
  { to: bTo, from: bFrom }: AspectSummary,
) => importanceCompare(aFrom, bFrom) || importanceCompare(aTo, bTo);

const orbSort = ({ orb: a }: AspectSummary, { orb: b }: AspectSummary) => a - b;

export type PlacementSortMode = 'importance' | 'house';

/**
 * Orders placements either by canonical importance (Sun through South Node,
 * IMPORTANCE_ORDER) or by house number, with a null house sorted last.
 */
export function sortPlacements(placements: Placement[], mode: PlacementSortMode): Placement[] {
  return [...placements].sort(mode === 'house' ? houseSort : importanceSort);
}

export type AspectSortMode = 'orb' | 'importance';

/**
 * Orders aspects either by orb (tightest, most exact first) or by the
 * importance of the `from` body, falling back to `to` to break ties.
 */
export function sortAspects(aspects: AspectSummary[], mode: AspectSortMode): AspectSummary[] {
  return [...aspects].sort(mode === 'importance' ? aspectImportanceSort : orbSort);
}

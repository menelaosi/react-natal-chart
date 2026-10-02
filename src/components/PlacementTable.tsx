import type { CSSProperties } from 'react';
import type { Placement } from '../lib/chartSummary';
import { zodiacSignFromKey } from '../lib/signs';
import { sortPlacements, type PlacementSortMode } from '../lib/tableSort';
import { PLANET_LABEL, SIGN_EMOJI } from '../types';
import AstrologyTable from './AstrologySymbols/AstrologyTable';

type PlacementTableProps = {
  readonly placements: Placement[];
  readonly sortBy?: PlacementSortMode; // default 'importance'
  readonly className?: string; // forwarded to the <table> element, for consumer theming
  readonly style?: CSSProperties; // forwarded to the <table> element, for consumer theming
};

/**
 * A plain HTML table of placements — one row per planet/point, with its
 * sign, house, degree in sign, and retrograde status. Presentational only
 * (no state): pass `sortBy` to control row order, computed via sortPlacements,
 * and `className`/`style` to theme the `<table>` (reach cells with descendant
 * selectors, e.g. `.my-table td`).
 */
function PlacementTable({
  placements,
  sortBy = 'importance',
  className,
  style,
}: PlacementTableProps) {
  return (
    <AstrologyTable
      headers={['Planet', 'Sign', 'House', 'Degree', 'Retrograde']}
      className={className}
      style={style}
    >
      {sortPlacements(placements, sortBy).map(({ body, sign, house, degreeInSign, retrograde }) => {
        const zodiacSign = zodiacSignFromKey(sign);
        return (
          <tr key={body}>
            <td>{PLANET_LABEL[body]}</td>
            <td>
              {SIGN_EMOJI[zodiacSign]} {zodiacSign}
            </td>
            <td>{house ?? '—'}</td>
            <td>{Math.round(degreeInSign)}°</td>
            <td>{retrograde ? 'R' : ''}</td>
          </tr>
        );
      })}
    </AstrologyTable>
  );
}

export default PlacementTable;

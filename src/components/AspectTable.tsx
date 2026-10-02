import type { CSSProperties } from 'react';
import type { AspectSummary } from '../lib/chartSummary';
import { planetForAspectKey } from '../lib/horoscope';
import { sortAspects, type AspectSortMode } from '../lib/tableSort';
import { ASPECT_COLOR, ASPECT_SYMBOL, NEUTRAL_ASPECT_COLOR } from '../lib/theme';
import { PLANET_LABEL } from '../types';
import AstrologyTable from './AstrologySymbols/AstrologyTable';

type AspectTableProps = {
  readonly aspects: AspectSummary[];
  readonly sortBy?: AspectSortMode; // default 'orb'
  readonly className?: string; // forwarded to the <table> element, for consumer theming
  readonly style?: CSSProperties; // forwarded to the <table> element, for consumer theming
};

/** A planet's table label, falling back to its raw library key if unmapped. */
function labelFor(key: string): string {
  const planet = planetForAspectKey(key);
  return planet ? PLANET_LABEL[planet] : key;
}

/**
 * A plain HTML table of aspects within a single chart — one row per aspect,
 * with the two bodies, the aspect type, and its orb. Presentational only (no
 * state): pass `sortBy` to control row order, computed via sortAspects, and
 * `className`/`style` to theme the `<table>` (reach cells with descendant
 * selectors, e.g. `.my-table td`).
 */
function AspectTable({ aspects, sortBy = 'orb', className, style }: AspectTableProps) {
  return (
    <AstrologyTable headers={['From', 'To', 'Aspect', 'Orb']} className={className} style={style}>
      {sortAspects(aspects, sortBy).map(({ from, to, type, orb }, index) => (
        <tr key={index}>
          <td>{labelFor(from)}</td>
          <td>{labelFor(to)}</td>
          <td style={{ color: ASPECT_COLOR[type] ?? NEUTRAL_ASPECT_COLOR }}>
            {ASPECT_SYMBOL[type] ?? ''} {type}
          </td>
          <td>{orb.toFixed(1)}°</td>
        </tr>
      ))}
    </AstrologyTable>
  );
}

export default AspectTable;

import type { CSSProperties, ReactNode } from 'react';

type AstrologyTableProps = {
  readonly headers: string[];
  readonly children: ReactNode; // the <tbody> rows — each caller builds its own <tr>/<td> markup
  readonly className?: string; // forwarded to the <table> element, for consumer theming
  readonly style?: CSSProperties; // forwarded to the <table> element, for consumer theming
};

/**
 * Shared `<table>` shell for PlacementTable/AspectTable. Only the header row
 * is generic here; each caller still renders its own body rows so per-cell
 * formatting and styling (e.g. AspectTable's colored aspect cell) stays fully
 * typed rather than routed through a positional cells array. `className`/
 * `style` land on the `<table>` itself; consumers reach the header/body cells
 * with ordinary descendant selectors (e.g. `.my-table th`).
 */
function AstrologyTable({ headers, children, className, style }: AstrologyTableProps) {
  return (
    <table className={className} style={style}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export default AstrologyTable;

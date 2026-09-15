import type { ReactNode } from 'react';

type AstrologyTableProps = {
  readonly headers: string[];
  readonly children: ReactNode; // the <tbody> rows — each caller builds its own <tr>/<td> markup
};

/**
 * Shared `<table>` shell for PlacementTable/AspectTable. Only the header row
 * is generic here; each caller still renders its own body rows so per-cell
 * formatting and styling (e.g. AspectTable's colored aspect cell) stays fully
 * typed rather than routed through a positional cells array.
 */
function AstrologyTable({ headers, children }: AstrologyTableProps) {
  return (
    <table>
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

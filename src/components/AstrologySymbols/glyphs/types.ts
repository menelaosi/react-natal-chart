import type { Point } from '../../../types';

/**
 * One SVG path within a glyph. `d` is a path body with no leading moveto —
 * {@link Glyph} prepends `m <origin>` so the pairs that follow stay relative,
 * matching how these paths were authored. `ox` / `oy` offset this path's start
 * from the glyph origin (used when a glyph has a detached second stroke).
 */
export type GlyphPath = {
  readonly ox?: number;
  readonly oy?: number;
  readonly d: string;
};

/**
 * A drawable astrology glyph: a pixel offset from the anchor point (rounded by
 * the renderer) plus one or more relative path bodies.
 */
export type GlyphSpec = {
  readonly dx: number;
  readonly dy: number;
  readonly paths: readonly GlyphPath[];
};

export type GlyphProps = {
  readonly point: Point;
  readonly spec: GlyphSpec;
  readonly stroke: string;
  readonly strokeWidth?: string | number;
};

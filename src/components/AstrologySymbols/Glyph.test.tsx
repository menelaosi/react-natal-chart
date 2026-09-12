import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BLACK } from '../../lib/theme';
import Glyph from './Glyph';
import type { GlyphSpec } from './glyphs/types';

const spec: GlyphSpec = { dx: 5, dy: -3, paths: [{ d: '1,1 2,2' }] };

describe('Glyph', () => {
  it('rounds the anchor point and applies dx/dy before drawing', () => {
    const html = renderToStaticMarkup(
      <Glyph point={{ x: 100.4, y: 50.6 }} spec={spec} stroke={BLACK} />,
    );
    // 100.4 + 5 rounds to 105; 50.6 - 3 rounds to 48.
    expect(html).toContain('d="m 105,48 1,1 2,2"');
  });

  it("offsets a path's own start by its ox/oy on top of the anchor", () => {
    const specWithOffset: GlyphSpec = {
      dx: 0,
      dy: 0,
      paths: [{ ox: 10, oy: -10, d: '1,1' }],
    };
    const html = renderToStaticMarkup(
      <Glyph point={{ x: 0, y: 0 }} spec={specWithOffset} stroke={BLACK} />,
    );
    expect(html).toContain('d="m 10,-10 1,1"');
  });

  it('adds no rotation transform when the spec has none', () => {
    const html = renderToStaticMarkup(<Glyph point={{ x: 0, y: 0 }} spec={spec} stroke={BLACK} />);
    expect(html).not.toContain('transform');
  });

  it('spins the glyph around its own rounded anchor when rotate is set', () => {
    const rotated: GlyphSpec = { ...spec, rotate: 180 };
    const html = renderToStaticMarkup(
      <Glyph point={{ x: 100, y: 50 }} spec={rotated} stroke={BLACK} />,
    );
    // Anchor after dx/dy is (105, 47) — the rotation pivots on that same point.
    expect(html).toContain('transform="rotate(180, 105, 47)"');
  });

  it('draws every path in a multi-path spec', () => {
    const multi: GlyphSpec = { dx: 0, dy: 0, paths: [{ d: 'a' }, { d: 'b' }] };
    const html = renderToStaticMarkup(<Glyph point={{ x: 0, y: 0 }} spec={multi} stroke={BLACK} />);
    expect(html.match(/<path/g)).toHaveLength(2);
  });

  it('defaults to the standard point stroke width when none is given', () => {
    const html = renderToStaticMarkup(<Glyph point={{ x: 0, y: 0 }} spec={spec} stroke={BLACK} />);
    expect(html).toContain('stroke-width="1.8"');
  });

  it('uses an explicit strokeWidth override when given', () => {
    const html = renderToStaticMarkup(
      <Glyph point={{ x: 0, y: 0 }} spec={spec} stroke={BLACK} strokeWidth={3} />,
    );
    expect(html).toContain('stroke-width="3"');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AspectSummary } from '../lib/chartSummary';
import AspectTable from './AspectTable';

function aspect(overrides: Partial<AspectSummary> = {}): AspectSummary {
  return { from: 'sun', to: 'moon', type: 'trine', orb: 1, ...overrides };
}

describe('AspectTable', () => {
  it('draws one row per aspect', () => {
    const html = renderToStaticMarkup(
      <AspectTable aspects={[aspect(), aspect({ from: 'venus', to: 'mars' })]} />,
    );
    expect(html.match(/<tr/g)).toHaveLength(3); // header row + 2 data rows
  });

  it('renders both planet labels, the aspect symbol/name, and the orb', () => {
    const html = renderToStaticMarkup(
      <AspectTable aspects={[aspect({ from: 'sun', to: 'moon', type: 'square', orb: 2.34 })]} />,
    );
    expect(html).toContain('Sun');
    expect(html).toContain('Moon');
    expect(html).toContain('□');
    expect(html).toContain('square');
    expect(html).toContain('2.3°');
  });

  it('maps the node library keys to their planet labels', () => {
    const html = renderToStaticMarkup(
      <AspectTable aspects={[aspect({ from: 'northnode', to: 'sun' })]} />,
    );
    expect(html).toContain('North Node');
  });

  it('falls back to the raw key for an unmapped body', () => {
    const html = renderToStaticMarkup(
      <AspectTable aspects={[aspect({ from: 'unknown-point' })]} />,
    );
    expect(html).toContain('unknown-point');
  });

  it('defaults to tightest-orb-first order', () => {
    const html = renderToStaticMarkup(
      <AspectTable
        aspects={[aspect({ from: 'sun', orb: 3 }), aspect({ from: 'venus', orb: 0.5 })]}
      />,
    );
    expect(html.indexOf('Venus')).toBeLessThan(html.indexOf('Sun'));
  });

  it('sorts by importance when requested', () => {
    const html = renderToStaticMarkup(
      <AspectTable
        aspects={[aspect({ from: 'moon', orb: 0.1 }), aspect({ from: 'sun', orb: 5 })]}
        sortBy="importance"
      />,
    );
    expect(html.indexOf('Sun')).toBeLessThan(html.indexOf('Moon'));
  });

  it('draws no data rows for an empty aspect list', () => {
    const html = renderToStaticMarkup(<AspectTable aspects={[]} />);
    expect(html.match(/<tr/g)).toHaveLength(1); // header row only
  });
});

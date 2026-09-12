import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ASPECT_COLOR, NEUTRAL_ASPECT_COLOR } from '../lib/theme';
import Aspects from './Aspects';

describe('Aspects', () => {
  it('draws one chord per line', () => {
    const html = renderToStaticMarkup(
      <Aspects
        point={{ x: 0, y: 0 }}
        radius={100}
        shift={0}
        lines={[
          { aspect: 'trine', from: 0, to: 120, orb: 1, orbUsed: 8 },
          { aspect: 'square', from: 10, to: 100, orb: 2, orbUsed: 7 },
        ]}
      />,
    );
    expect(html.match(/<line/g)).toHaveLength(2);
  });

  it('colors each chord by its own aspect family', () => {
    const html = renderToStaticMarkup(
      <Aspects
        point={{ x: 0, y: 0 }}
        radius={100}
        shift={0}
        lines={[{ aspect: 'square', from: 0, to: 90, orb: 0, orbUsed: 7 }]}
      />,
    );
    expect(html).toContain(`stroke="${ASPECT_COLOR.square}"`);
  });

  it('falls back to the neutral color for an aspect key with no entry', () => {
    const html = renderToStaticMarkup(
      <Aspects
        point={{ x: 0, y: 0 }}
        radius={100}
        shift={0}
        lines={[{ aspect: 'quincunx', from: 0, to: 150, orb: 0, orbUsed: 5 }]}
      />,
    );
    expect(html).toContain(`stroke="${NEUTRAL_ASPECT_COLOR}"`);
  });

  it('draws nothing for an empty line list', () => {
    const html = renderToStaticMarkup(
      <Aspects point={{ x: 0, y: 0 }} radius={100} shift={0} lines={[]} />,
    );
    expect(html).not.toContain('<line');
  });
});

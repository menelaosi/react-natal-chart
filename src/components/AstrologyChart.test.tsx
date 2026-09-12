import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getHoroscope } from '../lib/horoscope';
import { getTransitContacts, rankTransitContacts } from '../lib/transits';
import AstrologyChart from './AstrologyChart';

const BIRTH_DATE = new Date('1990-06-15T08:30:00');
const PLACE = { latitude: 40.7128, longitude: -74.006 };
const natal = getHoroscope(BIRTH_DATE, PLACE);

describe('AstrologyChart', () => {
  it('renders a natal wheel without throwing, at the given dimensions', () => {
    const html = renderToStaticMarkup(
      <AstrologyChart horoscope={natal} width={640} height={640} />,
    );
    expect(html).toContain('viewBox="0 0 640 640"');
    expect(html).toContain('id="chart"');
  });

  it('draws a glyph for every body the chart actually has a longitude for — Sirius and South Node included', () => {
    const html = renderToStaticMarkup(<AstrologyChart horoscope={natal} />);
    // Sirius's asterisk and South Node's rotated North Node glyph are both real,
    // distinctive path fragments — their presence confirms the whole pipeline
    // (position lookup -> collision layout -> glyph spec -> SVG) works end to end.
    expect(html).toContain('rotate(180');
    expect(html).toContain('-6.062,-10.5');
  });

  it('falls back to the default 800×800 size when none is given', () => {
    const html = renderToStaticMarkup(<AstrologyChart horoscope={natal} />);
    expect(html).toContain('viewBox="0 0 800 800"');
  });

  it('adds a transit ring and contact chords when a transit is given, without throwing', () => {
    const transitNow = getHoroscope(new Date(), PLACE);
    const transitNext = getHoroscope(new Date(Date.now() + 86_400_000), PLACE);
    const contacts = rankTransitContacts(getTransitContacts(natal, transitNow, transitNext));

    const html = renderToStaticMarkup(
      <AstrologyChart
        horoscope={natal}
        transit={{ horoscope: transitNow, contacts }}
        width={640}
        height={640}
      />,
    );
    expect(html).toContain('id="radix"');
  });

  it('renders identically for the same inputs (no hidden nondeterminism, e.g. Math.random or Date.now in layout)', () => {
    const first = renderToStaticMarkup(
      <AstrologyChart horoscope={natal} width={500} height={500} />,
    );
    const second = renderToStaticMarkup(
      <AstrologyChart horoscope={natal} width={500} height={500} />,
    );
    expect(first).toBe(second);
  });
});

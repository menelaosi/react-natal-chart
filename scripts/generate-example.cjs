// Renders real example charts to static SVG files for the README, using the
// library's own built output (dist/), so the README preview can never drift
// from what the library actually draws. Re-run with `npm run example`
// whenever the rendering changes.
//
// CommonJS (not .mjs): circular-natal-horoscope-js is CJS-only and doesn't
// expose named exports Node's native ESM loader can see, so dist/index.js
// (ESM) can't import it directly under `node`. dist/index.cjs works fine.
const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { writeFileSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const {
  AstrologyChart,
  getHoroscope,
  getTransitContacts,
  rankTransitContacts,
} = require('../dist/index.cjs');

const docsDir = join(__dirname, '../docs');
mkdirSync(docsDir, { recursive: true });

// A fixed, arbitrary birth for a reproducible example — not anyone real.
// getHoroscope reads UTC fields (see its contract in README.md), so the date
// is built via Date.UTC rather than a string-parsed Date — otherwise this
// script would render a different chart depending on the machine's timezone.
const birth = { latitude: 40.7128, longitude: -74.006 }; // New York, NY
const natal = getHoroscope(new Date(Date.UTC(1990, 5, 15, 8, 30)), birth);

function writeSvg(name, element) {
  const markup = renderToStaticMarkup(element);
  // renderToStaticMarkup doesn't add the SVG namespace — fine inside an HTML
  // page, but a standalone .svg file needs it to render on its own (GitHub,
  // a browser tab, etc.).
  const svg = markup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const path = join(docsDir, name);
  writeFileSync(path, svg);
  console.log('wrote', path);
}

writeSvg(
  'example-natal.svg',
  createElement(AstrologyChart, { horoscope: natal, width: 640, height: 640 }),
);

const transitNow = getHoroscope(new Date(Date.UTC(2026, 8, 11, 12, 0)), birth);
const transitNext = getHoroscope(new Date(Date.UTC(2026, 8, 12, 12, 0)), birth);
const contacts = rankTransitContacts(getTransitContacts(natal, transitNow, transitNext));

writeSvg(
  'example-transit.svg',
  createElement(AstrologyChart, {
    horoscope: natal,
    width: 640,
    height: 640,
    transit: { horoscope: transitNow, contacts },
  }),
);

// Same birth, a time-based house system — cusps land at uneven angles instead
// of the default whole-sign's even 30° steps, so this is the clearest visual
// example of the houseSystem option.
const placidusNatal = getHoroscope(new Date(Date.UTC(1990, 5, 15, 8, 30)), birth, {
  houseSystem: 'placidus',
});

writeSvg(
  'example-placidus.svg',
  createElement(AstrologyChart, { horoscope: placidusNatal, width: 640, height: 640 }),
);

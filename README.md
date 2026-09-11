# react-natal-chart

A React component for rendering natal astrology charts (and transit bi-wheels)
as SVG, built on top of [`circular-natal-horoscope-js`](https://www.npmjs.com/package/circular-natal-horoscope-js).

> **Status:** early extraction in progress. The rendering components and
> supporting chart-summary types are being migrated out of a sibling app
> ([tarot-oracle-app](https://github.com/MenelaosI/tarot-oracle-app)), which
> remains this library's reference consumer.

## Install

```sh
npm install @menelaosi/react-natal-chart circular-natal-horoscope-js
```

## Usage

```tsx
import { Horoscope, Origin } from 'circular-natal-horoscope-js';
import { NatalChart } from '@menelaosi/react-natal-chart';

const origin = new Origin({
  year: 1990,
  month: 5, // 0-indexed
  date: 14,
  hour: 8,
  minute: 30,
  latitude: 40.7128,
  longitude: -74.006,
});

const horoscope = new Horoscope({ origin, houseSystem: 'placidus', zodiac: 'tropical' });

function App() {
  return <NatalChart horoscope={horoscope} width={600} height={600} />;
}
```

## Development

```sh
npm install
npm run build      # dist/ (ESM + CJS + .d.ts) via tsup
npm run typecheck
npm test
```

## License

MIT — see [LICENSE](./LICENSE).

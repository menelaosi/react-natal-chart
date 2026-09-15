// Domain types + lookup tables shared by the SVG chart, the chart summary, and
// the reading title. Sign labels match the library's capitalized Sign.label.

/** Where a chart is cast for — the minimal shape `getHoroscope` needs. */
export type Coordinates = {
  latitude: number;
  longitude: number;
};

/** A named location — coordinates plus what to call them in a chart summary. */
export type PlaceInput = Coordinates & {
  label: string;
};

export type Point = {
  x: number;
  y: number;
};

export type LocatedPoint = {
  planetName: Planet;
  point: Point;
  radius: number;
  angle: number;
  pointer: number;
};

/** A celestial body's ecliptic longitude plus whether it is retrograde at the chart's moment. */
export type CelestialBodyPosition = {
  longitude: number;
  retrograde: boolean;
};

export type DescriptionPosition = {
  text: string;
  point: Point;
};

export type DefaultDignities = {
  name: Planet;
  position: number;
  orbit: number;
};

export const Dignity = {
  Rulership: 'r',
  Detriment: 'd',
  Exaltation: 'e',
  ExactExaltation: 'E',
  Fall: 'f',
} as const;
export type Dignity = (typeof Dignity)[keyof typeof Dignity];

export const Planet = {
  Sun: 'sun',
  Moon: 'moon',
  Mercury: 'mercury',
  Venus: 'venus',
  Mars: 'mars',
  Jupiter: 'jupiter',
  Saturn: 'saturn',
  Uranus: 'uranus',
  Neptune: 'neptune',
  Pluto: 'pluto',
  Chiron: 'chiron',
  Sirius: 'sirius',
  Lilith: 'lilith',
  NorthNode: 'nnode',
  SouthNode: 'snode',
} as const;
export type Planet = (typeof Planet)[keyof typeof Planet];

export const SIGN_COLOR: Record<ZodiacSign, string> = {
  Aries: '#FF4500',
  Taurus: '#228B22',
  Gemini: '#ADD8E6',
  Cancer: '#4169E1',
  Leo: '#FFD700',
  Virgo: '#32CD32',
  Libra: '#D3D3D3',
  Scorpio: '#483D8B',
  Sagittarius: '#FF6347',
  Capricorn: '#808000',
  Aquarius: '#87CEFA',
  Pisces: '#4682B4',
};

export const SIGN_EMOJI: Record<ZodiacSign, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

export const PLANET_LABEL: Record<Planet, string> = {
  [Planet.Sun]: 'Sun',
  [Planet.Moon]: 'Moon',
  [Planet.Mercury]: 'Mercury',
  [Planet.Venus]: 'Venus',
  [Planet.Mars]: 'Mars',
  [Planet.Jupiter]: 'Jupiter',
  [Planet.Saturn]: 'Saturn',
  [Planet.Uranus]: 'Uranus',
  [Planet.Neptune]: 'Neptune',
  [Planet.Pluto]: 'Pluto',
  [Planet.Chiron]: 'Chiron',
  [Planet.Sirius]: 'Sirius',
  [Planet.Lilith]: 'Lilith',
  [Planet.NorthNode]: 'North Node',
  [Planet.SouthNode]: 'South Node',
};

export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

/** House cusp number, 1 through 12. */
export type CuspNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** 1-based zodiac position, e.g. zodiacNumber('Aries') === 1. */
export function zodiacNumber(sign: ZodiacSign): number {
  return ZODIAC_SIGNS.indexOf(sign) + 1;
}

/** Inverse of zodiacNumber; 1 -> 'Aries'. */
export function zodiacFromNumber(n: number): ZodiacSign {
  return ZODIAC_SIGNS[(n - 1) % 12];
}

// Values are indices into the 12-element cuspPositions array: the 1st, 4th, 7th,
// and 10th house cusps carry the four chart angles.
export const Axis = {
  Ascendant: 0,
  ImmumCoeli: 3,
  Descendant: 6,
  Midheaven: 9,
} as const;
export type Axis = (typeof Axis)[keyof typeof Axis];

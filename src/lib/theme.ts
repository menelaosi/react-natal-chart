// Colors and sizes the SVG chart draws with. Pure constants — no logic, no
// dependency on the ephemeris or the wheel geometry.

export const WHITE = '#ffffff'; // BACKGROUND_RULER
export const DARK_GRAY = '#333333'; // LINE_COLOR AND CIRCLE_COLOR AND SYMBOL_AXIS_FONT_COLOR
export const LIGHT_GRAY = '#d8dae6'; // marks in the margin, outside the white wheel, on the dark page
export const BLACK = '#000000'; // SIGNS_COLOR AND POINTS_COLOR AND CUSPS_FONT_COLOR
export const POINTS_TEXT_SIZE = 8;
export const POINTS_STROKE = '1.8';
export const MARGIN = 50;
export const PADDING = 18;
export const INDOOR_CIRCLE_RADIUS_RATIO = 2;
export const INNER_CIRCLE_RADIUS_RATIO = 8;
export const RULER_RADIUS = 4;
export const SYMBOL_AXIS_STROKE = 1.6;
export const CUSPS_STROKE = 1;
export const CIRCLE_STROKE = 2;
export const COLLISION_RADIUS = 10;

export const NEUTRAL_ASPECT_COLOR = '#9aa0b4';
const SOFT_ASPECT_COLOR = '#5b8def'; // sextile, trine — aspects that flow
const HARD_ASPECT_COLOR = '#e0555f'; // square, opposition — aspects that strain

// Hard aspects (square, opposition) strain; soft aspects (sextile, trine) flow;
// conjunction is a neutral blend. Unknown keys fall back to NEUTRAL_ASPECT_COLOR.
export const ASPECT_COLOR: Record<string, string> = {
  conjunction: NEUTRAL_ASPECT_COLOR,
  sextile: SOFT_ASPECT_COLOR,
  trine: SOFT_ASPECT_COLOR,
  square: HARD_ASPECT_COLOR,
  opposition: HARD_ASPECT_COLOR,
};

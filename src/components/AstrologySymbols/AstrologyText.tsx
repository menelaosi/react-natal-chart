import type { Point } from '../../types';

type AstrologyTextProps = {
  readonly text: string;
  readonly point: Point;
  readonly size: string | number;
  readonly color: string;
};

/** SVG <text> primitive, vertically centred on its point. */
function AstrologyText({ text, point: { x, y }, size, color }: AstrologyTextProps) {
  return (
    <text x={x} y={y} fontSize={size} fill={color} fontFamily="serif" dominantBaseline="central">
      {text}
    </text>
  );
}

export default AstrologyText;

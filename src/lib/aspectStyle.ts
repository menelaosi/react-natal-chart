export type AspectLine = {
  aspect: string; // conjunction | sextile | square | trine | opposition
  from: number; // ecliptic longitude of each endpoint, in wheel degrees
  to: number;
  orb: number; // how far from exact this aspect is, and the max orb allowed for it
  orbUsed: number;
};

/** Function to calculate exact ratio for scoring and aspect lines */
export function calculateExactness(orb: number, orbUsed: number): number {
  return 1 - Math.min(orb / orbUsed, 1);
}

/** Line weight + opacity for an aspect, louder the closer it is to exact. */
export function aspectLineStyle(orb: number, orbUsed: number) {
  const exactness = calculateExactness(orb, orbUsed);
  return { strokeWidth: 0.5 + exactness * 1.2, opacity: 0.35 + exactness * 0.5 };
}

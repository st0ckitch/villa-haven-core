export function pickGridCols(n: number, max = 5, min = 3): number {
  if (n <= 0) return 1;
  if (n <= max) return n;
  for (let c = max; c >= min; c--) {
    if (n % c === 0) return c;
  }
  let best = max;
  let bestLast = n % max || max;
  for (let c = max - 1; c >= min; c--) {
    const last = n % c || c;
    if (last > bestLast) { best = c; bestLast = last; }
  }
  return best;
}

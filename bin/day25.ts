import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines('input/day25.txt');

type Grid = Map<string, string>;


let grid: Grid = new Map();
let maxX: number, maxY: number;

const key    = (x: number, y: number): string => `${x},${y}`;
const ksplit = (key: string): number[] => key.split(',').map(Number);

lines.forEach((line, y) => {
  line.split('').forEach((c, x) => {
    maxX = x;
    if (c === '.') return;
    grid.set(key(x, y), c);
  });

  maxY = y;
});

const runStep = (grid: Grid): [Grid, boolean] => {
  const next: Grid = new Map();
  let moved = false;

  for (const [k, kind] of grid.entries()) {
    if (kind !== '>') continue;

    const [x, y] = ksplit(k);
    const nextX = (x + 1) % (maxX + 1);
    const nextK = key(nextX, y);

    if (grid.has(nextK)) {
      next.set(k, kind);
    } else {
      moved = true;
      next.set(nextK, kind);
    }
  }

  // delete all the east-facing slugs; they've moved now
  Array.from(grid.entries())
    .filter(([_, kind]) => kind === '>')
    .forEach(([k, _]) => grid.delete(k));

  for (const [k, kind] of grid.entries()) {
    if (kind !== 'v') continue;

    const [x, y] = ksplit(k);
    const nextY = (y + 1) % (maxY + 1);
    const nextK = key(x, nextY);

    if (next.has(nextK) || grid.has(nextK)) {
      next.set(k, kind);
    } else {
      moved = true;
      next.set(nextK, kind);
    }
  }

  return [next, moved];
};

for (let steps = 1, moved = true; moved; steps++) {
  [grid, moved] = runStep(grid);

  if (! moved) {
    console.log(`part 1: ${steps}`);
  }
}


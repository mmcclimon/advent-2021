import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

type Grid = DefaultMap<string, number>;

const lines = fileLines("input/day11.txt");
const grid: Grid = new DefaultMap(0);

lines.forEach((line, row) => {
  line.split("").forEach((c, col) => {
    grid.set(`${row}#${col}`, Number(c));
  });
});

const neighborsOf = (grid: Grid, key: string): string[] => {
  const [row, col] = key.split("#");
  const candidates: string[] = [];
  [-1, 0, 1].forEach((dr) => {
    [-1, 0, 1].forEach((dc) => {
      const k = [Number(row) + dr, Number(col) + dc].join("#");
      if (grid.has(k) && k !== key) {
        candidates.push(k);
      }
    });
  });

  return candidates;
};

const runStep = (grid: Grid): number => {
  // first, inc all
  Array.from(grid.keys()).forEach((k) => grid.set(k, grid.get(k) + 1));

  // flash everything
  const toFlash: Set<string> = new Set();
  const flashed: Set<string> = new Set();

  Array.from(grid.entries()).filter(([_, v]) => v > 9).forEach(([k, _]) =>
    toFlash.add(k)
  );

  while (toFlash.size) {
    const thisK = Array.from(toFlash.values())[0];
    toFlash.delete(thisK);

    flashed.add(thisK);

    neighborsOf(grid, thisK).forEach((k) => {
      const val = grid.get(k) + 1;
      grid.set(k, val);

      if (val > 9 && !flashed.has(k)) toFlash.add(k);
    });
  }

  // set everything that flashed to 0
  flashed.forEach((k) => grid.set(k, 0));

  return flashed.size;
};

// gooooo
let steps = 0;
let total = 0;

while (true) {
  const flashed = runStep(grid);
  total += flashed;
  steps++;

  if (steps === 100) console.log(`part 1: ${total}`);
  if (flashed === grid.size) break;
}

console.log(`part 2: ${steps}`);

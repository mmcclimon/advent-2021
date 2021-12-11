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
  const [row, col] = key.split("#").map(Number);

  return [-1, 0, 1].map((dr) =>
    [-1, 0, 1].map((dc) => [row + dr, col + dc].join("#"))
  ).flat().filter((k) => grid.has(k) && k !== key);
};

const runStep = (grid: Grid): number => {
  // first, inc all
  grid.forEach((v, k) => grid.set(k, v + 1));

  // flash everything > 9
  const flashed: Set<string> = new Set();
  const toFlash: Set<string> = new Set(
    Array.from(grid.keys()).filter((k) => grid.get(k) > 9),
  );

  while (toFlash.size) {
    // pop off an element and process it
    const key = toFlash.values().next().value;
    toFlash.delete(key);
    flashed.add(key);

    // increment every neighbor; if it hasn't already flashed this time, it
    // goes off too.
    neighborsOf(grid, key).forEach((k) => {
      const newval = grid.get(k) + 1;
      grid.set(k, newval);

      if (newval > 9 && !flashed.has(k)) toFlash.add(k);
    });
  }

  // set everything that flashed to 0
  flashed.forEach((k) => grid.set(k, 0));
  return flashed.size;
};

// gooooo
let total = 0;

for (let step = 1; true; step++) {
  const flashed = runStep(grid);
  total += flashed;

  if (step === 100) console.log(`part 1: ${total}`);
  if (flashed === grid.size) {
    console.log(`part 2: ${step}`);
    break;
  }
}

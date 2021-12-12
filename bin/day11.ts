import { fileLines } from "../lib/advent-utils.ts";
import { NumberGrid } from "../lib/grid.ts";

const lines = fileLines("input/day11.txt");
const grid = new NumberGrid(lines);

const runStep = (grid: NumberGrid): number => {
  // first, inc all
  grid.forEach((_, k) => grid.inc(k));

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
    grid.neighborKeys(key).forEach((k) => {
      const newval = grid.inc(k);
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

import { fileLines } from "../lib/advent-utils.ts";

const [line] = fileLines("input/day6.txt");
const input = line.split(",").map((n) => parseInt(n));
const _test = [3, 4, 3, 1, 2];

// modifies list in place
const runGeneration = (before: Map<number, number>): Map<number, number> => {
  const after = new Map();

  Array.from(before.entries()).forEach(([k, v]) => {
    if (k === 0) {
      after.set(8, (after.get(8) || 0) + v);
      after.set(6, (after.get(6) || 0) + v);
    } else {
      after.set(k - 1, (after.get(k - 1) || 0) + v);
    }
  });

  return after;
};

const runDays = (fish: number[], days: number) => {
  let m = new Map();
  fish.forEach((f) => {
    m.set(f, (m.get(f) || 0) + 1);
  });

  for (let i = 0; i < days; i++) {
    m = runGeneration(m);
  }

  return Array.from(m.values()).reduce((sum, el) => sum + el, 0);
};

console.log(runDays(input, 80));
console.log(runDays(input, 256));

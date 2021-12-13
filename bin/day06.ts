import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

const [line] = fileLines("input/day6.txt");
const input = line.split(",").map((n) => parseInt(n));
const _test = [3, 4, 3, 1, 2];

type FishMap = DefaultMap<number, number>;

// modifies list in place
const runGeneration = (before: FishMap): FishMap => {
  const after: FishMap = new DefaultMap(0);

  Array.from(before.entries()).forEach(([k, v]) => {
    if (k === 0) {
      after.set(8, after.get(8) + v);
      after.set(6, after.get(6) + v);
    } else {
      after.set(k - 1, after.get(k - 1) + v);
    }
  });

  return after;
};

const runDays = (fish: number[], days: number) => {
  let m: FishMap = new DefaultMap(0);
  fish.forEach((f) => {
    m.set(f, m.get(f) + 1);
  });

  for (let i = 0; i < days; i++) {
    m = runGeneration(m);
  }

  return Array.from(m.values()).reduce((sum, el) => sum + el, 0);
};

console.log(runDays(input, 80));
console.log(runDays(input, 256));

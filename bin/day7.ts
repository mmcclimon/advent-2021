import { fileLines } from "../lib/advent-utils.ts";

const _test = [16, 1, 2, 0, 4, 2, 7, 1, 2, 14];

const [line] = fileLines("input/day7.txt");
const input = line.split(",").map((n) => parseInt(n));

const cache = new Map();
const costFor = (n: number, part2 = false): number => {
  if (!part2) return n;

  const have = cache.get(n);
  if (typeof have !== "undefined") return have;

  if (n <= 0) return 0;

  const cost = n + costFor(n - 1, part2);
  cache.set(n, cost);
  return cost;
};

const calculate = (nums: number[], part2 = false): number => {
  const min = Math.min(...nums);
  const max = Math.max(...nums);

  let best = Infinity;

  outer:
  for (let i = min; i <= max; i++) {
    let running = 0;

    for (const elem of nums) {
      running += costFor(Math.abs(elem - i), part2);

      if (running > best) continue outer;
    }

    best = running;
  }

  return best;
};

console.log(`part 1: ${calculate(input)}`);
console.log(`part 2: ${calculate(input, true)}`);

import { fileLines } from "../lib/advent-utils.ts";
import { NumberGrid } from "../lib/grid.ts";

const lines = fileLines("input/day9.txt");
const grid = new NumberGrid(lines);

const findLowPoints = (grid: NumberGrid): string[] => {
  const lowPoints = [];

  for (const [key, num] of grid.entries()) {
    if (num === 9) continue;

    const neighbors = grid.neighborValues(key, false);

    if (num === Math.min(num, ...neighbors)) {
      lowPoints.push(key);
    }
  }

  return lowPoints;
};

const calcBasins = (grid: NumberGrid, lowPoints: string[]): number[] => {
  const basins = [];

  // every year I say I'm gonna learn DFS, and every year I copy it from dang
  // wikipedia
  for (const lowPoint of lowPoints) {
    const S = [lowPoint];
    const seen = new Set();

    while (S.length > 0) {
      const point = S.pop();
      if (typeof point === "undefined") throw "come on man, what";

      if (!seen.has(point)) {
        seen.add(point);
        S.push(
          ...grid.neighborKeys(point, false).filter((k) => grid.get(k) !== 9),
        );
      }
    }

    basins.push(seen.size);
  }

  return basins;
};

const lowPoints = findLowPoints(grid);
const part1 =
  lowPoints.map((k) => grid.get(k)).reduce((sum, el) => sum + el, 0) +
  lowPoints.length;

const part2 = calcBasins(grid, lowPoints).sort((a, b) => b - a).slice(0, 3)
  .reduce((prod, el) => prod * el, 1);

console.log(`part 1: ${part1}`);
console.log(`part 2: ${part2}`);

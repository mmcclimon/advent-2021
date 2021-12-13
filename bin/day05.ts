import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day5.txt");

const _test = [
  "0,9 -> 5,9",
  "8,0 -> 0,8",
  "9,4 -> 3,4",
  "2,2 -> 2,1",
  "7,0 -> 7,4",
  "6,4 -> 2,0",
  "0,9 -> 2,9",
  "3,4 -> 1,4",
  "0,0 -> 8,8",
  "5,5 -> 8,2",
];

const parseLine = (line: string): [number, number][] => {
  const [start, end] = line.split(" -> ");
  const [startX, startY] = start.split(",").map(Number);
  const [endX, endY] = end.split(",").map(Number);

  const numSteps = Math.max(Math.abs(startX - endX), Math.abs(startY - endY));

  const xStep = (endX - startX) / numSteps;
  const yStep = (endY - startY) / numSteps;

  const ret = [];

  for (
    let i = 0, thisX = startX, thisY = startY;
    i <= numSteps;
    i++, thisX += xStep, thisY += yStep
  ) {
    ret.push([thisX, thisY] as [number, number]);
  }

  return ret;
};

const calculate = (lines: string[]) => {
  const grid1: DefaultMap<string, number> = new DefaultMap(0);
  const grid2: DefaultMap<string, number> = new DefaultMap(0);

  for (const line of lines) {
    const points = parseLine(line);

    const isHorizontal = points.every(([x, _]) => x == points[0][0]);
    const isVertical = points.every(([_, y]) => y == points[0][1]);

    points.forEach((pair) => {
      const k = pair.join("#");
      if (isHorizontal || isVertical) {
        grid1.set(k, grid1.get(k) + 1);
      }
      grid2.set(k, grid2.get(k) + 1);
    });
  }

  const findOverlaps = (grid: DefaultMap<string, number>) =>
    Array.from(grid.values()).filter((v) => v > 1).length;

  console.log(`part 1: ${findOverlaps(grid1)}`);
  console.log(`part 2: ${findOverlaps(grid2)}`);
};

calculate(lines);

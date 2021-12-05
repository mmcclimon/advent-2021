import { fileLines } from "../lib/advent-utils.ts";

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
  const [startX, startY] = start.split(",").map((n) => parseInt(n));
  const [endX, endY] = end.split(",").map((n) => parseInt(n));

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
  const grid1 = new Map();
  const grid2 = new Map();

  for (const line of lines) {
    const points = parseLine(line);

    const isHorizontal = points.map(([x, _]) => x).every((v) =>
      v == points[0][0]
    );
    const isVertical = points.map(([_, y]) => y).every((v) =>
      v == points[0][1]
    );

    points.forEach((pair) => {
      const k = pair.join("#");
      if (isHorizontal || isVertical) {
        grid1.set(k, (grid1.get(k) || 0) + 1);
      }
      grid2.set(k, (grid2.get(k) || 0) + 1);
    });
  }

  const findOverlaps = (grid: Map<string, number>) =>
    Array.from(grid.values()).filter((v) => v > 1).length;

  console.log(`part 1: ${findOverlaps(grid1)}`);
  console.log(`part 2: ${findOverlaps(grid2)}`);
};

calculate(lines);

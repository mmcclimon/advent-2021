import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day13.txt");

const sheet: Set<string> = new Set();
const instructions: string[] = [];

lines.forEach((line) => {
  if (line.match(/fold/)) {
    instructions.push(line);
  } else {
    sheet.add(line);
  }
});

const fold = (line: string) => {
  const match = line.match(/([xy])=(\d+)$/);
  if (!match) throw `bad line: ${line}`;

  const dir = match[1];
  const n = Number(match[2]);

  Array.from(sheet.keys()).forEach((k) => {
    const [x, y] = k.split(",").map(Number);

    if (dir === "x" && x > n) {
      sheet.delete(k);
      const newX = n - (x - n);
      sheet.add(`${newX},${y}`);
    }

    if (dir === "y" && y > n) {
      sheet.delete(k);
      const newY = n - (y - n);
      sheet.add(`${x},${newY}`);
    }
  });
};

// could be improved a bit.
const printIt = () => {
  const out: string[][] = [];
  let maxX = 0, maxY = 0;

  sheet.forEach((k) => {
    const [col, row] = k.split(",").map(Number);
    out[row] ??= [];
    out[row][col] = "█";

    if (row > maxX) maxX = row;
    if (col > maxY) maxY = col;
  });

  for (let r = 0; r <= maxX; r++) {
    let line = "";
    for (let c = 0; c <= maxY; c++) {
      line += out[r][c] ?? " ";
    }
    console.log(line);
  }
};

instructions.forEach((inst, n) => {
  fold(inst);
  if (n === 0) {
    console.log(`part 1: ${sheet.size}`);
  }
});

console.log("part 2:");
printIt();

// fold(instructions[1]);
// console.log(sheet);
// console.log(sheet.size);

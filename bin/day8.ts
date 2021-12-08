import { fileLines } from "../lib/advent-utils.ts";

const fileInput = fileLines("input/day8.txt");

const digitFor = (s: string): number | undefined => {
  switch (s.length) {
    case 2:
      return 1;
    case 3:
      return 7;
    case 4:
      return 4;
    case 7:
      return 8;
    default:
      return;
  }
};

const parseLine = (line: string) => {
  const [input, output] = line.split(" | ").map((s) => s.split(" "));
  const full = [...input, ...output];

  const m = [];

  for (const word of full) {
    switch (word.length) {
      case 2: // 1
        m[1] = word;
        break;
      case 3: // 7
        m[7] = word;
        break;
      case 4: // 4
        m[4] = word;
        break;
      case 7: // 8
        m[8] = word;
        break;
    }
  }

  for (const word of full) {
    const s = new Set(word);

    if (word.length === 6) { // 0, 6, or 9
      // if everything in 4 is also in this, it's 9
      if (Array.from(m[4]).every((seg) => s.has(seg))) {
        m[9] = word;
      } else {
        // if everything in 1 is also in this, it's 0, otherwise it's 6
        if (Array.from(m[1]).every((seg) => s.has(seg))) {
          m[0] = word;
        } else {
          m[6] = word;
        }
      }
    } else if (word.length === 5) { // 2, 3, or 5
      // if it's got all of 1, it's 3
      if (Array.from(m[1]).every((seg) => s.has(seg))) {
        m[3] = word;
      } else {
        // grab top-left and middle segments from 4; if it's got those, it's
        // 5, otherwise 2
        const relevant = new Set(m[4]);
        Array.from(m[1]).forEach((c) => relevant.delete(c));

        if (Array.from(relevant).every((seg) => s.has(seg))) {
          m[5] = word;
        } else {
          m[2] = word;
        }
      }
    }
  }

  const lookup = new Map();
  m.forEach((s, idx) => lookup.set(s.split("").sort().join(""), idx));

  const s = output.map((word) =>
    String(lookup.get(word.split("").sort().join("")) ?? "X")
  ).join("");

  return Number(s);
};

const part1 = (lines: string[]): number => {
  let total = 0;
  for (const line of lines) {
    const [_input, output] = line.split(" | ");

    for (const s of output.split(" ")) {
      const d = digitFor(s);
      total += d ? 1 : 0;
    }
  }
  return total;
};

const part2 = (lines: string[]): number => {
  let total = 0;
  for (const line of lines) {
    const s = parseLine(line);
    total += s;
  }
  return total;
};

console.log(part1(fileInput));
console.log(part2(fileInput));

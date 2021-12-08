import { fileLines, UsableSet } from "../lib/advent-utils.ts";

const fileInput = fileLines("input/day8.txt");

const parseLine = (line: string) => {
  const [input, output] = line.split(" | ").map((s) =>
    s.split(" ").map((word) => word.split("").sort().join(""))
  );
  const full = [...input, ...output];

  const m = [];

  for (const word of full) {
    const len = word.length;

    // deno-fmt-ignore
    const idx = len === 2 ? 1
              : len === 3 ? 7
              : len === 4 ? 4
              : len === 7 ? 8
              : null;

    if (idx) m[idx] = word;
  }

  // we can actually do everything we want with just one and 4
  const one = new UsableSet(m[1]);
  const four = new UsableSet(m[4]);
  const northwest = four.difference(one); // top-left and middle segments

  for (const word of full) {
    const chars = new UsableSet(word);

    if (word.length === 6) { // 0, 6, or 9
      // deno-fmt-ignore
      const idx = chars.isSupersetOf(four) ? 9
                : chars.isSupersetOf(one)  ? 0
                :                            6;

      m[idx] = word;
    }

    if (word.length === 5) { // 2, 3, or 5
      // deno-fmt-ignore
      const idx = chars.isSupersetOf(one)       ? 3
                : chars.isSupersetOf(northwest) ? 5
                :                                 2;

      m[idx] = word;
    }
  }

  const lookup = new Map();
  m.forEach((s, idx) => lookup.set(s, idx));

  return Number(output.map((word) => String(lookup.get(word) ?? "X")).join(""));
};

const part1 = (lines: string[]): number =>
  lines.map((line) => String(parseLine(line)).match(/[1478]/g)).reduce(
    (sum, match) => sum += match ? match.length : 0,
    0,
  );

const part2 = (lines: string[]): number =>
  lines.reduce((sum, line) => sum + parseLine(line), 0);

console.log(part1(fileInput));
console.log(part2(fileInput));

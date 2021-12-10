import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day10.txt");
const _test = [
  "[({(<(())[]>[[{[]{<()<>>",
  "[(()[<>])]({[<{<<[]>>(",
  "{([(<{}[<>[]}>{[]{[(<()>",
  "(((({<>}<{<{<>}{[]{[]{}",
  "[[<[([]))<([[{}[[()]]]",
  "[{[{({}]{}}([{[{{{}}([]",
  "{<[[]]>}<{[{[{[]{()[[[]",
  "[<(<(<(<{}))><([]([]()",
  "<{([([[(<>()){}]>(<<{{",
  "<{([{{}}[<[[[<>{}]]]>[]]",
];

const pairs = new Map([
  ["(", ")"],
  ["{", "}"],
  ["<", ">"],
  ["[", "]"],
]);

interface Score {
  [index: string]: number;
}

// [completion, badChar]
const parseLine = (s: string): [string[] | null, string | null] => {
  const stack = [];
  for (const c of s) {
    if (pairs.has(c)) {
      stack.push(c);
      continue;
    }

    const prev = stack.pop() || "";
    if (c !== pairs.get(prev)) {
      return [null, c];
    }
  }

  return [stack.reverse().map((c) => pairs.get(c) || ""), null];
};

const scores1: Score = { ")": 3, "]": 57, "}": 1197, ">": 25137 };
const scores2: Score = { ")": 1, "]": 2, "}": 3, ">": 4 };

const scoreFor = (c: string, part: number): number => {
  const which = part == 1 ? scores1 : scores2;
  return which[c] ?? 0;
};

const calculate = (lines: string[]): [number, number] => {
  let part1 = 0;
  const part2: number[] = [];

  lines.forEach((line) => {
    const [completion, badChar] = parseLine(line);

    if (badChar) {
      part1 += scoreFor(badChar, 1);
    }

    if (completion) {
      part2.push(completion.reduce((prod, c) => prod * 5 + scoreFor(c, 2), 0));
    }
  });

  part2.sort((a, b) => a - b);

  return [part1, part2[Math.floor(part2.length / 2)]];
};

const [part1, part2] = calculate(lines);
console.log(`part 1: ${part1}`);
console.log(`part 2: ${part2}`);

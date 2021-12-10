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

const firstBadChar = (s: string): [string | undefined, string[]] => {
  const stack = [];
  for (const c of s) {
    if (pairs.has(c)) {
      stack.push(c);
      continue;
    }

    const prev = stack.pop() || "";

    if (c !== pairs.get(prev)) {
      return [c, stack];
    }
  }

  return [undefined, stack];
};

const part1 = (lines: string[]): number => {
  let total = 0;
  for (const line of lines) {
    const [c] = firstBadChar(line);
    total += c === ")"
      ? 3
      : c === "]"
      ? 57
      : c === "}"
      ? 1197
      : c === ">"
      ? 25137
      : 0;
  }

  return total;
};

const part2 = (lines: string[]): number => {
  const scores = [];

  for (const line of lines) {
    const [bad, stack] = firstBadChar(line);
    if (bad) continue;

    let total = 0;
    while (stack.length > 0) {
      const c = pairs.get(stack.pop() || "");
      const points = c === ")"
        ? 1
        : c === "]"
        ? 2
        : c === "}"
        ? 3
        : c === ">"
        ? 4
        : 0;

      total = total * 5 + points;
    }

    scores.push(total);
  }

  return scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
};

console.log(part1(lines));
console.log(part2(lines));

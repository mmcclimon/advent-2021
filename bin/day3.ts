import { fileLines, range } from "../lib/advent-utils.ts";

const lines = fileLines("input/day3.txt");

const _test = [
  "00100",
  "11110",
  "10110",
  "10111",
  "10101",
  "01111",
  "00111",
  "11100",
  "10000",
  "11001",
  "00010",
  "01010",
];

// [most common, least common]
const bitCriteria = (lines: string[], pos: number): [string, string] => {
  const count = lines.reduce(
    (count, cur) => count + parseInt(cur.charAt(pos)),
    0,
  );

  return (count >= lines.length / 2 ? ["1", "0"] : ["0", "1"]);
};

const part1 = (lines: string[]) => {
  let gamma = "";
  let epsilon = "";
  for (const pos of range(lines[0].length)) {
    const [most, least] = bitCriteria(lines, pos);
    gamma += most;
    epsilon += least;
  }

  return parseInt(gamma, 2) * parseInt(epsilon, 2);
};

const part2 = (lines: string[]) => {
  const reduce = (bias: number): number => {
    let arr = lines.slice();
    for (let i = 0; arr.length > 1; i++) {
      const choose = bitCriteria(arr, i)[bias];
      arr = arr.filter((s) => s[i] === choose);
    }

    return parseInt(arr[0], 2);
  };

  return reduce(0) * reduce(1);
};

console.log(part1(lines));
console.log(part2(lines));

import { fileLines } from "../lib/advent-utils.ts";

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

const part1 = (lines: string[]) => {
  const data: number[] = [];

  for (const n of lines) {
    for (let i = 0; i < n.length; i++) {
      data[i] ||= 0;
      data[i] += parseInt(n.charAt(i));
    }
  }

  const threshold = lines.length / 2;
  let gamma = "";
  let epsilon = "";
  for (const pos of data) {
    if (pos > threshold) {
      gamma += "1";
      epsilon += "0";
    } else {
      gamma += "0";
      epsilon += "1";
    }
  }

  return parseInt(gamma, 2) * parseInt(epsilon, 2);
};

// [most common, least common]
const bitCriteria = (lines: string[], pos: number): [string, string] => {
  let count = 0;
  for (const n of lines) {
    count += parseInt(n.charAt(pos));
  }

  const threshold = lines.length / 2;
  return (count >= threshold ? ["1", "0"] : ["0", "1"]);
};

const part2 = (lines: string[]) => {
  let oxygen = lines.slice();
  let i = 0;
  while (oxygen.length > 1) {
    const choose = bitCriteria(oxygen, i)[0];
    oxygen = oxygen.filter((s) => s[i] === choose);
    i++;
  }

  let co2 = lines.slice();
  i = 0;
  while (co2.length > 1) {
    const choose = bitCriteria(co2, i)[1];
    co2 = co2.filter((s) => s[i] === choose);
    i++;
  }

  const ox = parseInt(oxygen[0], 2);
  const co = parseInt(co2[0], 2);
  return ox * co;
};

console.log(part1(lines));
console.log(part2(lines));

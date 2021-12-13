import { fileLines } from "../lib/advent-utils.ts";

const _test = [
  "forward 5",
  "down 5",
  "forward 8",
  "up 3",
  "down 8",
  "forward 2",
];

const lines = fileLines("input/day2.txt");

const calculate = (lines: string[], part2: boolean): number =>
  lines.map((line) => line.split(" "))
    .map(([dir, num]): [string, number] => [dir, parseInt(num)])
    .reduce(([h, v, aim], [dir, amt]) => [
      dir === "forward" ? h + amt : h,
      part2
        ? (dir === "forward" ? v + aim * amt : v)
        : (dir === "up" ? v - amt : dir === "down" ? v + amt : v),
      dir === "up" ? aim - amt : dir === "down" ? aim + amt : aim,
    ], [0, 0, 0])
    .slice(0, 2)
    .reduce((prod, cur) => prod * cur, 1);

const part1 = (lines: string[]): number => calculate(lines, false);
const part2 = (lines: string[]): number => calculate(lines, true);

console.log(part1(lines));
console.log(part2(lines));

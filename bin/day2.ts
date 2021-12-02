import { fileLines } from "../lib/advent-utils.ts";

let _test = [
  "forward 5",
  "down 5",
  "forward 8",
  "up 3",
  "down 8",
  "forward 2",
];

const lines = fileLines("input/day2.txt");

function part1(lines: string[]): number {
  let h = 0;
  let v = 0;

  for (const line of lines) {
    const [dir, num] = line.split(" ");
    const amt = parseInt(num);

    switch (dir) {
      case "forward":
        h += amt;
        break;
      case "down":
        v += amt;
        break;
      case "up":
        v -= amt;
        break;
    }
  }

  return h * v;
}

function part2(lines: string[]): number {
  let h = 0;
  let v = 0;
  let aim = 0;

  for (const line of lines) {
    const [dir, num] = line.split(" ");
    const amt = parseInt(num);

    switch (dir) {
      case "forward":
        h += amt;
        v += aim * amt;
        break;
      case "down":
        aim += amt;
        break;
      case "up":
        aim -= amt;
        break;
    }
  }

  return h * v;
}

console.log(part1(lines));
console.log(part2(lines));

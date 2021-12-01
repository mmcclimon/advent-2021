import { fileLinesInt } from "../lib/advent-utils.ts";

const lines = fileLinesInt("input/day1.txt");

const _test = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263];

function part1(nums: number[]): number {
  let increases = 0;
  let prev = Infinity;

  for (const val of nums) {
    if (val > prev) {
      increases++;
    }

    prev = val;
  }

  return increases;
}

function part2(nums: number[]): number {
  let increases = 0;
  let prev = Infinity;

  const len = nums.length;
  for (let i = 0; i < len - 2; i++) {
    const sum = nums[i] + nums[i + 1] + nums[i + 2];

    if (sum > prev) {
      increases++;
    }

    prev = sum;
  }

  return increases;
}

console.log(part1(lines));
console.log(part2(lines));

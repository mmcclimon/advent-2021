import { fileLinesInt } from "../lib/advent-utils.ts";

// const _test = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263];
const lines = fileLinesInt("input/day1.txt");

const part1 = (nums: number[]): number =>
  nums.reduce(([sum, prev], val) => {
    return [val > prev ? sum + 1 : sum, val];
  }, [0, Infinity])[0];

const part2 = (nums: number[]): number =>
  part1(nums.map((el, idx) => el + nums[idx + 1] + nums[idx + 2]).slice(0, -2));

console.log(part1(lines));
console.log(part2(lines));

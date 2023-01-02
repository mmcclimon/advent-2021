import { fileLines } from "../lib/advent-utils.ts";

class Range {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  get span(): number {
    return (this.end - this.start) + 1;
  }

  intersection(other: Range): Range | undefined {
    const left = Math.max(this.start, other.start);
    const right = Math.min(this.end, other.end);
    return left <= right ? new Range(left, right) : undefined;
  }
}

class Cuboid {
  overlaps: Cuboid[];
  xrange: Range;
  yrange: Range;
  zrange: Range;
  kind: 'off' | 'on';

  constructor(xrange, yrange, zrange, kind) {
    this.xrange = xrange;
    this.yrange = yrange;
    this.zrange = zrange;
    this.kind = kind ?? 'off';
    this.overlaps = [];
  }

  static fromString(line) {
    const LINE_REGEX = /^(\w+) x=(.*?),y=(.*?),z=(.*)$/;
    const [, pos, xs, ys, zs] = line.match(LINE_REGEX);
    const [x1, x2] = xs.split('..').map(Number);
    const [y1, y2] = ys.split('..').map(Number);
    const [z1, z2] = zs.split('..').map(Number);

    return new Cuboid(
      new Range(x1, x2),
      new Range(y1, y2),
      new Range(z1, z2),
      pos,
    );
  }

  // our volume, minuse the volume of all of our overlaps
  get volume(): number {
    return this.xrange.span * this.yrange.span * this.zrange.span
         - this.overlaps.map(c => c.volume).reduce((acc, el) => acc + el, 0);
  }

  intersection(other: Cuboid): Cuboid | undefined {
    const xInt = this.xrange.intersection(other.xrange);
    const yInt = this.yrange.intersection(other.yrange);
    const zInt = this.zrange.intersection(other.zrange);

    if ([xInt, yInt, zInt].some(el => typeof el === 'undefined'))  {
      return;
    }

    return new Cuboid(xInt, yInt, zInt);
  }

  subtractOverlap(other: Cuboid): number {
    const overlap = this.intersection(other);
    if (! overlap) return;

    this.overlaps.forEach(cube => cube.subtractOverlap(overlap));
    this.overlaps.push(overlap);
  }
}

const lines: string[] = fileLines("input/day22.txt");

// array of cuboids
const core1 = [];
const core2 = [];

const fifty = new Range(-50, 50);
const initRegion = new Cuboid(fifty, fifty, fifty);

for (const line of lines) {
  const cube = Cuboid.fromString(line);

  core2.forEach(item => item.subtractOverlap(cube));
  if (cube.kind === 'on') {
    core2.push(cube);
  }

  // compute part 1 after
  const initCube = initRegion.intersection(cube);
  if (! initCube) continue;

  core1.forEach(item => item.subtractOverlap(initCube));
  if (cube.kind === 'on') {
    core1.push(initCube);
  }
}

const part1 = core1.map(c => c.volume).reduce((acc, el) => acc + el, 0);
const part2 = core2.map(c => c.volume).reduce((acc, el) => acc + el, 0);

console.log(`part 1: ${part1}`);
console.log(`part 2: ${part2}`);

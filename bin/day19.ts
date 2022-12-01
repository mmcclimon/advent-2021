import { DefaultMap, fileLines, UsableSet } from "../lib/advent-utils.ts";

type Triple = [number, number, number];

const lines = fileLines("input/day19test.txt");

const rots = [
  ([x, y, z]: Triple): Triple => [x, y, z],
  ([x, y, z]: Triple): Triple => [y, z, x],
  ([x, y, z]: Triple): Triple => [z, x, y],
  ([x, y, z]: Triple): Triple => [-x, z, y],
  ([x, y, z]: Triple): Triple => [z, y, -x],
  ([x, y, z]: Triple): Triple => [y, -x, z],
  ([x, y, z]: Triple): Triple => [x, z, -y],
  ([x, y, z]: Triple): Triple => [z, -y, x],
  ([x, y, z]: Triple): Triple => [-y, x, z],
  ([x, y, z]: Triple): Triple => [x, -z, y],
  ([x, y, z]: Triple): Triple => [-z, y, x],
  ([x, y, z]: Triple): Triple => [y, x, -z],
  ([x, y, z]: Triple): Triple => [-x, -y, z],
  ([x, y, z]: Triple): Triple => [-y, z, -x],
  ([x, y, z]: Triple): Triple => [z, -x, -y],
  ([x, y, z]: Triple): Triple => [-x, y, -z],
  ([x, y, z]: Triple): Triple => [y, -z, -x],
  ([x, y, z]: Triple): Triple => [-z, -x, y],
  ([x, y, z]: Triple): Triple => [x, -y, -z],
  ([x, y, z]: Triple): Triple => [-y, -z, x],
  ([x, y, z]: Triple): Triple => [-z, x, -y],
  ([x, y, z]: Triple): Triple => [-x, -z, -y],
  ([x, y, z]: Triple): Triple => [-z, -y, -x],
  ([x, y, z]: Triple): Triple => [-y, -x, -z],
];

class Scanner {
  num: number;
  coords: Triple[];
  distances: Map<string, [Triple, Triple]>;
  transform?: (coord: Triple) => Triple;
  transformSource?: number;
  originRelativeToZero?: Triple;

  constructor(title: string, coords: string[]) {
    this.num = Number(title.replace(/[^0-9]/g, ""));
    this.coords = coords.map((line) => line.split(",").map(Number) as Triple);
    this.distances = new Map();
  }

  distanceSet(): UsableSet<string> {
    if (this.distances.size) {
      return new UsableSet(this.distances.keys());
    }

    // for every pair, add their distance to the set
    for (let i = 0; i < this.coords.length; i++) {
      for (let j = i + 1; j < this.coords.length; j++) {
        const a = this.coords[i].slice().map(Math.abs);
        const b = this.coords[j].slice().map(Math.abs);

        const dist = [b[0] - a[0], b[1] - a[1], b[2] - a[2]].map(Math.abs).sort(
          (a, b) => a - b,
        );

        this.distances.set(
          dist.join(","),
          [this.coords[i].slice() as Triple, this.coords[j].slice() as Triple],
        );
      }
    }

    return new UsableSet(this.distances.keys());
  }

  transformedCoords() {
    if (!this.transform) throw new Error("cannot transform");
    return this.coords.map(this.transform);
  }

  numPointsInCommonWith(other: Scanner): number {
    const mySet = this.distanceSet();
    return mySet.intersection(other.distanceSet()).size;
  }

  coordsRelativeTo(other: Scanner) {
    const common = this.distanceSet().intersection(other.distanceSet());
    const myVals = Array.from(common.keys()).map((k) => this.distances.get(k));
    const otherVals = Array.from(common.keys()).map((k) =>
      other.distances.get(k)
    );

    const myBeacons: Set<string> = new Set();
    const otherBeacons: Set<string> = new Set();

    myVals.forEach((pair) => {
      if (!pair) return;

      myBeacons.add(pair[0].join(","));
      myBeacons.add(pair[1].join(","));
    });

    otherVals.forEach((pair) => {
      if (!pair) return;

      otherBeacons.add(pair[0].join(","));
      otherBeacons.add(pair[1].join(","));
    });

    const myPoints = Array.from(myBeacons.keys()).map((s) =>
      s.split(",").map(Number)
    );
    const otherPoints = Array.from(otherBeacons.keys()).map((s) =>
      s.split(",").map(Number)
    );

    const counts = new Map();

    myPoints.forEach((point, idx) => {
      for (const rot of rots) {
        const other = rot(point as Triple);
        const toCompare = otherPoints[idx];
        // console.log(`considering: `, other, toCompare);
        const sums = [
          toCompare[0] - other[0],
          toCompare[1] - other[1],
          toCompare[2] - other[2],
        ];

        const k = sums.join(",");
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    });

    counts.forEach((v, k) => {
      if (v < 2) return;

      // console.log(`${sa.num}, nums = ${v}`);
      const toAdd = k.split(",").map(Number);
      // console.log(k, v);
      // sa.transformSource = sb.num;
      this.transform = function (coord: Triple): Triple {
        const t = rot(coord);
        const ret = [t[0] + toAdd[0], t[1] + toAdd[1], t[2] + toAdd[2]];
        // console.log(coord, t, ret);
        return ret as Triple;
      };
    });
  }
}

const PriorityQueue = class {
  #distances: Map<number, number>;
  #data: number[] = [];

  constructor(distances: Map<number, number>) {
    this.#distances = distances;
    this.#data = Array.from(distances.keys());
    this.resort();
  }

  insert(k: number) {
    const v = this.#distances.get(k);
    if (!v) throw "bogus key";

    this.#data.push(k);
    this.resort();
  }

  resort() {
    this.#data.sort((a, b) => {
      const av = this.#distances.get(a) ?? Infinity;
      const bv = this.#distances.get(b) ?? Infinity;
      return bv - av;
    });
  }

  extractMin(): number | undefined {
    return this.#data.pop();
  }

  debug() {
    console.log(this.#data);
  }
};

const scanners: Scanner[] = [];
let cur = "";
let curLines = [];

for (const line of lines) {
  if (line.match(/scanner/)) {
    if (cur.length) {
      scanners.push(new Scanner(cur, curLines));
    }

    cur = line;
    curLines = [];
    continue;
  }

  curLines.push(line);
}
scanners.push(new Scanner(cur, curLines));

scanners[0].transform = rots[0];
scanners[0].transformSource = 0;

// console.log("scanned!");

const graph = new Map();

// OUTER:
for (let i = 0; i < scanners.length; i++) {
  for (let j = i + 1; j < scanners.length; j++) {
    const sa = scanners[i],
      sb = scanners[j];

    const common = sa.numPointsInCommonWith(sb);

    if (common < 12) continue;
    // console.log(`checking ${i}, ${j}`);

    // console.log(`scanners ${sa.num} and ${sb.num}: ${common.size} in common`);

    // console.log(`to calc: ${sa.num} and ${sb.num}`);
  }
}

// NOW, we create a graph, I guess, because everything needs to get back to 0
// console.log(graph);

// for every key in the graph, find a path to 0
const buildGraph = () => {
  const unvisited = new Set(graph.keys());
  const distances: DefaultMap<number, number> = new DefaultMap(Infinity);
  distances.set(0, 0);

  const prev = new Map();
  prev.set(0, 0);

  const queue = new PriorityQueue(distances);

  while (unvisited.size) {
    const current = queue.extractMin();

    if (typeof current === "undefined") throw "no current node found!";

    unvisited.delete(current);

    graph.get(current)?.forEach((edge: number) => {
      if (!unvisited.has(edge)) return; // already seen

      const tentative = distances.get(current) + 1;
      if (tentative < distances.get(edge)) {
        distances.set(edge, tentative);
        queue.insert(edge);
        scanners[edge].transformSource = current;
        prev.set(edge, current);
      }
    });
  }

  // console.log(prev);
  const paths = new Map();
  graph.forEach((_, key) => {
    // console.log(`looking at ${key}`);
    const p = [];

    // for every key,
    let cur = prev.get(key);
    while (cur !== 0) {
      p.push(cur);
      cur = prev.get(cur);
      // console.log(`  not there yet, now cur is ${cur}`);
    }

    p.push(cur);

    paths.set(key, p);
  });

  // console.log(paths);

  // console.log(distances);
  return paths;
};

const paths = buildGraph();
console.log(paths);

const allBeacons = new Set();

scanners.forEach((scanner) => {
  let coords = scanner.coords;
  let origin: Triple[] = [[0, 0, 0]];

  let cur = scanner.num;

  while (true) {
    if (cur === 0) break;

    console.log(
      `scanner ${scanner.num}: now transforming from ${cur} to ${
        scanners[cur].transformSource
      }`,
    );

    const nextTransform = scanners[cur].transform ?? ((x) => x);
    coords = coords.map(nextTransform);
    origin = origin.map(nextTransform);
    // console.log(`  origint ${origin}`);

    cur = scanners[cur].transformSource ?? 0;
    // console.log(`next src = ${src}`);
  }

  scanner.originRelativeToZero = origin[0];

  coords.forEach((c) => allBeacons.add(c.join(",")));
  // console.log(
  //   `scanner ${scanner.num}: origin = ${scanner.originRelativeToZero}`,
  // );
});

// allBeacons.forEach((k) => console.log(k));
console.log(`part 1: ${allBeacons.size}`);

import { DefaultMap, fileLines } from "../lib/advent-utils.ts";
import { NumberGrid } from "../lib/grid.ts";

const PriorityQueue = class {
  #distances: Map<string, number>;
  #data: string[] = [];

  constructor(distances: Map<string, number>) {
    this.#distances = distances;
    this.#data = Array.from(distances.keys());
    this.resort();
  }

  insert(k: string) {
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

  extractMin(): string | undefined {
    return this.#data.pop();
  }

  debug() {
    console.log(this.#data);
  }
};

const lines = fileLines("input/day15.txt");

const dijkstra = (grid: NumberGrid) => {
  const unvisited = new Set(grid.keys());

  const distances: DefaultMap<string, number> = new DefaultMap(Infinity);
  distances.set("0#0", 0);

  const queue = new PriorityQueue(distances);

  while (unvisited.size) {
    const current = queue.extractMin();

    if (!current) throw "no current node found!";

    grid.neighborKeys(current, false).forEach((edge) => {
      if (!unvisited.has(edge)) return; // already seen

      const tentative = distances.get(current as string) + grid.get(edge);
      if (tentative < distances.get(edge)) {
        distances.set(edge, tentative);
        queue.insert(edge);
      }
    });

    unvisited.delete(current);
  }

  let target = "";
  grid.forEach((_, k) => target = k);
  return distances.get(target);
};

const buildBigGrid = (lines: string[]): NumberGrid => {
  const big: string[] = [];

  // love an n^3 algo
  lines.forEach((raw) => {
    const line = raw.split("").map(Number);
    const full: number[] = [];

    for (let i = 0; i < 5; i++) {
      line.forEach((n) => {
        const thisN = (n + i) % 9;
        full.push(thisN === 0 ? 9 : thisN);
      });
    }

    big.push(full.join(""));
  });

  const source = big.slice();

  // now we've got the first full-width block, we need to do it five times
  // down
  for (let i = 1; i < 5; i++) {
    source.forEach((raw) => {
      const line = raw.split("").map(Number); // TODO don't unmap/rempap these
      const full: number[] = [];
      line.forEach((n) => {
        const thisN = (n + i) % 9;
        full.push(thisN === 0 ? 9 : thisN);
      });

      big.push(full.join(""));
    });
  }

  return new NumberGrid(big);
  // console.log(big.join("\n"));
};

const lil = new NumberGrid(lines);
console.log(dijkstra(lil));

const big = buildBigGrid(lines);
console.log(dijkstra(big));

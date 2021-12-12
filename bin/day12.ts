import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day12.txt");

const _lines = [
  "fs-end",
  "he-DX",
  "fs-he",
  "start-DX",
  "pj-DX",
  "end-zg",
  "zg-sl",
  "zg-pj",
  "pj-he",
  "RW-he",
  "fs-DX",
  "pj-RW",
  "zg-RW",
  "start-pj",
  "he-WI",
  "zg-he",
  "pj-fs",
  "start-RW",
];

const graph: Map<string, Set<string>> = new Map();
for (const line of lines) {
  const [a, b] = line.split("-");

  if (!graph.has(a)) graph.set(a, new Set());
  if (!graph.has(b)) graph.set(b, new Set());

  graph.get(a)?.add(b);
  graph.get(b)?.add(a);
}

graph.delete("end"); // no paths from end backwards

const edgeIsLegal = (path: string[], edge: string, part2 = false): boolean => {
  if (edge === "start") return false;
  if (path.includes("end")) return false;
  if (edge.match(/^[A-Z]+$/)) return true; // always legal
  if (!path.includes(edge)) return true; // always legal
  if (!part2) return false; // we've seen it before, no good

  // We're considering a lowercase edge we've already seen before; it's only
  // legal if we've not already been to a lowercase room more than once this
  // path
  const counts = new Map();
  path.filter((e) => e.match(/^[a-z]{1,2}$/)).forEach((e) =>
    counts.set(e, (counts.get(e) ?? 0) + 1)
  );

  return !Array.from(counts.values()).some((count) => count > 1);
};

// modified bfs
const search = (part2: boolean): number => {
  const queue: string[][] = [["start"]];
  let paths = 0;

  while (queue.length) {
    const path = queue.shift() ?? [];
    const last = path[path.length - 1];

    if (last == "end") paths++;

    const edges = graph.get(last) ?? new Set();
    for (const edge of edges.values()) {
      if (edgeIsLegal(path, edge, part2)) {
        queue.push(path.slice().concat(edge));
      }
    }
  }

  return paths;
};

console.log("btw, this is pretty slow...");
console.log(search(false));
console.log(search(true));

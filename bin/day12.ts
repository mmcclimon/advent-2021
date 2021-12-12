import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day12.txt");

const graph: Map<string, Set<string>> = new Map();
for (const line of lines) {
  const [a, b] = line.split("-");

  if (!graph.has(a)) graph.set(a, new Set());
  if (!graph.has(b)) graph.set(b, new Set());

  graph.get(a)?.add(b);
  graph.get(b)?.add(a);
}

graph.forEach((v) => v.delete("start")); // no backtracking
graph.delete("end"); // no paths from end backwards

const edgeIsLegal = (path: string[], edge: string, part2 = false): boolean => {
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

const dfs = (path: string[], part2: boolean, cb: (p?: string[]) => void) => {
  const node = path[path.length - 1];

  if (node === "end") cb(path);

  graph.get(node)?.forEach((edge) => {
    if (edgeIsLegal(path, edge, part2)) {
      dfs(path.slice().concat(edge), part2, cb);
    }
  });
};

const doPart = (n: number): number => {
  let total = 0;
  dfs(["start"], n === 2, () => total++);
  return total;
};

console.log(doPart(1));
console.log(doPart(2));

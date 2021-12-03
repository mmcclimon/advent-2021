export function fileLines(filename: string): string[] {
  const data = Deno.readFileSync(filename);
  const text = new TextDecoder().decode(data);
  return text.split("\n").filter((s) => s.length > 0);
}

export function fileLinesInt(filename: string): number[] {
  return fileLines(filename).map((n) => parseInt(n));
}

// python's range(); it is bananas that JS does not have this by default
export function* range(x: number, y?: number, z?: number) {
  const start = typeof y !== "undefined" ? x : 0;
  const end = typeof y !== "undefined" ? y : x;
  const step = z || 1;
  const shouldRun = step > 0 ? (i: number) => i < end : (i: number) => i > end;

  for (let i = start; shouldRun(i); i += step) {
    yield i;
  }
}

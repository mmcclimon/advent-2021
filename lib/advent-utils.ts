export function fileLines(filename: string, keepBlanks = false): string[] {
  const data = Deno.readFileSync(filename);
  const text = new TextDecoder().decode(data);
  const lines = text.split("\n");
  return keepBlanks ? lines : lines.filter((s) => s.length > 0);
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

export class DefaultMap<K, V> extends Map<K, V> {
  #defaultVal: V;

  constructor(defaultVal: V) {
    super();
    this.#defaultVal = defaultVal;
  }

  get(k: K): V {
    let have = super.get(k);

    if (typeof have === "undefined") {
      this.set(k, this.#defaultVal);
      have = this.#defaultVal;
    }

    return have;
  }
}

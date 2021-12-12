import { DefaultMap } from "./advent-utils.ts";

export class NumberGrid extends DefaultMap<string, number> {
  constructor(lines: string[], sep = "") {
    super(0);

    lines.forEach((line, row) => {
      line.split(sep).forEach((c, col) => {
        this.set(`${row}#${col}`, Number(c));
      });
    });
  }

  neighborKeys(key: string, wantDiags = true): string[] {
    const [row, col] = key.split("#").map(Number);

    const neighbors: string[] = [];

    [-1, 0, 1].forEach((dr) => {
      [-1, 0, 1].forEach((dc) => {
        if (dr === 0 && dc === 0) return;

        const coord = `${row + dr}#${col + dc}`;

        if (Math.abs(dr) == 1 && Math.abs(dc) === 1) {
          // this is a diagonal
          if (wantDiags) neighbors.push(coord);
        } else {
          neighbors.push(coord);
        }
      });
    });

    return neighbors.filter((k) => this.has(k));
  }

  neighborValues(key: string, wantDiags = true): number[] {
    return this.neighborKeys(key, wantDiags).map((k) => this.get(k));
  }

  inc(k: string): number {
    this.set(k, this.get(k) + 1);
    return this.get(k);
  }
}

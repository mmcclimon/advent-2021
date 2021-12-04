import { fileLines } from "../lib/advent-utils.ts";

class Board {
  hits: Set<string>;
  #board: Map<number, string>;
  #rows = [0, 0, 0, 0, 0];
  #cols = [0, 0, 0, 0, 0];
  #diags = [0, 0];
  #round = 0;
  #lastNumber = 0;
  #isComplete = false;

  constructor(lines: string[]) {
    this.hits = new Set();
    this.#board = new Map();
    lines.forEach((line, rowNum) => {
      const nums = line.split(/\s+/)
        .filter((n) => n.length > 0)
        .map((n) => parseInt(n));

      nums.forEach((n, colNum) => {
        const k = `${rowNum},${colNum}`;
        this.#board.set(n, k);
      });
    });
  }

  // returns whether it's done or not
  registerHit(n: number): boolean {
    if (this.#isComplete) return true;

    this.#round++;
    const loc = this.#board.get(n);
    if (!loc) return this.#isComplete;

    this.hits.add(loc);
    this.#lastNumber = n;

    // housekeeping here avoids having to walk the grid later
    const [r, c] = loc.split(",").map((n) => parseInt(n));
    this.#rows[r]++;
    this.#cols[c]++;

    if (r === c) {
      this.#diags[0]++;
    } else if (r + c === 4) {
      this.#diags[1]++;
    }

    return this.isComplete();
  }

  isComplete(): boolean {
    if (this.#isComplete) return true;

    const isFull = (n: number) => n === 5;
    const done = this.#rows.some(isFull) || this.#cols.some(isFull) ||
      this.#diags.some(isFull);

    if (done) this.#isComplete = true;
    return done;
  }

  sumUnmarked(): number {
    return Array.from(this.#board.entries()).filter(([_, loc]) =>
      !this.hits.has(loc)
    ).map(([n, _]) => n).reduce((sum, el) => sum + el, 0);
  }

  // this assumes that the board is actually finished
  finishedAtRound(): number {
    return this.#round;
  }

  score(): number {
    return this.sumUnmarked() * this.#lastNumber;
  }
}

class Game {
  seq: number[];
  boards: Board[] = [];

  constructor(lines: string[]) {
    const first = lines.shift() || "";
    this.seq = first.split(",").map((n) => parseInt(n));

    let thisBoard = [];
    // probably there's a better way to do this
    for (const line of lines) {
      if (line === "") {
        if (thisBoard.length === 0) continue;

        this.boards.push(new Board(thisBoard));
        thisBoard = [];
        continue;
      }

      thisBoard.push(line);
    }
  }

  play(wantLast = false): number {
    // we play the game to completion every time, because why not
    for (const num of this.seq) {
      this.boards.forEach((b) => b.registerHit(num));
    }

    this.boards.sort((a, b) => a.finishedAtRound() - b.finishedAtRound());

    const winner = wantLast ? this.boards.pop() : this.boards[0];
    if (!winner) throw "no winner found?";

    return winner.score();
  }
}

const lines = fileLines("input/day4.txt", true);
const game = new Game(lines.slice());
console.log(game.play());

const game2 = new Game(lines.slice());
console.log(game2.play(true));

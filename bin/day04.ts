import { fileLines } from "../lib/advent-utils.ts";

class Board {
  hits: Map<[number, number], number>;
  #board: Map<number, [number, number]>;
  #rows = [0, 0, 0, 0, 0];
  #cols = [0, 0, 0, 0, 0];
  finishedAtRound = Infinity;
  #isComplete = false;

  constructor(lines: string[]) {
    this.hits = new Map();
    this.#board = new Map();

    lines.forEach((line, rowNum) => {
      const nums = line.split(/\s+/)
        .filter((n) => n.length > 0)
        .map((n) => parseInt(n));

      nums.forEach((n, colNum) => {
        const loc: [number, number] = [rowNum, colNum];
        this.#board.set(n, loc);
      });
    });
  }

  // returns whether it's done or not
  registerHit(n: number, round: number): boolean {
    if (this.#isComplete) return true;

    const loc = this.#board.get(n);
    if (!loc) return this.#isComplete;

    this.hits.set(loc, n);

    // housekeeping here avoids having to walk the grid later
    const [r, c] = loc;
    this.#rows[r]++;
    this.#cols[c]++;

    return this.isComplete(round);
  }

  isComplete(round: number): boolean {
    if (this.#isComplete) return true;

    const isFull = (n: number) => n === 5;
    const done = this.#rows.some(isFull) || this.#cols.some(isFull);

    if (done) {
      this.#isComplete = true;
      this.finishedAtRound = round;
    }
    return done;
  }

  score(): number {
    const lastNum = Array.from(this.hits.values()).pop() || 0;
    const unmarkedSum = Array.from(this.#board.entries()).filter(([_, loc]) =>
      !this.hits.has(loc)
    ).map(([n, _]) => n).reduce((sum, el) => sum + el, 0);

    return unmarkedSum * lastNum;
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
    this.seq.forEach((num, round) => {
      this.boards.forEach((b) => b.registerHit(num, round));
    });

    this.boards.sort((a, b) => a.finishedAtRound - b.finishedAtRound);

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

class Amphipod {
  #nextPos: [number, number][];

  constructor(letter, x, y, isSettled = false) {
    this.letter = letter;
    this.x = x;
    this.y = y;
    this.isSettled = isSettled;
    this.#nextPos = null;
  }

  toString(): string {
    return `<Amphipod ${this.letter} @${this.x},${this.y}>`;
  }

  clone(): Amphipod {
    return new Amphipod(this.letter, this.x, this.y, this.isSettled);
  }

  get cost() {
    return 10 ** this.idx;
  }

  get idx() {
    return ['A', 'B', 'C', 'D'].findIndex(el => el === this.letter);
  }

  isInRoom(): boolean {
    return this.y >= 1;
  }

  roomIsCorrect(): boolean {
    return this.isInRoom() && this.idx === this.x;
  }

  get hallwayX(): number {
    return (this.x + 1) * 2;
  }

  get targetX(): number {
    return this.idx;
  }

  moveTo(burrow: Burrow, x: number, y: number) {
    burrow.lines[y][x] = this;
    burrow.lines[this.y][this.x] = '.';
    this.x = x;
    this.y = y;

    if (this.roomIsCorrect()) {
      if (y === 2 || burrow.thingAt(this.x, this.y + 1) instanceof Amphipod) {
        this.isSettled = true;
      }
    }
  }

  canMove(burrow: Burrow): boolean {
    return this.nextPositions(burrow).length > 0;
  }

  nextPositions(burrow: Burrow): [number, number][] {
    // console.log(`    nextPos for ${this}`)
    if (this.isSettled) return [];
    if (this.#nextPos !== null)  return this.#nextPos;
    // console.log(`    checking ${this}`)

    if (this.y === 2 && this.x === this.targetX) {
      this.isSettled = true;
      return [];
    }

    this.#nextPos = [];

    let canMoveIntoHallway = false;
    const hasAvailableHallwayTile = burrow.squareIsEmpty(this.hallwayX - 1, 0)
                                 || burrow.squareIsEmpty(this.hallwayX + 1, 0);

    if (this.y === 1) {
      if (this.roomIsCorrect()) {
        // console.log(`  room is correct`)
        const below = burrow.thingAt(this.x, this.y + 1);

        if (below instanceof Amphipod && below.roomIsCorrect()) {
          // console.log(`  marking ${this} and ${below} as settled`)
          this.isSettled = true;
          below.isSettled = true;
          return this.#nextPos;
        } else {
          // console.log(`  1st row, incorrect below`);
        }
      }

      // we're in the first row, we can move if we can step into the hallway
      // safely
      // console.log(`  1st row, room above`)
      canMoveIntoHallway = true;
      // return hasAvailableHallwayTile;
    }

    if (this.y == 2) {
      if (! burrow.squareIsEmpty(this.x, this.y - 1 || this.roomIsCorrect())) {
        return this.#nextPos;
      }

      canMoveIntoHallway = true;
    }

    if (hasAvailableHallwayTile && canMoveIntoHallway) {
      // console.log(`  gonna move into the hallway`)
      const hallway = burrow.lines[0];

      // left
      for (let i = this.hallwayX; i >= 0; i--) {
        if (hallway[i] instanceof Amphipod) break;

        if (hallway[i] === '.') {
          this.#nextPos.push([i, 0]);
        }
      }

      // right
      for (let i = this.hallwayX; i < hallway.length; i++) {
        if (hallway[i] instanceof Amphipod) break;

        if (hallway[i] === '.') {
          this.#nextPos.push([i, 0]);
        }
      }

      return this.#nextPos;
    }

    // So, we're in the hallway. We can only move if our room is available
    // and there is a direct path to it
    if (burrow.roomIsAvailable(this.letter)) {
      const hallway = burrow.lines[0];
      const inc = this.hallwayX > this.x ? 1 : -1;

      // console.log(`    room is avail, ${this.hallwayX}, ${this.x}, ${inc}`)

      for (let x = this.x + inc; x !== this.hallwayX; x += inc) {
        if (hallway[x] instanceof Amphipod) {
          return this.#nextPos;
        }
      }

      const lower = burrow.thingAt(this.targetX, 2);
      const whichY = lower === '.' ? 2 : 1;
      // console.log(  `adding room spot`);
      this.#nextPos.push([this.targetX, whichY]);
      return this.#nextPos;
    }

    return this.#nextPos;
  }

  costToMoveTo(x: number, y: number): number {
    // let's just convert the weird rows into indexes of the hallway, then
    // we can just use the manhattan distance
    let thisX = this.x;

    if (y == 0) { // moving from a room to a hallway
      thisX = this.hallwayX;
    } else {      // moving from a hallway to a room
      x = (x + 1) * 2;
    }

    return (Math.abs(thisX - x) + Math.abs(this.y - y)) * this.cost;
  }
}

class Burrow {
  constructor(lines) {
    this.lines = lines.map((line, y) => {
      return line.split('').map((c, x) =>
        c === '.' || c === 'x' ? c : new Amphipod(c, x, y)
      );
    });
  }

  toString(): string {
    return this.lines.map(line =>
      line.map(thing => thing instanceof Amphipod ? thing.letter : thing).join('')
    ).join(' ');
  }

  clone(): Burrow {
    const other = new Burrow([]);

    const lines = this.lines.map(line =>
      line.map(thing => thing instanceof Amphipod ? thing.clone() : thing)
    );

    other.lines = lines;
    return other;
  }

  get amphipods(): Amphipod[] {
    return this.lines.flat().filter(el => el instanceof Amphipod);
  }

  thingAt(x, y): "." | "x" | Amphipod {
    return this.lines[y][x];
  }

  squareIsEmpty(x, y) {
    const thing = this.thingAt(x, y);
    return thing === '.' || thing === 'x';
  }

  movablePods(): string[] {
    return this.amphipods.filter(pod => pod.canMove(this));
  }

  roomIsAvailable(letter: string): boolean {
    const idx = ['A', 'B', 'C', 'D'].findIndex(c => c === letter);
    const lower = this.thingAt(idx, 2);
    const upper = this.thingAt(idx, 1);
    return upper === '.' && (lower === '.' || lower.letter === letter);
  }
}

class State {
  energy: number;

  constructor({ energy, burrow /*, trace*/ }) {
    this.energy = energy ?? 0;
    this.burrow = burrow;
    // this.trace = trace ?? [];
  }

  toString(): string {
    return `<State ${this.energy} ${this.burrow}>`;
  }

  clone(): State {
    return new State({
      energy: this.energy,
      burrow: this.burrow.clone(),
      // trace: [ ...this.trace, String(this) ],
    });
  }

  isCorrect(): boolean {
    return this.burrow.amphipods.every(pod => pod.isSettled);
  }

  isUnsolvable(): boolean {
    return false;
  }

  validNextStates(): State[] {
    const states = [];

    for (const pod of this.burrow.movablePods()) {
      const positions = pod.nextPositions(this.burrow);

      for (const [newX, newY] of positions) {
        const newState = this.clone();

        // swap pod and empty
        const newPod = newState.burrow.thingAt(pod.x, pod.y);
        // newState.burrow.lines[newY][newX] = newPod;
        // newState.burrow.lines[pod.y][pod.x] = '.';
        newPod.moveTo(newState.burrow, newX, newY);

        newState.energy += pod.costToMoveTo(newX, newY);
        states.push(newState);
      }
    }

    return states;
  }
}

const state = new State({
  // TEST INPUT
  // burrow: new Burrow(['..x.x.x.x..', 'BCBD', 'ADCA' ]),
  // REAL INPUT
  burrow: new Burrow(['..x.x.x.x..', 'BBDA', 'DCAC' ]),
});

const queue = [ state ];
const seen = new Set();
let best = 1e6;
let bestState = null;

while (queue.length > 0) {
  const state = queue.pop();
  // console.log(`examining ${state}`)

  if (state.energy > best) {
    continue;
  }

  const k = String(state);
  if (seen.has(k)) {
    continue;
  }

  seen.add(k);

  if (state.isCorrect()) {
    best = Math.min(best, state.energy);
    console.log(`found a winner: ${state}`)
    continue;
  }

  for (const nextState of state.validNextStates()) {
    // console.log(`  pushing ${nextState}`)
    queue.push(nextState);
  }
}

console.log(best)

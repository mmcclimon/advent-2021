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

    // I'm just gonna assert that we will always move to the lowest available
    // space in a room.
    if (this.roomIsCorrect()) {
      this.isSettled = true;
    }
  }

  canMove(burrow: Burrow): boolean {
    return this.nextPositions(burrow).length > 0;
  }

  nextPositions(burrow: Burrow): [number, number][] {
    if (this.isSettled) return [];
    if (this.#nextPos !== null)  return this.#nextPos;

    // check if we're settled
    if (this.roomIsCorrect()) {
      let ok = true;

      for (let y = this.y + 1; y <= burrow.depth; y++) {
        ok &&= burrow.thingAt(this.x, y).letter === this.letter;
      }

      if (ok) {
        this.isSettled = true;
        return []
      }
    }

    this.#nextPos = [];

    const hallway = burrow.lines[0];

    if (this.isInRoom()) {
      const hasAvailableHallwayTile = burrow.squareIsEmpty(this.hallwayX - 1, 0)
                                   || burrow.squareIsEmpty(this.hallwayX + 1, 0);

      if (! hasAvailableHallwayTile) {
        return this.#nextPos;
      }

      // we can move into the hallway if every spot above us is free
      let canMoveIntoHallway = true;
      for (let y = this.y - 1; y > 0; y--) {
        canMoveIntoHallway &&= burrow.squareIsEmpty(this.x, y);
      }

      if (! canMoveIntoHallway) {
        return this.#nextPos;
      }

      // left available spaces
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
    if (! burrow.roomIsAvailable(this.letter)) {
      return this.#nextPos;
    }

    const wantX = (this.targetX + 1) * 2;
    const inc = wantX > this.x ? 1 : -1;

    for (let x = this.x + inc; x !== wantX; x += inc) {
      if (hallway[x] instanceof Amphipod) {
        return this.#nextPos;
      }
    }

    // find the bottom-most available y
    let whichY = 1;
    for (let y = 2; y <= burrow.depth; y++) {
      if (! burrow.squareIsEmpty(this.targetX, y)) break;
      whichY = y;
    }

    this.#nextPos.push([this.targetX, whichY]);
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

  get depth(): number {
    return this.lines.length - 1;
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

    // a room is available if it has at least one open space, and everything
    // in it is the correct letter
    for (let y = this.depth; y > 1; y--) {
      const thing = this.thingAt(idx, y);
      if (thing === '.' || thing.letter === letter) {
        continue;
      }

      return false;
    }

    return this.thingAt(idx, 1) === '.';
  }
}

class State {
  energy: number;

  constructor({ energy, burrow, trace }) {
    this.energy = energy ?? 0;
    this.burrow = burrow;
    this.trace = trace ?? [];
  }

  toString(): string {
    return `<State ${this.energy} ${this.burrow}>`;
  }

  clone(): State {
    return new State({
      energy: this.energy,
      burrow: this.burrow.clone(),
      trace: [ ...this.trace, String(this) ],
    });
  }

  isCorrect(): boolean {
    return this.burrow.amphipods.every(pod => pod.isSettled);
  }

  validNextStates(): State[] {
    const states = [];

    for (const pod of this.burrow.movablePods()) {
      const positions = pod.nextPositions(this.burrow);

      for (const [newX, newY] of positions) {
        const newState = this.clone();

        // swap pod and empty
        const newPod = newState.burrow.thingAt(pod.x, pod.y);
        newPod.moveTo(newState.burrow, newX, newY);

        newState.energy += pod.costToMoveTo(newX, newY);
        states.push(newState);
      }
    }

    return states;
  }
}

const runSimulation = (burrow) => {
  const queue = [ new State({ burrow }) ];
  const seen = new Set();
  let best = Infinity;

  while (queue.length > 0) {
    const state = queue.pop();

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
      // console.log(`found a winner: ${state}`)
      continue;
    }

    for (const nextState of state.validNextStates()) {
      queue.push(nextState);
    }
  }

  return best;
}

const part1 = runSimulation(new Burrow(['..x.x.x.x..', 'BBDA', 'DCAC' ]));
console.log(`part 1: ${part1}`)

const part2 = runSimulation(
  new Burrow(['..x.x.x.x..', 'BBDA', 'DCBA', 'DBAC', 'DCAC' ])
);
console.log(`part 2: ${part2}`)

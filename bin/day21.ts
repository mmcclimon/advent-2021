class Player {
  constructor(space: number) {
    this.space = space;
    this.score = 0;
  }

  move(n) {
    this.space = (this.space + n) % 10;
    this.score += this.space == 0 ? 10 : this.space;
  }
}

class TestGame {
  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;
    this.turn = 1;
    this.roll = 1;
    this.numRolls = 1;
  }

  play() {
    while (! this.isOver()) {
      this.takeTurn();
    }

    return this.loser.score * (this.numRolls - 1);
  }


  takeTurn() {
    const player = this.turn % 2 == 1 ? this.p1 : this.p2;

    const roll = [1, 2, 3]
      .map(() => {
        const roll = this.numRolls++ % 100;
        return roll == 0 ? 100 : roll;
      }).reduce((acc, el) => acc + el);
    player.move(roll);
    this.turn++;
  }

  isOver(): boolean {
    return this.p1.score >= 1000 || this.p2.score >= 1000;
  }

  get loser(): Player {
    return this.p1.score > this.p2.score ? this.p2 : this.p1;
  }
}

class DiracGame {
  constructor(p1: Player, p2: Player) {
    this.p1 = p1;
    this.p2 = p2;
  }

  play() {
    const cache = {};

    const rolls = [
      [3, 1],  // 111
      [4, 3],  // 112, 121, 211
      [5, 6],  // 311, 131, 113; 221, 212, 122
      [6, 7],  // 123, 132, 213, 231, 312, 321; 222
      [7, 6],  // 331, 313, 133; 322, 232, 223
      [8, 3],  // 332, 323, 233
      [9, 1],  // 333
    ];

    const compute = function compute (p1Pos, p1Score, p2Pos, p2Score, player) {
      const k = [p1Pos, p1Score, p2Pos, p2Score, player].join(', ');
      if (cache[k]) return cache[k];

      let out;
      if (p1Score >= 21) out = [1, 0];
      if (p2Score >= 21) out = [0, 1];

      if (!out) {
        out = [0, 0];
        for (const [roll, freq] of rolls) {
          const pos1 = player == 0 ? (p1Pos + roll) % 10    : p1Pos;
          const pos2 = player == 1 ? (p2Pos + roll) % 10    : p2Pos;
          const s1   = player == 0 ? p1Score + (pos1 || 10) : p1Score;
          const s2   = player == 1 ? p2Score + (pos2 || 10) : p2Score;

          const results = compute(pos1, s1, pos2, s2, 1 - player);

          out[0] += results[0] * freq;
          out[1] += results[1] * freq;
        }
      }

      cache[k] = out;
      return cache[k];
    }

    const got = compute(this.p1.space, 0, this.p2.space, 0, 0);
    return Math.max(...got);
  }
}

const game = new TestGame(new Player(2), new Player(8));
console.log(`part 1: ${game.play()}`);

const game2 = new DiracGame(new Player(2), new Player(8));
console.log(`part 2: ${game2.play()}`);

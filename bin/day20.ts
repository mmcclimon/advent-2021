import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

class Image {
  bits: string;
  #map: DefaultMap<string, boolean>;
  #min: number;
  #max: number;

  constructor(bitstring, lines) {
    const map = new DefaultMap(false);

    lines.forEach((line, y) => {
      Array.from(line).forEach((c, x) => {
        map.set(`${x},${y}`, c === '#');
      })
    });

    this.bits = bitstring;
    this.#map = map;
    this.#min = 0;
    this.#max = lines.length - 1;
  }

  enhance(round): void {
    this.#min--;
    this.#max++;

    // ugh, stupid wording of this question.
    const outside = this.bits[0] == '.' ? false : round % 2 === 0;
    const map = new DefaultMap(outside);

    const toCheck = [
      [-1, -1], [ 0, -1], [1, -1],
      [-1,  0], [ 0,  0], [1,  0],
      [-1,  1], [ 0,  1], [1,  1],
    ];

    for (let y = this.#min; y <= this.#max; y++) {
      for (let x = this.#min; x <= this.#max; x++) {
        let bstring = '';

        for (const [incX, incY] of toCheck) {
          const k = `${x + incX},${y + incY}`;
          bstring += this.#map.get(k) ? 1 : 0;
        }

        const idx = parseInt(bstring, 2);
        map.set(`${x},${y}`, this.bits[idx] === '#');
      }
    }

    this.#map = map;
  }

  numLitPixels(): number {
    return Array.from(this.#map.values()).filter(x => x).length;
  }
}

const [ bitstring, ...lines] = fileLines("input/day20.txt");

const img = new Image(bitstring, lines);

for (let i = 0; i < 50; i++) {
  img.enhance(i);
  if (i == 1) {
    console.log('part 1: ' + img.numLitPixels());
  }
}

console.log('part 2: ' + img.numLitPixels());

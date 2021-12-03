import { fileLines } from "../lib/advent-utils.ts";

const instructions: string[] = fileLines("input/day2.txt");
console.log(partFactory(1)(instructions));
console.log(partFactory(2)(instructions));

function partFactory(partNumber: number) {
  const generatePart = function (
    submarineType: typeof Submarine,
  ): (lines: string[]) => number {
    return function (lines: string[]): number {
      const sub = new submarineType(lines);
      const [horizontalPosition, verticalPosition] = sub
        .calculateFinalPosition();
      return horizontalPosition * verticalPosition;
    };
  };

  switch (partNumber) {
    case 1:
      return generatePart(Submarine);
    case 2:
      return generatePart(AimingSubmarine);
    default:
      throw `unknown part number ${partNumber}`;
  }
}

enum Direction {
  Forward = "FORWARD",
  Up = "UP",
  Down = "DOWN",
}

class Submarine {
  protected horizontal: number;
  protected vertical: number;
  instructions: string[];

  constructor(instructions: string[]) {
    this.horizontal = 0;
    this.vertical = 0;
    this.instructions = instructions;
  }

  // returns a tuple: horizontal, vertica
  calculateFinalPosition(): [number, number] {
    for (const line of this.instructions) {
      this.#handleInstructionLine(line);
    }

    return [this.horizontal, this.vertical];
  }

  #handleInstructionLine(line: string) {
    const [direction, amount] = this.#parseInstructionLine(line);
    switch (direction) {
      case Direction.Forward:
        this.handleForward(amount);
        break;
      case Direction.Up:
        this.handleUp(amount);
        break;
      case Direction.Down:
        this.handleDown(amount);
        break;
    }
  }

  #parseInstructionLine(line: string): [Direction, number] {
    const [directionString, amountString] = line.split(" ");
    const amount = parseInt(amountString);
    const direction = directionString === "forward"
      ? Direction.Forward
      : directionString === "up"
      ? Direction.Up
      : directionString === "down"
      ? Direction.Down
      : null;

    if (direction === null) {
      throw `unknown direction ${directionString}`;
    }

    return [direction, amount];
  }

  protected handleForward(amount: number): void {
    this.horizontal += amount;
  }

  protected handleUp(amount: number): void {
    this.vertical -= amount;
  }

  protected handleDown(amount: number): void {
    this.vertical += amount;
  }
}

class AimingSubmarine extends Submarine {
  #aim: number;

  constructor(lines: string[]) {
    super(lines);
    this.#aim = 0;
  }

  protected handleForward(amount: number): void {
    this.horizontal += amount;
    this.vertical += this.#aim * amount;
  }

  protected handleUp(amount: number): void {
    this.#aim -= amount;
  }

  protected handleDown(amount: number): void {
    this.#aim += amount;
  }
}

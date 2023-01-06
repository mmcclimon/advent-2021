import { fileLines } from "../lib/advent-utils.ts";

class ALU {
  constructor(instructions: string[]) {
    this.instructions = instructions;
  }

  processModelNumber(n: number) {
    console.log(`process: ${n}`)
    const registers = { w: 0, x: 0, y: 0, z: 0 };

    const input = String(n).split('').map(Number);

    for (const instr of this.instructions) {
      let [cmd, reg, value] = instr.split(' ');

      const regval = registers[reg];
      const resolved = registers[value] ?? Number(value);

      switch (cmd) {
        case 'inp':
          registers[reg] = input.shift();
          break;
        case 'add':
          if (reg === 'z' && value === 'y' && registers.x === 1) {
            console.log(`  push: ${registers.y}`)
          }
          registers[reg] += resolved;
          break;
        case 'mul':
          registers[reg] *= resolved;
          break;
        case 'div':
          if (reg === 'z' && resolved === 26) {
            console.log(`  pop:  ${registers.x}`)
          }
          registers[reg] = Math.floor(regval / resolved);
          break;
        case 'mod':
          registers[reg] %= resolved;
          break;
        case 'eql':
          registers[reg] = regval === resolved ? 1 : 0;
          break;
        default:
          throw new Error(`wat: ${inst}`);
      }
    }

    return registers;
  }
}

// Look, this program does not calculate the answer, but does confirm it. All
// the working out was done by squinting at the input a lot; some notes below.

const lines = fileLines('input/day24.txt').filter(l => l[0] !== ';')
const alu = new ALU(lines);

const part1 = alu.processModelNumber(91897399498995);
if (part1.z !== 0) throw new Error('assertion failed!')
console.log(part1)

const part2 = alu.processModelNumber(51121176121391);
if (part2.z !== 0) throw new Error('assertion failed!')
console.log(part2)


/*
Here is all my working out!

 1  inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w        inp w
 2  mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0      mul x 0
 3  add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z      add x z
 4  mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26     mod x 26
 5  div z 1      div z 1      div z 1      div z 26     div z 1      div z 1      div z 26     div z 1      div z 26     div z 1      div z 26     div z 26     div z 26     div z 26
 6  add x 15     add x 14     add x 11     add x -13    add x 14     add x 15     add x -7     add x 10     add x -12    add x 15     add x -16    add x -9     add x -8     add x -8
 7  eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w      eql x w
 8  eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0      eql x 0
 9  mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0
10  add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25     add y 25
11  mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x
12  add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1      add y 1
13  mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y      mul z y
14  mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0      mul y 0
15  add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w      add y w
16  add y 4      add y 16     add y 14     add y 3      add y 11     add y 13     add y 11     add y 7      add y 12     add y 15     add y 13     add y 1      add y 15     add y 4
17  mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x      mul y x
18  add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y      add z y

so, the subprogram is

w = input
x = z % 26
z /= (1 or 26)  ; push onto a stack, maybe
x += some value
x = (x === w ? 0 : 1)       if divz is 1, x will always be 1, and y will be 25
y = 25 or 0
z *= y
y = w + some value
maybe reset y to 0
z += y


when we div z by 1, we will always push onto the stack
when we div z by 26, we pop the stack

step:   1   2   3   4   5   6   7   8   9  10  11  12  13 14
div z:  1   1   1  26   1   1  26   1  26   1  26  26  26 26
add x:            -13          -7     -12     -16  -9  -8 -8
add y:  4  16  14      11  13       7      15

input 6: push 10 (y = dig + 4) onto stack
input 1: push 17 (y = dig + 16) onto stack
input 9: pop 17 off the stack into x (top of stack is now 10)
         if x == digit + 8, great (so digit must be 9)
input 2: pop 10 off the stack into x (stack is now empty)
         if x == digit + 8, great (so digit must be 2)

step 1: push digit + 4
step 2: push digit + 16
step 3: push digit + 14
step 4: pop, subtract 13
step 5: push digit + 11
step 6: push digit + 13
step 7: pop, subtract 7
step 8: push digit + 7
step 9: pop, subtract 12
step 10: push, digit + 15
step 11: pop, digit - 16
step 12: pop, digit - 9
step 13: pop, digit - 8
step 14: pop, digit - 8

TEMPLATE:
[1]  + 4 == [14] + 8
[2]  +16 == [13] + 8
[3]  +14 == [4]  +13
[5]  +11 == [12] + 9
[6]  +13 == [7]  + 7
[8]  + 7 == [9]  +12
[10] +15 == [11] +16

BIG (part 1)
[1]  9 (+ 4=13) == [14] 5 (+8=13)
[2]  1 (+16=17) == [13] 9 (+8=17)
[3]  8 (+14=22) == [4]  9 (+13=22)
[5]  7 (+11=18) == [12] 9 (+9=18)
[6]  3 (+13=16) == [7]  9 (+7=16)
[8]  9 (+ 7=16) == [9]  4 (+12=16)
[10] 9 (+15=23) == [11] 8 (+16=13)

91897399498995

SMALL (part 2)

[1]  5 (+4=9)   == [14] 1 (+8=9)
[2]  1 (+16=17) == [13] 9 (+8=17)
[3]  1 (+14=15) == [4]  2 (+13=15)
[5]  1 (+11=12) == [12] 3 (+9=12)
[6]  1 (+13=14) == [7]  7 (+7=14)
[8]  6 (+7=13)  == [9]  1 (+12=13)
[10] 2 (+15=17) == [11] 1 (+16=17)

51121176121391

*/

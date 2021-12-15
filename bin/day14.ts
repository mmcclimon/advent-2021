import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day14.txt");
const start = lines.shift() ?? "";

const lookup = new Map(
  lines.map((line) => line.split(" -> ") as [string, string]),
);

const expand = (s: string, numSteps = 1) => {
  const bigrams: DefaultMap<string, number> = new DefaultMap(0);

  // generate the initial list
  for (let i = 0; i < s.length - 1; i++) {
    const pair = s.charAt(i) + s.charAt(i + 1);
    bigrams.set(pair, bigrams.get(pair) + 1);
  }

  for (let i = 0; i < numSteps; i++) {
    Array.from(bigrams.entries()).forEach(([pair, count]) => {
      bigrams.set(pair, bigrams.get(pair) - count);

      const toInsert = lookup.get(pair);
      if (!toInsert) return;

      const [a, b] = pair.split("");
      const aPair = a + toInsert;
      const bPair = toInsert + b;
      bigrams.set(aPair, bigrams.get(aPair) + count);
      bigrams.set(bPair, bigrams.get(bPair) + count);
    });
  }

  return calcAnswer(s, bigrams);
};

const calcAnswer = (start: string, bigrams: Map<string, number>): number => {
  const lastLetter = start.charAt(start.length - 1); // for later
  const counts = new Map([[lastLetter, 1]]);

  bigrams.forEach((count, pair) => {
    const letter = pair.charAt(0);
    counts.set(letter, (counts.get(letter) || 0) + count);
  });

  const max = Math.max(...counts.values());
  const min = Math.min(...counts.values());
  return max - min;
};

console.log(expand(start, 10));
console.log(expand(start, 40));

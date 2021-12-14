import { DefaultMap, fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day14.txt");
const start = "ONHOOSCKBSVHBNKFKSBK";

const lookup = new Map();
lines.forEach((line) => {
  const [a, b] = line.split(" -> ");
  lookup.set(a, b);
});

// keep a map of bigrams => count
// for every bigram:
//   reduce its count by however many we have
//   determine the new bigrams
//   increase them all by however many of the old we had
const expand = (s: string, numSteps = 1) => {
  const bigrams: DefaultMap<string, number> = new DefaultMap(0);
  const lastLetter = s.charAt(s.length - 1); // for later

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

  // generate letter counts
  const counts = new Map([[lastLetter, 1]]);
  bigrams.forEach((count, pair) => {
    const letter = pair.charAt(0);
    counts.set(letter, (counts.get(letter) || 0) + count);
  });

  const most = Math.max(...counts.values());
  const least = Math.min(...counts.values());
  return most - least;
};

console.log(expand(start, 10));
console.log(expand(start, 40));

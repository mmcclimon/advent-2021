import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day18.txt");

abstract class SnailNode {
  protected parent: SnailPair | null;

  constructor() {
    this.parent = null;
  }

  abstract isLeaf(): boolean;
  abstract isPair(): boolean;
  abstract magnitude(): number;
  abstract childLeaves(): SnailLeaf[];

  setParent(pair: SnailPair) {
    this.parent = pair;
  }

  get depth(): number {
    let d = 0;
    let par = this.parent;
    while (par) {
      par = par.parent;
      d++;
    }

    return d;
  }

  get root(): SnailNode {
    if (!this.parent) return this;

    // deno-lint-ignore no-this-alias
    let cur: SnailNode | null = this;
    while (cur) {
      const next: SnailNode | null = cur.parent;
      if (!next) return cur;
      cur = next;
    }

    throw "unreachable";
  }

  replaceSelf(replacement: SnailNode) {
    const parent = this.parent;
    if (!parent) throw ("no parent to replace");

    replacement.parent = parent;

    if (parent.left === this) {
      parent.left = replacement;
    } else if (parent.right === this) {
      parent.right = replacement;
    } else {
      throw new Error(`no child matching ${this}`);
    }
  }
}

class SnailLeaf extends SnailNode {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }

  isLeaf(): boolean {
    return true;
  }

  isPair(): boolean {
    return false;
  }

  magnitude(): number {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }

  childLeaves() {
    return [];
  }

  split() {
    const left = new SnailLeaf(Math.floor(this.value / 2));
    const right = new SnailLeaf(Math.ceil(this.value / 2));

    const repl = new SnailPair(left, right);
    this.replaceSelf(repl);
  }

  add(n: number) {
    this.value += n;
  }
}

class SnailPair extends SnailNode {
  left: SnailNode;
  right: SnailNode;

  constructor(left: SnailNode, right: SnailNode) {
    super();
    this.left = left;
    this.right = right;

    this.left.setParent(this);
    this.right.setParent(this);
  }

  static fromString(s: string): SnailPair {
    // first, split it into parts (the first top-level comma)
    const parseNode = (str: string): SnailNode => {
      if (str.length === 1) return new SnailLeaf(Number(str));
      return SnailPair.fromString(str);
    };

    let depth = 0, mid = 0;

    s.split("").forEach((c, idx) => {
      if (c === "[") depth++;
      if (c === "]") depth--;
      if (c === "," && depth === 1) mid = idx;
    });

    const left = s.substring(1, mid);
    const right = s.substring(mid + 1, s.length - 1);
    return new SnailPair(parseNode(left), parseNode(right));
  }

  isLeaf() {
    return false;
  }

  isPair() {
    return true;
  }

  clone() {
    return SnailPair.fromString(String(this));
  }

  // pop pop
  magnitude(): number {
    return this.left.magnitude() * 3 + this.right.magnitude() * 2;
  }

  isBottomPair(): boolean {
    return this.left.isLeaf() && this.right.isLeaf();
  }

  bottomPairs(): SnailPair[] {
    if (this.isBottomPair()) {
      return [this];
    }

    const left = this.left.isPair()
      ? (this.left as SnailPair).bottomPairs()
      : [];

    const right = this.right.isPair()
      ? (this.right as SnailPair).bottomPairs()
      : [];

    return left.concat(right);
  }

  childLeaves(): SnailLeaf[] {
    const left = this.left.isLeaf()
      ? [this.left as SnailLeaf]
      : this.left.childLeaves();

    const right = this.right.isLeaf()
      ? [this.right as SnailLeaf]
      : this.right.childLeaves();

    return left.concat(right);
  }

  toString(): string {
    return `[${this.left.toString()},${this.right.toString()}]`;
  }

  reduce() {
    if (this.parent) throw "please don't call me on a child";

    while (this.explodeOnce() || this.splitOnce()) {
      // console.log(`  after: ${this}`);
    }
  }

  explodeOnce(): boolean {
    const [leftmost] = this.bottomPairs().filter((node) => node.depth >= 4);
    if (leftmost) {
      // console.log(`will explode: ${leftmost}`);
      leftmost.explode();
      return true;
    }

    return false;
  }

  splitOnce(): boolean {
    const [leftmost] = this.childLeaves().filter((leaf) => leaf.value >= 10);

    if (leftmost) {
      // console.log(`will split: ${leftmost}`);
      leftmost.split();
      return true;
    }

    return false;
  }

  explode() {
    if (this.depth < 4 || !this.isBottomPair()) return;

    const lval = (this.left as SnailLeaf).value;
    const rval = (this.right as SnailLeaf).value;

    const replacement = new SnailLeaf(0);
    this.replaceSelf(replacement);

    // find ourselves in the list of children (left-to-right), move our left
    // value leftward and move our right value rightward
    const allChildren = this.root.childLeaves();
    const meIndex = allChildren.findIndex((el) => el === replacement);
    if (meIndex === -1) throw `couldn't find self?`;

    const toLeft = allChildren[meIndex - 1];
    toLeft?.add(lval ?? 0);

    const toRight = allChildren[meIndex + 1];
    toRight?.add(rval ?? 0);
  }

  add(other: SnailPair): SnailPair {
    const pair = new SnailPair(this.clone(), other.clone());
    pair.reduce();
    return pair;
  }
}

const part1 = (nums: SnailPair[]) =>
  nums.reduce((sum, el) => sum.add(el)).magnitude();

const part2 = (nums: SnailPair[]) => {
  let best = 0;

  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const mag1 = nums[i].add(nums[j]).magnitude();
      const mag2 = nums[j].add(nums[i]).magnitude();

      best = Math.max(best, mag1, mag2);
    }
  }

  return best;
};

const nums = lines.map((line) => SnailPair.fromString(line));

console.log(part1(nums));
console.log(part2(nums));

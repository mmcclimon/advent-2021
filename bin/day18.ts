import { fileLines } from "../lib/advent-utils.ts";

const lines = fileLines("input/day18.txt");

// a node is EITHER a tree or a leaf
type NodeType = "TREE" | "LEAF";

const parse = (s: string, parent?: SnailNode): SnailNode => {
  // first, split it into parts (the first top-level comma)
  let depth = 0, mid = 0;
  for (let i = 1; i < s.length - 1; i++) {
    const c = s[i];
    if (depth === 0 && c === ",") {
      mid = i;
      break;
    }

    if (c === "[") depth++;
    if (c === "]") depth--;
  }

  const lhs = s.substring(1, mid);
  const rhs = s.substring(mid + 1, s.length - 1);

  const node = new SnailNode();
  if (parent) node.parent = parent;

  node.left = parseNode(lhs, node);
  node.right = parseNode(rhs, node);
  return node;
};

const parseNode = (s: string, parent: SnailNode): SnailNode => {
  if (s.length === 1) {
    return SnailNode.Leaf(Number(s), parent);
  }

  return parse(s, parent);
};

class SnailNode {
  value?: number;
  left?: SnailNode;
  right?: SnailNode;
  parent?: SnailNode;

  static Leaf(n: number, parent: SnailNode): SnailNode {
    const node = new SnailNode();
    node.value = n;
    node.parent = parent;
    return node;
  }

  constructor() {}

  clone() {
    return parse(String(this));
  }

  // pop pop
  magnitude(): number {
    if (this.kind === "LEAF") return this.value ?? 0;

    const l = this.left?.magnitude() ?? 0;
    const r = this.right?.magnitude() ?? 0;
    return l * 3 + r * 2;
  }

  get kind(): NodeType {
    if (typeof this.value !== "undefined") {
      return "LEAF";
    }

    return "TREE";
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
    let cur: SnailNode | undefined = this;
    while (cur) {
      const next: SnailNode | undefined = cur.parent;
      if (!next) return cur;
      cur = next;
    }

    throw "unreachable";
  }

  isBottomPair(): boolean {
    return this.left?.kind === "LEAF" && this.right?.kind === "LEAF";
  }

  bottomPairs(): SnailNode[] {
    if (this.kind === "LEAF") return [];

    if (this.isBottomPair()) {
      return [this];
    }

    const left = this.left?.bottomPairs() ?? [];
    const right = this.right?.bottomPairs() ?? [];
    // console.log(left, right);
    return left.concat(right);
  }

  children(): SnailNode[] {
    if (this.kind === "LEAF") return [this];

    const left = this.left?.children() ?? [];
    const right = this.right?.children() ?? [];
    return left.concat(right);
  }

  toString(): string {
    if (this.kind === "LEAF") {
      return String(this.value);
    }

    return `[${this.left?.toString()},${this.right?.toString()}]`;
  }

  needsExplosion(): boolean {
    return this.bottomPairs().some((node) => node.depth >= 4);
  }

  needsSplit(): boolean {
    return this.children().some((node) => (node.value ?? 0) >= 10);
  }

  needsReduction(): boolean {
    return this.needsExplosion() || this.needsSplit();
  }

  reduce() {
    if (this.parent) throw "please don't call me on a child";

    // console.log(`REDUCE: ${this}`);

    while (this.needsReduction()) {
      if (this.needsExplosion()) {
        this.explodeOnce();
        // console.log(`after explode: ${this}`);
        continue;
      }

      if (this.needsSplit()) {
        this.splitOnce();
        // console.log(`after split: ${this}`);
      }
    }
  }

  explodeOnce() {
    const [leftmost] = this.bottomPairs().filter((node) => node.depth >= 4);
    leftmost?.explode();
  }

  splitOnce() {
    const [leftmost] = this.children().filter((node) =>
      (node.value ?? 0) >= 10
    );
    leftmost?.split();
  }

  explode() {
    if (this.depth >= 4 && this.isBottomPair()) {
      const lval = this.left?.value;
      const rval = this.right?.value;

      const replacement = SnailNode.Leaf(0, this.parent as SnailNode);
      this.parent?.replaceMe(this, replacement);

      const allChildren = this.root.children();
      const meIndex = allChildren.findIndex((el) => el === replacement);
      // console.log(`index: ${meIndex}`);

      if (meIndex === -1) throw `couldn't find self?`;

      if (meIndex > 0) {
        // there are numbers to our left, add the left
        allChildren[meIndex - 1].add(lval ?? 0);
      }

      if (meIndex < allChildren.length - 1) {
        // there are numbers to our right, add the right
        allChildren[meIndex + 1].add(rval ?? 0);
      }
    }
  }

  add(n: number) {
    if (this.kind === "TREE") throw "no way";
    if (typeof this.value === "undefined") throw "wtf?";
    this.value += n;
  }

  replaceMe(child: SnailNode, replacement: SnailNode) {
    if (this.left === child) {
      this.left = replacement;
    } else if (this.right === child) {
      this.right = replacement;
    } else {
      throw new Error(`no child matching ${child}`);
    }
  }

  split() {
    if (this.kind === "TREE") throw "no way";
    const val = this.value ?? 0;

    const repl = new SnailNode();
    repl.parent = this.parent;
    repl.left = SnailNode.Leaf(Math.floor(val / 2), repl);
    repl.right = SnailNode.Leaf(Math.ceil(val / 2), repl);

    this.parent?.replaceMe(this, repl);
  }
}

// const num = parse(s);

const add = (a: SnailNode, b: SnailNode): SnailNode => {
  const ret = new SnailNode();

  ret.left = a.clone();
  ret.left.parent = ret;

  ret.right = b.clone();
  ret.right.parent = ret;

  ret.reduce();
  return ret;
};

const nums = lines.map((line) => parse(line));

const part1 = (nums: SnailNode[]) =>
  nums.reduce((sum, el) => add(sum, el)).magnitude();

const part2 = (nums: SnailNode[]) => {
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const mag1 = add(nums[i], nums[j]).magnitude();
      const mag2 = add(nums[j], nums[i]).magnitude();

      best = Math.max(best, mag1, mag2);
    }
  }

  return best;
};

console.log(part1(nums));
console.log(part2(nums));

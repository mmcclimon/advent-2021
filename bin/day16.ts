import { fileLines } from "../lib/advent-utils.ts";

const LENGTH_TYPE = "0";
type PacketType =
  | "LITERAL"
  | "OP_SUM"
  | "OP_PROD"
  | "OP_MIN"
  | "OP_MAX"
  | "OP_GT"
  | "OP_LT"
  | "OP_EQ";

const [s] = fileLines("input/day16.txt");

class Packet {
  version = 0;
  raw = "";
  lengthType?: number;
  children: Packet[] = [];
  kind?: PacketType;

  get length(): number {
    return this.raw.length;
  }

  set typeId(n: number) {
    switch (n) {
      case 0:
        this.kind = "OP_SUM";
        break;
      case 1:
        this.kind = "OP_PROD";
        break;
      case 2:
        this.kind = "OP_MIN";
        break;
      case 3:
        this.kind = "OP_MAX";
        break;
      case 4:
        this.kind = "LITERAL";
        break;
      case 5:
        this.kind = "OP_GT";
        break;
      case 6:
        this.kind = "OP_LT";
        break;
      case 7:
        this.kind = "OP_EQ";
        break;
      default:
        throw `unknown type ${n}`;
    }
  }

  versionSum(): number {
    let sum = 0;
    if (this.children.length) {
      for (const child of this.children) {
        sum += child.versionSum();
      }
    }

    return sum + this.version;
  }

  get literalValue(): number {
    if (this.kind !== "LITERAL") throw "nonsensical literalValue() call";

    let s = this.raw.substr(6);
    let val = "";
    while (s.length) {
      const hunk = s.substring(0, 5);
      val += hunk.substring(1);
      s = s.substring(5);
    }
    return parseInt(val, 2);
  }

  value(): number {
    const vals = this.children.map((p) => p.value());
    switch (this.kind) {
      case "OP_SUM":
        return vals.reduce((sum, el) => sum + el);
      case "OP_PROD":
        return vals.reduce((prod, el) => prod * el);
      case "OP_MIN":
        return vals.reduce((min, el) => Math.min(min, el));
      case "OP_MAX":
        return vals.reduce((max, el) => Math.max(max, el));
      case "LITERAL":
        return this.literalValue;
      case "OP_GT":
        return vals[0] > vals[1] ? 1 : 0;
      case "OP_LT":
        return vals[0] < vals[1] ? 1 : 0;
      case "OP_EQ":
        return vals[0] === vals[1] ? 1 : 0;
    }

    throw `unreachable`;
  }
}

const hexToBin = (s: string): string =>
  s.split("").map((c) => parseInt(c, 16).toString(2).padStart(4, "0")).join("");

const binToDec = (s: string): number => parseInt(s, 2);

const parseSinglePacket = (s: string): Packet => {
  const packet = new Packet();

  const snip = (amt: number) => {
    const hunk = s.substring(0, amt);
    packet.raw += hunk;
    s = s.substring(amt);
    return hunk;
  };

  // parse the header
  packet.version = binToDec(snip(3));
  packet.typeId = binToDec(snip(3));

  if (packet.kind === "LITERAL") {
    // console.log("LITERAL");
    // for literal values, we'll defer the parsing until later
    while (true) {
      const hunk = snip(5);
      if (hunk.charAt(0) === "0") break;
    }

    return packet;
  }

  // console.log("OPERATOR");
  const lengthTypeId = snip(1);
  packet.lengthType = Number(lengthTypeId);

  if (lengthTypeId === LENGTH_TYPE) {
    // length-type operator, parse a set length
    const lenToParse = binToDec(snip(15));
    let sub = snip(lenToParse);

    while (sub.length > 0) {
      const p = parseSinglePacket(sub);
      packet.children.push(p);
      sub = sub.substring(p.length);
    }

    return packet;
  }

  // subpacket-type operator
  const numSubPackets = binToDec(snip(11));

  for (let i = 0; i < numSubPackets; i++) {
    const p = parseSinglePacket(s);
    packet.children.push(p);
    snip(p.length);
  }

  return packet;
};

const bin = hexToBin(s);
const packet = parseSinglePacket(bin);

// console.log(Deno.inspect(packet, { depth: 50 }));
console.log(`part1: ${packet.versionSum()}`);
console.log(`part2: ${packet.value()}`);

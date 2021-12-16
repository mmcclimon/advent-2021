import { fileLines } from "../lib/advent-utils.ts";

// const s = "A0016C880162017C3686B18A3D4780";

const [s] = fileLines("input/day16.txt");
// const s = "9C0141080250320F1802104A08";

const FIFTEEN_BIT_TYPE = "0";
// const ELEVEN_BIT_TYPE = "1";

const types = {
  LITERAL: 4,
};

class Packet {
  version = 0;
  typeId = 0;
  val = 0;
  length = 0;
  lengthType = "-1";
  children: Packet[] = [];

  constructor(args: { version: number; typeId: number }) {
    this.version = args.version;
    this.typeId = args.typeId;
  }

  get kind(): number {
    return this.typeId;
  }

  setValue(n: number) {
    this.val = n;
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

  value(): number {
    switch (this.typeId) {
      case 0:
        return this.children.map((p) => p.value()).reduce(
          (sum, el) => sum + el,
          0,
        );
      case 1:
        return this.children.map((p) => p.value()).reduce(
          (prod, el) => prod * el,
          1,
        );
      case 2:
        return this.children.map((p) => p.value()).reduce(
          (min, el) => Math.min(min, el),
          Infinity,
        );
      case 3:
        return this.children.map((p) => p.value()).reduce(
          (max, el) => Math.max(max, el),
          -Infinity,
        );
      case 4:
        return this.val;
      case 5:
        return this.children[0].value() > this.children[1].value() ? 1 : 0;
      case 6:
        return this.children[0].value() < this.children[1].value() ? 1 : 0;
      case 7:
        return this.children[0].value() === this.children[1].value() ? 1 : 0;
    }

    throw `unreachable`;
  }
}

const hexToBin = (s: string): string =>
  s.split("").map((c) => parseInt(c, 16).toString(2).padStart(4, "0")).join("");

const parseHeader = (s: string): [number, number] => {
  const vstring = s.substring(0, 3);
  const tstring = s.substring(3, 6);
  return [vstring, tstring].map((bin) => parseInt(bin, 2)) as [number, number];
};

const parseSinglePacket = (s: string, parent?: Packet): Packet | undefined => {
  if (s.length < 6) {
    console.log(`too short string! ${s}`);
    return;
  }

  // console.log(`START: ${s}`);
  let ptr = 0;

  const [version, typeId] = parseHeader(s);

  const snip = (amt: number) => {
    s = s.substring(amt);
    ptr += amt;
  };

  const packet = new Packet({
    version: version,
    typeId: typeId,
  });

  // slice off header
  snip(6);

  if (packet.kind === types.LITERAL) {
    // console.log("LITERAL");
    let val = "";
    while (true) {
      const hunk = s.substring(0, 5);
      val += hunk.substring(1);
      // console.log(hunk);
      snip(5);

      if (hunk.charAt(0) === "0") {
        // console.log("quitting!");
        break;
      }
    }
    // console.log(`  binary literal value: ${val}`);

    packet.setValue(parseInt(val, 2));
  } else {
    // console.log("OPERATOR");
    const lengthTypeId = s.substring(0, 1);
    snip(1);

    packet.lengthType = lengthTypeId;

    if (lengthTypeId === FIFTEEN_BIT_TYPE) {
      // console.log("LTYPE LEN");
      const toParse = s.substring(0, 15);
      const lenToParse = parseInt(toParse, 2);
      snip(15);

      // console.log(`to parse: ${lenToParse} (${toParse})`);
      let subS = s.substring(0, lenToParse);

      while (true) {
        const p = parseSinglePacket(subS, packet);
        if (!p) break;
        packet.children.push(p);

        // console.log(`got child: ${Deno.inspect(p)}`);

        subS = subS.substring(p.length);
        if (subS.length <= 0) break;
      }

      snip(lenToParse);
    } else {
      // console.log("LTYPE SUB");
      const numSubPackets = parseInt(s.substring(0, 11), 2);
      snip(11);
      // console.log(`subpackets: ${numSubPackets}`);

      for (let i = 0; i < numSubPackets; i++) {
        const p = parseSinglePacket(s, packet);
        if (!p) throw `malformed packet string B: ${s}`;

        packet.children.push(p);

        // console.log(`child: ${Deno.inspect(p)}`);

        snip(p.length);
      }
    }
  }

  // console.log(`  RETURNING ${Deno.inspect(packet)}`);

  packet.length = ptr;

  return packet;
};

const bin = hexToBin(s);
const packet = parseSinglePacket(bin);

// console.log(Deno.inspect(packet, { depth: 50 }));
console.log(`sum: ${packet?.versionSum()}`);
console.log(`value: ${packet?.value()}`);

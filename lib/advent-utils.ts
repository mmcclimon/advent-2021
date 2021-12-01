export function fileLines(filename: string): string[] {
  const data = Deno.readFileSync(filename);
  const text = new TextDecoder().decode(data);
  return text.split("\n").filter((s) => s.length > 0);
}

export function fileLinesInt(filename: string): number[] {
  return fileLines(filename).map((n) => parseInt(n));
}

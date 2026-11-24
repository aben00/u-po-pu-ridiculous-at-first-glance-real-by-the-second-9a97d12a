// Ridiculous at First Glance, Real by the Second
// Writes the one-sentence startup pitch to /output/entry.txt and
// self-checks the competition gate: UTF-8 text, 1-200 characters,
// exactly one sentence, not only whitespace. Then reads the file
// back and verifies it byte-for-byte.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "We rent trained crows to golf courses that pay per ball retrieved, because a crow fetching Titleists from the rough is cheaper than a teenager with a rake and never asks for a tip.";

function isOneSentence(text: string): boolean {
  const trimmed = text.trim();
  // Exactly one sentence: a single terminal mark at the very end,
  // and no other sentence-ending punctuation anywhere inside.
  const terminators = trimmed.match(/[.!?]/g) ?? [];
  return terminators.length === 1 && /[.!?]$/.test(trimmed);
}

function checkGate(text: string): string[] {
  const problems: string[] = [];
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    problems.push(`length ${chars} chars (must be 1-200)`);
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (!isOneSentence(text)) {
    problems.push("entry is not exactly one sentence");
  }
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    problems.push("entry is not valid UTF-8 round-trip text");
  }
  return problems;
}

const outDir = "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");

const problems = checkGate(ENTRY);
if (problems.length > 0) {
  console.error(`GATE FAILED: ${problems.join("; ")}`);
  process.exit(1);
}

writeFileSync(outPath, ENTRY, "utf8");

const readBack = readFileSync(outPath, "utf8");
if (readBack !== ENTRY) {
  console.error("VERIFY FAILED: file contents differ from the entry");
  process.exit(1);
}
if (Buffer.from(readBack, "utf8").length !== Buffer.from(ENTRY, "utf8").length) {
  console.error("VERIFY FAILED: byte length mismatch");
  process.exit(1);
}

console.log(`OK: wrote ${outPath} (${[...ENTRY].length} chars, 1 sentence)`);
console.log(ENTRY);

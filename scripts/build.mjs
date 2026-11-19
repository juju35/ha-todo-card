// Bundles src/todo-card.js (the cards) and src/todo-panel.js (the optional sidebar panel) into the single file
// dist/todo-card.js (every picture is inline SVG: no asset).
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

// The sources are classic scripts sharing one scope: the panel reads the cards' helpers and extends their class.
export const SOURCES = ["src/todo-card.js", "src/todo-panel.js"];
export const bundle = () => SOURCES.map((f) => readFileSync(`${root}${f}`, "utf8")).join("\n");

const out = bundle().replace("__VERSION__", pkg.version);

// Translations: English stays in the bundle, each other language goes to dist/todo-card.i18n.<lang>.js,
// fetched when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  mkdirSync(`${root}dist`, { recursive: true });
  writeFileSync(`${root}dist/todo-card.js`, out);
  console.log(`Built dist/todo-card.js (${(out.length / 1024).toFixed(1)} KB)`);
  splitDist(`${root}dist`, "todo-card.js", { version: pkg.version });
}

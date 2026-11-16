// Bundles src/todo-card.js into the single file dist/todo-card.js (every picture is inline SVG: no asset).
// Usage: node scripts/build.mjs  (dist/ is not committed: CI and the release workflow build it)
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { splitDist } from "./i18n-split.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(readFileSync(`${root}package.json`, "utf8"));

const out = readFileSync(`${root}src/todo-card.js`, "utf8").replace("__VERSION__", pkg.version);

const target = `${root}dist/todo-card.js`;
mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(target, out);
console.log(`Built dist/todo-card.js (${(out.length / 1024).toFixed(1)} KB)`);

// Translations: English stays in the bundle, each other language goes to dist/todo-card.i18n.<lang>.js,
// fetched when a card needs it (scripts/i18n-split.mjs).
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) splitDist(`${root}dist`, "todo-card.js", { version: pkg.version });

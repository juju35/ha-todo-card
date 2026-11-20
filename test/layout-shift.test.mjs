// State updates patch the cards in place: an update of an entity the card does not use changes nothing in its shadow
// DOM, a change of the list keeps every node (no innerHTML rebuild, so nothing shows anew for a
// frame and the Sections view does not reflow, the page jumping by itself), and the card's height does not move.
// Needs the built card and Playwright's Chromium (CHROMIUM_PATH=… to use another); skipped without them.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";

const dist = new URL("../dist/todo-card.js", import.meta.url);
let browser;
let why;
try {
  if (!existsSync(dist)) throw new Error("dist/todo-card.js not built");
  const { chromium } = await import("playwright");
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
} catch (err) {
  why = err.message.split("\n")[0];
}
const skip = browser ? false : `no browser: ${why}`;
test.after(() => browser?.close());

const STAND_INS = `
customElements.define("ha-card", class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block}</style><slot></slot>"; }
});
customElements.define("ha-icon", class extends HTMLElement {
  connectedCallback() {
    this.shadowRoot || this.attachShadow({ mode: "open" }).append(Object.assign(document.createElement("style"), { textContent: ":host{display:inline-flex;width:24px;height:24px}" }));
  }
});`;

const run = (page, next, n = 6) =>
  page.evaluate(
    async ({ next, n }) => {
      const make = new Function("hass", "i", next);
      const cards = [...document.querySelectorAll("#root > *")];
      const raf = () => new Promise((r) => requestAnimationFrame(() => r()));
      const stats = cards.map(() => ({ removed: 0, mutations: 0, heights: new Set() }));
      const observers = cards.map((el, i) => {
        const o = new MutationObserver((recs) => {
          for (const r of recs) {
            stats[i].mutations++;
            if (r.type === "childList") stats[i].removed += r.removedNodes.length;
          }
        });
        o.observe(el.shadowRoot, { childList: true, subtree: true, attributes: true, characterData: true });
        return o;
      });
      let on = true;
      (async () => {
        while (on) {
          cards.forEach((el, i) => {
            stats[i].heights.add(Math.round(el.getBoundingClientRect().height));
          });
          await raf();
        }
      })();
      for (let k = 0; k < n; k++) {
        for (const el of cards) el.hass = make(el._hass, k);
        await raf();
        await raf();
      }
      on = false;
      for (const o of observers) o.disconnect();
      return stats.map((s, i) => ({ tag: cards[i].localName, removed: s.removed, mutations: s.mutations, heights: [...s.heights] }));
    },
    { next, n },
  );

test("state updates: nothing moves for another entity, a change of the list patches the card in place", { skip }, async () => {
  const page = await browser.newPage({ viewport: { width: 500, height: 1600 }, timezoneId: "UTC", locale: "en-US" });
  await page.clock.setFixedTime(new Date(NOW));
  await page.setContent('<!doctype html><body style="margin:0;width:400px"><div id="root" style="display:grid;gap:12px"></div></body>');
  await page.addScriptTag({ content: STAND_INS });
  await page.addScriptTag({ content: readFileSync(dist, "utf8") });
  await page.evaluate(
    ({ data }) => {
      const answer = (map, key) => structuredClone(map?.[key]);
      window.__subs = [];
      for (const type of ["todo-mini-card", "todo-card"]) {
        const el = document.createElement(type);
        el.setConfig({ type: `custom:${type}`, entity: "todo.courses" });
        el.hass = {
          states: data.states, entities: data.entities, devices: data.devices, areas: data.areas, language: "en", locale: { language: "en" },
          themes: { darkMode: false }, callService: async () => {},
          callApi: async (_m, path) => answer(data.api, path.split("?")[0].split("/")[0]),
          callWS: async (msg) => answer(data.ws, `${msg.type}|${msg.entity_id}`) ?? answer(data.ws, msg.type),
          connection: {
            subscribeMessage: async (cb, msg) => {
              const ev = answer(data.subs, `${msg.type}|${msg.entity_id}`) ?? answer(data.subs, msg.type);
              window.__subs.push({ cb, msg, ev });
              if (ev !== undefined) cb(ev);
              return () => {};
            },
          },
        };
        document.getElementById("root").appendChild(el);
      }
    },
    { data: mockData() },
  );
  await page.waitForTimeout(400);
  const other = `return { ...hass, states: { ...hass.states, "sensor.elsewhere": { entity_id: "sensor.elsewhere", state: String(i), attributes: {} } } };`;
  for (const c of await run(page, other)) {
    assert.equal(c.mutations, 0, `${c.tag}: an update of another entity changes nothing`);
    assert.equal(c.heights.length, 1, `${c.tag}: its height holds`);
  }
  // The list changes (an item renamed, pushed by the subscription) and its entity is written again.
  const own = `for (const s of window.__subs) if (s.ev?.items && s.msg.entity_id === "todo.courses") {
      const ev = structuredClone(s.ev); ev.items[0].summary = i % 2 ? "Milk" : "Oat milk"; s.cb(ev);
    }
    const c = hass.states["todo.courses"];
    return { ...hass, states: { ...hass.states, "todo.courses": { ...c, last_updated: String(i) } } };`;
  for (const c of await run(page, own)) {
    assert.equal(c.removed, 0, `${c.tag}: no node is replaced`);
    assert.equal(c.heights.length, 1, `${c.tag}: its height holds (${c.heights})`);
  }
  const first = await page.evaluate(() => document.querySelector("todo-card").shadowRoot.textContent);
  assert.match(first, /Oat milk|Milk/);
  await page.close();
});

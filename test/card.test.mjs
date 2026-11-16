import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const td = load({ names: ["resolve", "dueOf", "sortItems", "STRINGS", "LANGUAGES"] });
const TodoCard = td.element("todo-card");
const TodoMiniCard = td.element("todo-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en" } = {}) => {
  const d = mockData(variant);
  const calls = [];
  const subs = [];
  return {
    calls,
    subs,
    ...d,
    language,
    locale: { language },
    callService: (...a) => calls.push(a),
    connection: {
      subscribeMessage: async (cb, msg) => {
        subs.push({ cb, msg });
        calls.push(["subscribe", msg.entity_id]);
        const ev = d.subs[`${msg.type}|${msg.entity_id}`];
        if (ev) cb(structuredClone(ev));
        return () => calls.push(["unsubscribe", msg.entity_id]);
      },
    },
  };
};

const mount = async (config = {}, variant = "default", Card = TodoCard, opts = {}) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(variant, opts);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  // Intl puts narrow no-break spaces in times ("7:00 PM"): plain spaces for the assertions.
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[   ]/g, " ") };
};

const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("every to-do list is found, sorted by name", () => {
  same(
    td.resolve(makeHass(), {}).lists.map((l) => [l.entity, l.name, l.platform]),
    [
      ["todo.maison", "Home", "local_todo"],
      ["todo.projets", "Projects", "todoist"],
      ["todo.courses", "Shopping", "bring"],
    ],
  );
});

test("due dates: overdue, today, later; dates and times", () => {
  assert.equal(td.dueOf({ due: "2026-11-15" }, NOW).cls, "crit");
  assert.equal(td.dueOf({ due: "2026-11-16" }, NOW).cls, "warn");
  assert.equal(td.dueOf({ due: "2026-11-16T19:00:00+00:00" }, NOW).cls, "warn");
  assert.equal(td.dueOf({ due: "2026-11-16T08:00:00+00:00" }, NOW).cls, "crit");
  assert.equal(td.dueOf({ due: "2026-11-20" }, NOW).cls, "idle");
  assert.equal(td.dueOf({ due: null }), null);
  same(
    td.sortItems([{ summary: "b", due: "2026-11-20" }, { summary: "a" }, { summary: "c", due: "2026-11-17" }], "due").map((i) => i.summary),
    ["c", "b", "a"],
  );
});

test("the items of the list shown come from the to-do subscription; another tab subscribes to its list", async () => {
  const { card, hass, html } = await mount();
  same(hass.calls, [["subscribe", "todo.maison"]]);
  assert.match(html(), /Change the ventilation filter/);
  assert.match(html(), /chip crit[^>]*>.*1 overdue/s);
  assert.match(html(), /Yesterday/);
  assert.match(html(), /Today 7:00 PM/);
  click(card, { action: "tab", list: "todo.courses" });
  await new Promise((r) => setTimeout(r, 0));
  // The previous list's subscription is closed (its unsubscribe function resolves later).
  same(
    hass.calls.slice(1).sort(),
    [
      ["subscribe", "todo.courses"],
      ["unsubscribe", "todo.maison"],
    ],
  );
  assert.match(html(), /Tomatoes/);
  assert.match(html(), /1 kg/);
  assert.match(html(), /chip accent[^>]*>.*7 to do/s);
});

test("tick an item off: the service is called and the item shows its tick before it moves", async () => {
  const { card, hass, html } = await mount({ entity: "todo.courses" });
  click(card, { action: "toggle", uid: "c2" });
  same(hass.calls.at(-1), ["todo", "update_item", { entity_id: "todo.courses", item: "c2", status: "completed" }]);
  assert.match(html(), /class="item done ticking"/);
  click(card, { action: "toggle", uid: "c8" });
  same(hass.calls.at(-1), ["todo", "update_item", { entity_id: "todo.courses", item: "c8", status: "needs_action" }]);
});

test("add an item from the field (Enter or the button); the field is emptied", async () => {
  const { card, hass } = await mount({ entity: "todo.courses" });
  card._inputs.new = "  Olive oil ";
  click(card, { action: "add" });
  same(hass.calls.at(-1), ["todo", "add_item", { entity_id: "todo.courses", item: "Olive oil" }]);
  assert.equal(card._inputs.new, "");
  click(card, { action: "add" });
  assert.equal(hass.calls.filter((c) => c[1] === "add_item").length, 1);
});

test("edit an item: rename and details, or delete it; clear the completed items", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "edit", uid: "m3" });
  assert.match(html(), /Edit Book the boiler service/);
  card._inputs.edit_name = "Book the boiler check";
  card._dialogAction("dialog_ok");
  same(hass.calls.at(-1), ["todo", "update_item", { entity_id: "todo.maison", item: "m3", rename: "Book the boiler check", description: "Before the cold days" }]);
  card._dialogClosedAt = 0;
  click(card, { action: "edit", uid: "m4" });
  card._dialogAction("remove");
  same(hass.calls.at(-1), ["todo", "remove_item", { entity_id: "todo.maison", item: "m4" }]);
  card._dialogClosedAt = 0;
  click(card, { action: "clear" });
  same(hass.calls.at(-1), ["todo", "remove_completed_items", { entity_id: "todo.maison" }]);
});

test("the completed items are folded by default; a list without the create feature has no field", async () => {
  const { card, html } = await mount();
  assert.doesNotMatch(html(), /Water the plants/);
  click(card, { action: "toggle_section", section: "completed" });
  assert.match(html(), /Water the plants/);
  card._outside.tap({ composedPath: () => [] });
  assert.doesNotMatch(html(), /Water the plants/);
  const h = makeHass();
  h.states["todo.maison"].attributes.supported_features = 0;
  card.hass = { ...h };
  assert.doesNotMatch(card.shadowRoot.innerHTML, /data-keep="new"/);
  assert.doesNotMatch(card.shadowRoot.innerHTML, /data-action="edit"/);
});

test("a list with everything done says so", async () => {
  const { html } = await mount({ entity: "todo.projets" }, "done");
  assert.match(html(), /Nothing to do/);
  assert.match(html(), /chip ok[^>]*>.*All done/s);
});

test("mini card: the first items and the add button, which opens a popup; the detail button shows the full card", async () => {
  const { card, hass, html } = await mount({ entity: "todo.courses" }, "default", TodoMiniCard);
  assert.equal((html().match(/class="item"/g) || []).length, 3);
  assert.match(html(), /\+ 4 more/);
  click(card, { action: "add_dialog" });
  assert.match(html(), /Add to Shopping/);
  card._inputs.new = "Rice";
  card._dialogAction("dialog_ok");
  same(hass.calls.at(-1), ["todo", "add_item", { entity_id: "todo.courses", item: "Rice" }]);
  card._dialogClosedAt = 0;
  click(card, { action: "zoom" });
  assert.match(html(), /data-keep="new"/);
});

test("nothing found: a clear message instead of an empty card", () => {
  const card = new TodoCard();
  card.setConfig({});
  card.hass = { states: {}, entities: {}, devices: {}, language: "en" };
  assert.match(card.shadowRoot.innerHTML, /No to-do list found/);
});

test("French: texts and due dates in the card's language", async () => {
  const { html } = await mount({ language: "fr" });
  assert.match(html(), /1 en retard/);
  assert.match(html(), /Hier/);
  assert.match(html(), /Ajouter à Home…/);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = td.STRINGS.en;
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [l, table] of Object.entries(td.STRINGS)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.deepEqual(ph(table[k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(td.LANGUAGES.length, Object.keys(td.STRINGS).length);
});

test("visual editor: defaults left out of the YAML; the mini editor adds the detail button", () => {
  const Editor = td.element("todo-card-editor");
  const MiniEditor = td.element("todo-mini-card-editor");
  const doc = td.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    let out;
    ed.dispatchEvent = (ev) => {
      out = ev.detail.config;
    };
    ed.setConfig({ type: "custom:todo-card" });
    ed.hass = makeHass();
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:todo-card", sort: "manual", collapsed: ["completed"], show_add: false } } });
    same(out, { type: "custom:todo-card", show_add: false });
  } finally {
    doc.createElement = create;
  }
  assert.ok(MiniEditor.toggles.some(([n]) => n === "zoom"));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  const { html } = await mount();
  for (const m of html().matchAll(/<(div|span)[^>]*data-(entity|action)=[^>]*>/g)) {
    assert.match(m[0], /role="button"/, m[0]);
    assert.match(m[0], /tabindex="0"/, m[0]);
  }
});

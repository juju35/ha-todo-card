import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const td = load({ names: ["resolve", "dueOf", "sortItems", "STRINGS", "LANGUAGES", "CARD_ICONS"] });
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

// A card on mock data changed by `change(data)` before it is mounted.
const mountWith = async (config, change, Card = TodoCard) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass();
  change(hass);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[\u2009\u202f\u00a0]/g, " ") };
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
  // Nothing late on the shopping list: the pill says so, the count is the hero's big number.
  assert.match(html(), /chip accent[^>]*>.*Up to date/s);
  assert.match(html(), /<b>7<\/b><span>to do<\/span>/);
});

test("the body does not repeat the pill word for word, except when the pill keeps only its dot", async () => {
  const { card, hass, html } = await mount();
  // A second item overdue: the pill says "2 overdue", the hero's line saying the same is hidden (.pill-echo).
  card._items = card._items.map((it) => (it.uid === "m2" ? { ...it, due: "2026-11-15" } : it));
  card.hass = { ...hass };
  assert.match(html(), /chip crit[^>]*>.*2 overdue/s);
  assert.match(html(), /class="line crit pill-echo"[^>]*>.*2 overdue/s);
  assert.match(html(), /\.line\.pill-echo \{ display: none; \}/);
  assert.match(html(), /@container td-card \(max-width: 200px\) \{ \.td-banner ~ \.content \.line\.pill-echo \{ display: flex; \} \}/);
  // Due today only: the pill says how many; the single-list subtitle no longer repeats the count.
  const today = await mount({ entity: "todo.maison", entities: ["todo.maison"] });
  today.card._items = today.card._items.filter((it) => it.uid !== "m1");
  today.card.hass = { ...today.hass };
  assert.match(today.html(), /chip warn[^>]*>.*1 due today/s);
  assert.doesNotMatch(today.html(), /class="sub"/);
  // The mini card: the count still to do leads the line of the other items.
  const mini = await mount({ entity: "todo.courses" }, "default", TodoMiniCard);
  assert.match(mini.html(), /7 to do · Tomatoes, Apples/);
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

test("summary: the count left, then overdue, due today and done beside the illustration; it can be hidden", async () => {
  const { html } = await mount();
  assert.match(html(), /class="hero"/);
  assert.match(html(), /<b>4<\/b><span>to do<\/span>/);
  assert.match(html(), /line crit[^>]*>.*Overdue: Change the ventilation filter/s);
  assert.match(html(), /line warn[^>]*>.*Due today: Take the bins out/s);
  assert.match(html(), /line ok[^>]*>.*1 done/s);
  // Due dates under the items, colored; a short detail as a pill.
  assert.match(html(), /class="due crit"/);
  const shop = await mount({ entity: "todo.courses" });
  assert.match(shop.html(), /class="pill"[^>]*>1 kg</);
  const off = await mount({ show_hero: false });
  assert.doesNotMatch(off.html(), /class="hero"/);
});

test("mini card: the summary lines, the next items and the add button, which opens a popup; the detail button shows the full card", async () => {
  const { card, hass, html } = await mount({ entity: "todo.courses" }, "default", TodoMiniCard);
  assert.match(html(), /2 done/);
  assert.match(html(), /Tomatoes, Apples \+ 5 more/);
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

test("a list that can't be updated (create only, e.g. Picnic): checkboxes disabled, no edit", async () => {
  const { card, hass, html } = await mountWith({ entity: "todo.courses" }, (h) => {
    h.states["todo.courses"].attributes.supported_features = 1;
  });
  assert.match(html(), /class="check"[^>]*aria-disabled="true" disabled/);
  assert.doesNotMatch(html(), /data-action="toggle"|data-action="edit"/);
  const before = hass.calls.length;
  click(card, { action: "toggle", uid: "c2" });
  assert.equal(hass.calls.filter((c) => c[1] === "update_item").length, 0);
  assert.equal(hass.calls.length, before);
});

test("items without a uid are ticked, edited and deleted by their name", async () => {
  const { card, hass, html } = await mountWith({ entity: "todo.maison" }, (h) => {
    for (const it of h.subs["todo/item/subscribe|todo.maison"].items) delete it.uid;
  });
  assert.match(html(), /data-action="toggle" data-uid="Book the boiler service"/);
  click(card, { action: "toggle", uid: "Book the boiler service" });
  same(hass.calls.at(-1), ["todo", "update_item", { entity_id: "todo.maison", item: "Book the boiler service", status: "completed" }]);
  click(card, { action: "edit", uid: "Book the boiler service" });
  card._dialogAction("remove");
  same(hass.calls.at(-1), ["todo", "remove_item", { entity_id: "todo.maison", item: "Book the boiler service" }]);
});

test("shopping lists of AnyList and KitchenOwl get the cart; Alexa and Grocy only when named so; other lists don't", async () => {
  assert.ok(!(await mount({ entity: "todo.maison" })).html().includes(td.CARD_ICONS.cart));
  for (const platform of ["anylist", "kitchenowl"]) {
    const { html } = await mountWith({ entity: "todo.maison" }, (h) => {
      h.entities["todo.maison"].platform = platform;
    });
    assert.ok(html().includes(td.CARD_ICONS.cart), platform);
  }
  for (const platform of ["alexa_devices", "grocy"]) {
    const tasks = await mountWith({ entity: "todo.maison" }, (h) => {
      h.entities["todo.maison"].platform = platform;
    });
    assert.ok(!tasks.html().includes(td.CARD_ICONS.cart), `${platform} tasks`);
    const shop = await mountWith({ entity: "todo.maison" }, (h) => {
      h.entities["todo.maison"].platform = platform;
      h.states["todo.maison"].attributes.friendly_name = "Shopping list";
    });
    assert.ok(shop.html().includes(td.CARD_ICONS.cart), `${platform} shopping`);
  }
});

test("due dates: set, changed and cleared from the edit popup; set when adding", async () => {
  const { card, hass, html } = await mount();
  // todo.maison takes a date and a time (SET_DUE_DATETIME).
  const it = card._items.find((i) => i.due);
  click(card, { action: "edit", uid: it.uid });
  assert.match(html(), /type="datetime-local" data-keep="due"/);
  card._inputs.due = "2026-11-20T08:30";
  card._dialogAction("dialog_ok");
  same(hass.calls.at(-1)[2].due_datetime, "2026-11-20 08:30:00");
  card._dialogClosedAt = 0;
  click(card, { action: "edit", uid: it.uid });
  card._inputs.due = "";
  card._dialogAction("dialog_ok");
  assert.equal(hass.calls.at(-1)[2].due_datetime, null);
  card._dialogClosedAt = 0;
  // Unchanged: no due date sent.
  click(card, { action: "edit", uid: it.uid });
  card._inputs.edit_name = "Renamed";
  card._dialogAction("dialog_ok");
  assert.equal("due_datetime" in hass.calls.at(-1)[2], false);
  card._dialogClosedAt = 0;
  // Add with a due date, from the calendar button beside the field.
  assert.match(html(), /data-action="add_dialog"/);
  click(card, { action: "add_dialog" });
  card._inputs.new = "Call the plumber";
  card._inputs.due = "2026-11-21T10:00";
  card._dialogAction("dialog_ok");
  same(hass.calls.at(-1), ["todo", "add_item", { entity_id: "todo.maison", item: "Call the plumber", due_datetime: "2026-11-21 10:00:00" }]);
});

test("due dates on a list that takes a date only", async () => {
  const { card, hass, html } = await mountWith({ entity: "todo.maison" }, (h) => {
    h.states["todo.maison"].attributes.supported_features = 1 + 2 + 4 + 16 + 64;
  });
  const it = card._items.find((i) => i.due);
  click(card, { action: "edit", uid: it.uid });
  assert.match(html(), /type="date" data-keep="due"/);
  card._inputs.due = "2026-11-22";
  card._dialogAction("dialog_ok");
  same(hass.calls.at(-1)[2].due_date, "2026-11-22");
});

test("mini card: items without a uid still show in the line of the next items", async () => {
  const { html } = await mountWith(
    { entity: "todo.maison" },
    (h) => {
      for (const it of h.subs["todo/item/subscribe|todo.maison"].items) delete it.uid;
    },
    TodoMiniCard,
  );
  // The overdue item is named in its own line; the next ones follow in the list line.
  assert.match(html(), /Overdue: Change the ventilation filter/);
  assert.match(html(), /<div class="line"><svg[\s\S]*?<span>[^<]*Book the boiler service/);
});

test("empty list: \"Nothing to do\" once; while loading, no count", async () => {
  const empty = await mountWith({ entity: "todo.maison" }, (h) => {
    h.subs["todo/item/subscribe|todo.maison"].items = [];
  });
  assert.equal((empty.html().match(/Nothing to do/g) || []).length, 1);
  const loading = await mountWith({ entity: "todo.maison" }, (h) => {
    delete h.subs["todo/item/subscribe|todo.maison"];
    h.states["todo.maison"] = { ...h.states["todo.maison"], state: "unknown" };
  });
  assert.doesNotMatch(loading.html(), /<b>0<\/b><span>to do/);
});

test("illustrated header: the theme alone picks the night picture, whatever the sun; forced day/night win", async () => {
  for (const Card of [TodoCard, TodoMiniCard]) {
    const banner = async (darkMode, config = {}) => {
      const { html } = await mountWith(config, (h) => {
        h.states["sun.sun"] = { entity_id: "sun.sun", state: "above_horizon", attributes: {} };
        h.themes = { darkMode };
      }, Card);
      return html().match(/class="td-banner[^"]*"/)[0];
    };
    assert.match(await banner(true), / night"/);
    assert.doesNotMatch(await banner(false), / night"/);
    assert.doesNotMatch(await banner(true, { illustration_theme: "day" }), / night"/);
    assert.match(await banner(false, { illustration_theme: "night" }), / night"/);
  }
});

test("illustrated header: the scene and the icon follow the list's state; night by the dark theme or forced; classic header", async () => {
  const late = await mount({ entities: ["todo.maison"] });
  assert.match(late.html(), /class="td-banner td-todo td-overdue"/);
  assert.match(late.html(), /class="type-icon crit"/);
  assert.match(late.html(), /class="td-note"/);
  const shop = await mount({ entity: "todo.courses", entities: ["todo.courses"] });
  assert.match(shop.html(), /class="td-banner td-shop td-pending"/);
  assert.match(shop.html(), /class="type-icon accent"/);
  const done = await mount({ entity: "todo.projets", entities: ["todo.projets"] }, "done");
  assert.match(done.html(), /td-banner td-todo td-done/);
  assert.match(done.html(), /class="type-icon ok"/);
  // Two cards never share a mask id.
  assert.notEqual(late.html().match(/id="td-mask-(\d+)"/)[1], shop.html().match(/id="td-mask-(\d+)"/)[1]);
  const lightAfterSunset = await mountWith({}, (h) => {
    h.states["sun.sun"] = { entity_id: "sun.sun", state: "below_horizon", attributes: {} };
  });
  assert.doesNotMatch(lightAfterSunset.html(), /td-banner[^"]* night"/, "light theme after sunset: day");
  const night = await mountWith({}, (h) => {
    h.themes = { darkMode: true };
  });
  assert.match(night.html(), /td-banner[^"]* night"/);
  const day = await mountWith({ illustration_theme: "day" }, (h) => {
    h.states["sun.sun"] = { entity_id: "sun.sun", state: "below_horizon", attributes: {} };
  });
  assert.doesNotMatch(day.html(), /td-banner[^"]* night"/);
  const forced = await mount({ illustration_theme: "night" }, "default", TodoMiniCard);
  assert.match(forced.html(), /td-banner[^"]* night"/);
  const classic = await mount({ illustration: false });
  assert.doesNotMatch(classic.html(), /td-banner/);
  assert.match(classic.html(), /class="header"/);
  assert.match(classic.html(), /class="hero-art"/);
});

test("the status pill sits on the title row right after the title, in both headers, placed by measurement", async () => {
  for (const illustration of [true, false]) {
    const { html } = await mount({ entity: "todo.maison", illustration });
    assert.match(html(), /<div class="trow"><div class="name">Lists<\/div><span class="chip crit"/, `illustration ${illustration}`);
    // Under the subtitle (measured, see _fitPill and pill-layout.test.mjs), the subtitle is cut to one line, its whole
    // text in its tooltip; the dot alone at 200 px or less.
    assert.match(html(), /<div class="sub" title="Home">/);
    assert.match(html(), /\.titles\.below \.trow \{ display: contents; \}/);
    assert.match(html(), /@container td-card \(max-width: 200px\) \{ \.titles \.trow > \.chip \{ padding: 4px; \}/);
    assert.doesNotMatch(html(), /td-titles/, "no fixed width threshold for the pill");
  }
});

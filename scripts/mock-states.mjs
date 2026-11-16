// Mock Home Assistant registries and states for the screenshots and the tests: three to-do lists, a shopping list of
// Bring! (its items with their specification as description), the home tasks of Local To-do (with due dates: one
// overdue, one today) and the projects of Todoist; their items are what Home Assistant's to-do subscription sends.
// Entity ids are in French on purpose (the cards never rely on them); the names shown are neutral English ones. Every
// time is relative to NOW, a fixed instant, so that the captures never change. `mockData(variant)` returns everything
// a card needs for one capture.
export const NOW = Date.parse("2026-11-16T10:00:00Z");
const iso = (ms) => new Date(ms).toISOString();

const item = (uid, summary, extra = {}) => ({ uid, summary, status: "needs_action", due: null, description: null, completed: null, ...extra });

export const ITEMS = {
  "todo.courses": [
    item("c1", "Tomatoes", { description: "1 kg" }),
    item("c2", "Apples", { description: "6" }),
    item("c3", "Basil"),
    item("c4", "Semi-skimmed milk", { description: "2 bottles" }),
    item("c5", "Butter"),
    item("c6", "Pasta"),
    item("c7", "Coffee beans"),
    item("c8", "Bread", { status: "completed" }),
    item("c9", "Eggs", { status: "completed" }),
  ],
  "todo.maison": [
    item("m1", "Change the ventilation filter", { due: "2026-11-15" }),
    item("m2", "Take the bins out", { due: "2026-11-16T19:00:00+00:00" }),
    item("m3", "Book the boiler service", { due: "2026-11-20", description: "Before the cold days" }),
    item("m4", "Fix the garden gate"),
    item("m5", "Water the plants", { status: "completed" }),
  ],
  "todo.projets": [item("p1", "Plan the holidays", { due: "2026-11-28" }), item("p2", "Sort the photos")],
};

const base = () => {
  const states = {};
  const entities = {};
  const list = (entity_id, name, platform, features) => {
    entities[entity_id] = { entity_id, device_id: null, platform, translation_key: null };
    const open = ITEMS[entity_id].filter((i) => i.status === "needs_action").length;
    states[entity_id] = { entity_id, state: String(open), attributes: { friendly_name: name, supported_features: features }, last_changed: iso(NOW - 6e4), last_updated: iso(NOW - 6e4) };
  };
  list("todo.courses", "Shopping", "bring", 71);
  list("todo.maison", "Home", "local_todo", 127);
  list("todo.projets", "Projects", "todoist", 127);
  const subs = {};
  for (const [id, items] of Object.entries(ITEMS)) subs[`todo/item/subscribe|${id}`] = { items: structuredClone(items) };
  return { states, entities, devices: {}, areas: {}, api: {}, ws: {}, subs };
};

// The variants of the captures:
//   default — as above
//   done    — the projects are all done
export const mockData = (variant = "default") => {
  const d = base();
  if (variant === "done") {
    d.subs["todo/item/subscribe|todo.projets"].items.forEach((i) => {
      i.status = "completed";
    });
    d.states["todo.projets"].state = "0";
  }
  return d;
};

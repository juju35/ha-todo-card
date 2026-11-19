// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `variant` picks the mock data (scripts/mock-states.mjs).
const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "todo-card", width: 460, config: { entity: "todo.courses", collapsed: [] } },
  { file: "card-home", type: "todo-card", width: 460, config: {}, clicks: ['[data-action="tab"][data-list="todo.maison"]'] },
  { file: "card-edit", type: "todo-card", width: 460, config: { entities: ["todo.maison"] }, clicks: ['[data-action="edit"][data-uid="m3"]'] },
  { file: "mini-card", type: "todo-mini-card", width: 380, config: { entity: "todo.courses" } },
  { file: "mini-card-home", type: "todo-mini-card", width: 380, config: { entity: "todo.maison" } },
  { file: "mini-card-zoom", type: "todo-mini-card", width: 460, config: { entity: "todo.courses" }, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "todo-card", width: 238, config: { max_items: 5 } },
  { file: "mini-card-narrow", type: "todo-mini-card", width: 170, config: { entity: "todo.maison" } },
  // The sidebar panel: a list of tasks (kitchen banner), the shopping list (supermarket banner), the edit popup, a phone.
  { file: "panel", type: "todo-panel", width: 960, config: {} },
  { file: "panel-shopping", type: "todo-panel", width: 960, config: { entity: "todo.courses" } },
  { file: "panel-edit", type: "todo-panel", width: 960, config: { entity: "todo.maison" }, clicks: ['[data-action="edit"][data-uid="m3"]'] },
  { file: "panel-phone", type: "todo-panel", width: 390, config: { entity: "todo.courses" } },
]);

// One looping GIF per distinct animated state:
//   tick           — an item ticked off: its box fills, its tick draws, a line strikes it
//   header-pending — a to-do list with items left: the pencil writes on the list stuck on the fridge
//   header-overdue — something late: the red note swings on the freezer door
//   header-done    — all done: the tick magnet and the sparkles around the list
//   header-shop    — a shopping list: the trolley rolls along the aisle
const header = (file, entity, variant, seconds) => ({ file, type: "todo-mini-card", width: 380, variant, config: { entity, zoom: false, show_add: false }, seconds });
export const gifs = twins([
  { file: "tick", type: "todo-card", width: 460, config: { entity: "todo.courses", max_items: 4, show_completed: false }, clicks: ['[data-action="toggle"][data-uid="c2"]'], seconds: 1.2 },
  header("header-pending", "todo.projets", "default", 1.4),
  header("header-overdue", "todo.maison", "default", 3.2),
  header("header-done", "todo.projets", "done", 1.8),
  header("header-shop", "todo.courses", "default", 6),
]);

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
]);

// One looping GIF per distinct animated state:
//   tick — an item ticked off: its box fills, its tick draws, a line strikes it
export const gifs = twins([{ file: "tick", type: "todo-card", width: 460, config: { entity: "todo.courses", max_items: 4, show_completed: false }, clicks: ['[data-action="toggle"][data-uid="c2"]'], seconds: 1.2 }]);

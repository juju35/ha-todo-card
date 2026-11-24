// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------
import { VERSION } from "./core.js";
import { t } from "./helpers.js";
import { EditorBase } from "./visual-editors.js";
import { register } from "./register.js";
import { TodoCard, TodoMiniCard } from "./cards.js";

export class TodoCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hero", true],
      ["show_tabs", true],
      ["show_add", true],
      ["show_completed", true],
    ];
  }

  static get defaults() {
    return { sort: "manual", collapsed: ["completed"], illustration_theme: "auto" };
  }

  static get sections() {
    return ["completed"];
  }

  _fields() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "entities", selector: { entity: { multiple: true, domain: "todo" } } },
      { name: "entity", selector: { entity: { domain: "todo" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "sort", selector: { select: { mode: "dropdown", options: ["manual", "due", "alpha"].map((value) => ({ value, label: tr(`sort_${value}`) })) } } },
          { name: "max_items", selector: { number: { min: 0, max: 100, step: 1, mode: "box" } } },
        ],
      },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
export class TodoMiniCardEditor extends TodoCardEditor {
  static get toggles() {
    return [...TodoCardEditor.toggles, ["zoom", true]];
  }
}

register(
  [
    ["todo-card", TodoCard, { name: "To-do Card", description: "To-do and shopping lists of every to-do integration: tabs, tick off, add, due dates, edit, completed items folded away." }],
    ["todo-mini-card", TodoMiniCard, { name: "To-do Mini Card", description: "Compact to-do list: the first items to tick off and a button to add one." }],
    ["todo-card-editor", TodoCardEditor],
    ["todo-mini-card-editor", TodoMiniCardEditor],
  ],
  "https://github.com/juju35/ha-todo-card",
);

console.info(`%c TODO-CARD %c v${VERSION} `, "color: white; background: #1e88e5; font-weight: 700;", "color: #1e88e5; background: white; font-weight: 700;");

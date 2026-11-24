// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { FEATURE, TICK_MS, isShopping } from "./core.js";
import { DAY_MS, ICONS, asList, esc, fmtTime, startOfDay, svgIcon } from "./helpers.js";
import { BASE_STYLE, MINI_STYLE } from "./styles.js";
import { CardBase, withMini } from "./card-base.js";
import { dueFields, dueOf, dueValue, keyOf, resolve, sortItems } from "./lists-items.js";
import { BANNER_STYLE, TICK, TODO_STYLE, isNight, listState, sceneSvg, todoArt } from "./styles-2.js";

export let _uidCount = 0;

export class TodoCard extends CardBase {
  constructor() {
    super();
    // Keeps the ids of each card's picture apart on a page with several cards.
    this._uid = ++_uidCount;
  }

  static get defaultCollapsed() {
    return ["completed"];
  }

  static getConfigElement() {
    return document.createElement("todo-card-editor");
  }

  getCardSize() {
    return 6;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return m.lists.map((l) => l.entity);
  }

  _emptyKey(m) {
    return m.lists.length ? null : "no_data";
  }

  _extraDeps() {
    return [this._items, this._tab, this._ticked];
  }

  _configChanged() {
    this._tab = null;
  }

  // The list shown: the tab picked, else `entity`, else the first list.
  _list(m) {
    return m.lists.find((l) => l.entity === this._tab) || m.lists.find((l) => l.entity === this._config.entity) || m.lists[0];
  }

  _afterUpdate() {
    const m = this._resolve();
    const list = m?.lists.length ? this._list(m) : null;
    if (list) this._subscribe(list.entity);
  }

  _onDisconnect() {
    this._unsubscribe();
  }

  // The items of the list shown, live: Home Assistant's to-do subscription (else a one-off read).
  _subscribe(entity) {
    if (this._subEntity === entity || !this._hass) return;
    this._unsubscribe();
    this._subEntity = entity;
    this._items = undefined;
    const conn = this._hass.connection;
    const take = (items) => {
      if (this._subEntity !== entity) return;
      this._items = asList(items);
      this._lastDeps = null;
      this._update();
    };
    if (conn?.subscribeMessage) {
      this._unsub = conn.subscribeMessage((ev) => take(ev?.items), { type: "todo/item/subscribe", entity_id: entity });
      this._unsub?.catch?.(() => {});
    } else {
      this._ws({ type: "todo/item/list", entity_id: entity }).then((res) => take(res?.items));
    }
  }

  _unsubscribe() {
    const u = this._unsub;
    this._unsub = null;
    this._subEntity = null;
    Promise.resolve(u)
      .then((f) => typeof f === "function" && f())
      .catch(() => {});
  }

  _supports(list, feature) {
    return ((this._s(list.entity)?.attributes?.supported_features ?? 0) & FEATURE[feature]) !== 0;
  }

  // The kind of due date the list takes: "datetime" (a date and a time), "date", or null.
  _dueKind(list) {
    if (this._supports(list, "due_datetime")) return "datetime";
    return this._supports(list, "due_date") ? "date" : null;
  }

  _dueField(kind) {
    if (!kind) return "";
    return `<label class="due-field"><span>${esc(this._t("due"))}</span><input class="field" type="${kind === "datetime" ? "datetime-local" : "date"}" data-keep="due" aria-label="${esc(this._t("due"))}"></label>`;
  }

  // The to-do items and the completed ones, with an item just ticked still among the to-do items while it animates.
  _split() {
    const now = Date.now();
    const ticked = this._ticked || new Map();
    const todo = [];
    const done = [];
    for (const it of this._items || []) {
      const t = ticked.get(keyOf(it));
      const live = t && now - t.at < TICK_MS;
      if (live && t.to === "completed") todo.push({ ...it, ticking: true });
      else if (live && t.to === "needs_action") todo.push({ ...it, status: "needs_action" });
      else if (it.status === "completed") done.push(it);
      else todo.push(it);
    }
    return { todo: sortItems(todo, this._config.sort), done };
  }

  _summary(m) {
    const list = this._list(m);
    const { todo, done } = this._split();
    const late = todo.filter((it) => !it.ticking && dueOf(it)?.cls === "crit");
    const dueToday = todo.filter((it) => !it.ticking && dueOf(it)?.cls === "warn");
    const overdue = late.length;
    const count = Number(this._s(list.entity)?.state);
    const open = this._items ? todo.filter((it) => !it.ticking).length : Number.isFinite(count) ? count : null;
    // The pill says how the list stands (late, due today, up to date, all done); the count of items still to do is the
    // hero's big number. Before the items are loaded, the dates are not known: the pill gives the entity's count.
    let chip = null;
    if (overdue) chip = { cls: "crit", text: this._t("overdue_n", { n: overdue }) };
    else if (dueToday.length) chip = { cls: "warn", text: this._t("due_today_n", { n: dueToday.length }) };
    else if (open && this._items === undefined) chip = { cls: "accent", text: this._t("todo_n", { n: open }) };
    else if (open) chip = { cls: "accent", text: this._t("up_to_date") };
    else if (open === 0) chip = { cls: "ok", text: this._t("all_done") };
    return { list, todo, done, open, overdue, late, dueToday, chip };
  }

  _dueText(due) {
    const today = startOfDay(Date.now());
    const day = Math.round((startOfDay(due.at) - today) / DAY_MS);
    const time = due.allDay ? "" : ` ${fmtTime(this._hass, this._config, due.at)}`;
    if (day === 0) return `${this._t("today")}${time}`;
    if (day === 1) return `${this._t("tomorrow")}${time}`;
    if (day === -1) return `${this._t("yesterday")}${time}`;
    const opts = Math.abs(day) < 7 ? { weekday: "short" } : { month: "short", day: "numeric" };
    return `${new Intl.DateTimeFormat(this._locale(), opts).format(new Date(due.at))}${time}`;
  }

  _item(it, canEdit) {
    const key = keyOf(it);
    const done = it.status === "completed" || it.ticking;
    const due = dueOf(it);
    const label = this._t(done ? "mark_todo" : "mark_done", { item: it.summary });
    const dueLine = due ? `<span class="due ${done ? "idle" : due.cls}">${svgIcon(ICONS.calendar)}<span>${esc(this._dueText(due))}</span></span>` : "";
    // A short detail (a quantity: "1 kg", "6") as a pill on the right, a longer one under the item.
    const short = it.description && String(it.description).length <= 14;
    const chip = short ? `<span class="pill" title="${esc(it.description)}">${esc(it.description)}</span>` : "";
    const text = `<span class="s">${esc(it.summary)}</span>${it.description && !short ? `<span class="d">${esc(it.description)}</span>` : ""}${dueLine}`;
    return `<div class="item${done ? " done" : ""}${it.ticking ? " ticking" : ""}">
      ${
        canEdit
          ? `<button class="check" role="checkbox" aria-checked="${done}" data-action="toggle" data-uid="${esc(key)}" title="${esc(label)}" aria-label="${esc(label)}">${TICK}</button>`
          : `<button class="check" role="checkbox" aria-checked="${done}" aria-disabled="true" disabled title="${esc(this._t("read_only"))}" aria-label="${esc(it.summary)}">${TICK}</button>`
      }
      ${canEdit ? `<div class="text clickable" role="button" tabindex="0" data-action="edit" data-uid="${esc(key)}" aria-label="${esc(this._t("edit_item", { item: it.summary }))}">${text}</div>` : `<div class="text">${text}</div>`}
      ${chip}
    </div>`;
  }

  _itemList(items, list, max) {
    if (!items.length) return "";
    const canEdit = this._supports(list, "update");
    const shown = max ? items.slice(0, max) : items;
    const more = items.length - shown.length;
    return `<div class="items">${shown.map((it) => this._item(it, canEdit)).join("")}</div>${more > 0 ? `<div class="more">${esc(this._t("more_n", { n: more }))}</div>` : ""}`;
  }

  _tabs(m, list) {
    if (m.lists.length < 2 || this._config.show_tabs === false) return "";
    return `<div class="tabs" role="tablist">${m.lists
      .map((l) => {
        const n = Number(this._s(l.entity)?.state);
        const on = l.entity === list.entity;
        return `<button class="tab" role="tab" aria-selected="${on}" data-action="tab" data-list="${esc(l.entity)}">${esc(l.name)}${Number.isFinite(n) ? `<span class="n">${n}</span>` : ""}</button>`;
      })
      .join("")}</div>`;
  }

  _adder(list) {
    if (this._config.show_add === false || !this._supports(list, "create")) return "";
    const label = this._t("add_placeholder", { list: list.name });
    const due = this._dueKind(list)
      ? `<button class="btn round" data-action="add_dialog" title="${esc(this._t("add_with_due"))}" aria-label="${esc(this._t("add_with_due"))}">${svgIcon(ICONS.calendar)}</button>`
      : "";
    return `<div class="adder"><input class="field" type="text" data-keep="new" data-submit="add" placeholder="${esc(label)}" aria-label="${esc(label)}" enterkeyhint="done" autocomplete="off">
      ${due}<button class="btn round primary" data-action="add" title="${esc(this._t("add"))}" aria-label="${esc(this._t("add"))}">${svgIcon(ICONS.plus)}</button></div>`;
  }

  // The summary: what is left to do, then what is late, due today and done, beside the illustration.
  _heroLines(sum, max = 3) {
    const lines = [];
    const one = (list, one_, many) => (list.length === 1 ? this._t(one_, { item: list[0].summary }) : this._t(many, { n: list.length }));
    if (sum.late.length) lines.push(["crit", ICONS.alert, one(sum.late, "overdue_item", "overdue_n")]);
    if (sum.dueToday.length) lines.push(["warn", ICONS.calendar, one(sum.dueToday, "due_today_item", "due_today_n")]);
    if (sum.done.length) lines.push(["ok", ICONS.done_all, this._t("done_n", { n: sum.done.length })]);
    if (!sum.todo.length && this._items !== undefined) lines.unshift(["ok", ICONS.done_all, this._t("nothing_to_do")]);
    // A line that says word for word what the header pill says is hidden (.pill-echo); it comes back on a card so
    // narrow that the pill keeps only its dot.
    const pill = sum.chip?.text;
    let shown = 0;
    return lines
      .filter(([, , text]) => text === pill || shown++ < max)
      .map(([cls, icon, text]) => `<div class="line ${cls}${text === pill ? " pill-echo" : ""}">${svgIcon(icon)}<span>${esc(text)}</span></div>`)
      .join("");
  }

  _hero(sum) {
    if (this._config.show_hero === false) return "";
    const loading = sum.open === null || sum.open === undefined;
    const big = loading ? "" : `<div class="big"><b>${sum.open}</b><span>${esc(this._t("to_do"))}</span></div>`;
    // With the illustrated header, the list's picture is in the banner.
    const art = this._config.illustration === false ? `<div class="hero-art">${todoArt(isShopping(sum.list), listState(sum))}</div>` : "";
    return `<div class="hero">${art}<div class="hero-body">
      ${big}${this._heroLines(sum)}</div></div>`;
  }

  // The header: the illustrated banner (`illustration: false`: the classic header). The icon's colour is the list's
  // state: grey while loading, red when something is late, green once all is done, the accent otherwise.
  _head(sum, title, sub) {
    const shopping = isShopping(sum.list);
    const state = listState(sum);
    const loading = sum.open === null || sum.open === undefined;
    const cls = loading && !sum.overdue ? "idle" : { overdue: "crit", done: "ok", pending: "accent" }[state];
    const icon = shopping ? ICONS.cart : ICONS.list;
    if (this._config.illustration === false) return this._header({ icon, cls, title, sub, chip: sum.chip });
    const night = isNight(this._hass, this._config);
    const chip = sum.chip ? `<span class="chip ${sum.chip.cls}" title="${esc(sum.chip.text)}" aria-label="${esc(sum.chip.text)}"><span class="dot"></span><span class="chip-text">${esc(sum.chip.text)}</span></span>` : "";
    const rest = sub && sub !== sum.chip?.text ? `<span class="txt">${esc(sub)}</span>` : "";
    return `<div class="td-banner td-${shopping ? "shop" : "todo"} td-${state}${night ? " night" : ""}">${sceneSvg(shopping, state, this._uid)}
      <div class="td-htext"><div class="type-icon ${cls}">${svgIcon(icon)}</div><div class="titles"><div class="tstack"><div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${
        rest ? `<div class="sub" title="${esc(sub)}">${rest}</div>` : ""
      }</div></div></div>${this._zoomButton()}</div>`;
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  // The date pickers' icon in the dashboard's theme.
  _scheme() {
    // A theme without the dark mode flag: the system's preference.
    const dark = this._hass?.themes?.darkMode ?? window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return dark ? ":host { --td-scheme: dark; }" : "";
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const { list } = sum;
    const parts = [this._hero(sum), this._tabs(m, list), this._adder(list)];
    if (this._items === undefined) parts.push(`<div class="empty">${esc(this._t("loading"))}</div>`);
    else if (!sum.todo.length && c.show_hero === false) parts.push(`<div class="alldone">${svgIcon(ICONS.done_all)}<span>${esc(this._t("nothing_to_do"))}</span></div>`);
    else parts.push(this._itemList(sum.todo, list, Number(c.max_items) || 0));
    if (c.show_completed !== false && sum.done.length) {
      const clear = this._supports(list, "delete")
        ? `<div class="row-end"><button class="btn" data-action="clear">${svgIcon(ICONS.sweep)}<span>${esc(this._t("clear_completed"))}</span></button></div>`
        : "";
      parts.push(this._section("completed", ICONS.done_all, this._t("completed"), sum.done.length, `${this._itemList(sum.done, list, 0)}${clear}`));
    }
    const title = c.title || (m.lists.length > 1 && c.show_tabs !== false ? this._t("lists") : list.name);
    const sub = m.lists.length > 1 && c.show_tabs !== false ? list.name : sum.open && c.show_hero === false ? this._t("todo_n", { n: sum.open }) : "";
    return `<style>${BASE_STYLE}${TODO_STYLE}${this._bannerStyle()}${this._scheme()}</style>
      <ha-card>
        ${this._head(sum, title, sub)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _uidItem(key) {
    return (this._items || []).find((it) => keyOf(it) === key);
  }

  _action(action, el) {
    const m = this._resolve();
    const list = this._list(m);
    if (action === "tab") {
      this._tab = el.dataset.list;
      this._update();
      return true;
    }
    if (action === "add") {
      const text = String(this._inputs.new || "").trim();
      if (text) this._call("todo", "add_item", { entity_id: list.entity, item: text });
      this._inputs.new = "";
      this._update();
      return true;
    }
    if (action === "clear") {
      this._call("todo", "remove_completed_items", { entity_id: list.entity });
      return true;
    }
    if (action === "add_dialog") {
      // The text typed in the add field goes on into the popup, to give it a due date.
      this._inputs.due = "";
      this._openDialog({ add: true, entity: list.entity, name: list.name, due: this._dueKind(list) });
      return true;
    }
    const it = this._uidItem(el.dataset.uid);
    if (!it) return false;
    if (!this._supports(list, "update")) return false;
    if (action === "toggle") {
      const to = it.status === "completed" ? "needs_action" : "completed";
      this._call("todo", "update_item", { entity_id: list.entity, item: keyOf(it), status: to });
      this._ticked = new Map(this._ticked).set(keyOf(it), { to, at: Date.now() });
      // Drawn again once the tick is over (_split then shows the item where the list puts it).
      setTimeout(() => {
        this._lastDeps = null;
        this._update();
      }, TICK_MS + 50);
      this._update();
      return true;
    }
    if (action === "edit") {
      this._inputs.edit_name = it.summary;
      this._inputs.edit_desc = it.description || "";
      const due = this._dueKind(list);
      this._inputs.due = dueValue(it.due, due === "datetime");
      this._openDialog({
        uid: keyOf(it),
        entity: list.entity,
        summary: it.summary,
        description: this._supports(list, "description"),
        remove: this._supports(list, "delete"),
        due,
        dueWas: this._inputs.due,
      });
      return true;
    }
    return false;
  }

  _dialogAction(action) {
    const d = this._dialog;
    if (action === "dialog_ok" && d.add) {
      const text = String(this._inputs.new || "").trim();
      const due = d.due && String(this._inputs.due || "").trim() ? dueFields(this._inputs.due, d.due === "datetime") : {};
      this._closeDialog();
      if (text) this._call("todo", "add_item", { entity_id: d.entity, item: text, ...due });
      this._inputs.new = "";
      this._inputs.due = "";
      this._update();
    } else if (action === "dialog_ok") {
      const name = String(this._inputs.edit_name || "").trim();
      const data = { entity_id: d.entity, item: d.uid };
      if (name && name !== d.summary) data.rename = name;
      if (d.description) data.description = String(this._inputs.edit_desc || "");
      if (d.due && String(this._inputs.due || "") !== d.dueWas) Object.assign(data, dueFields(this._inputs.due, d.due === "datetime"));
      this._closeDialog();
      if (Object.keys(data).length > 2) this._call("todo", "update_item", data);
    } else if (action === "remove") {
      this._closeDialog();
      this._call("todo", "remove_item", { entity_id: d.entity, item: d.uid });
    }
  }

  _dialogHtml() {
    const d = this._dialog;
    if (d.add) {
      const label = this._t("add_placeholder", { list: d.name });
      const body = `<input class="field" type="text" data-keep="new" data-submit="dialog_ok" placeholder="${esc(label)}" aria-label="${esc(label)}" autocomplete="off">${this._dueField(d.due)}`;
      return this._modal(this._t("add_to", { list: d.name }), body, this._t("add"), ICONS.plus);
    }
    const fields = `<input class="field" type="text" data-keep="edit_name" data-submit="dialog_ok" aria-label="${esc(this._t("name"))}" autocomplete="off">${
      d.description ? `<input class="field" type="text" data-keep="edit_desc" data-submit="dialog_ok" placeholder="${esc(this._t("details"))}" aria-label="${esc(this._t("details"))}" autocomplete="off">` : ""
    }${this._dueField(d.due)}${d.remove ? `<div><button class="btn danger" data-action="remove">${svgIcon(ICONS.delete)}<span>${esc(this._t("delete"))}</span></button></div>` : ""}`;
    return this._modal(this._t("edit_item", { item: d.summary }), fields, this._t("save"), ICONS.check);
  }
}

export class TodoMiniCard extends withMini(TodoCard) {
  static getConfigElement() {
    return document.createElement("todo-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const { list } = sum;
    // The summary lines, then the first items still to do.
    let body = `<div class="empty">${esc(this._t("loading"))}</div>`;
    if (this._items !== undefined) {
      const named = new Set([...sum.late, ...sum.dueToday].map(keyOf));
      const rest = sum.todo.filter((it) => !it.ticking && !named.has(keyOf(it)));
      const n = Number(c.max_items) || 2;
      const names = rest.slice(0, n).map((it) => it.summary).join(", ");
      const more = rest.length > n ? ` ${this._t("more_n", { n: rest.length - n })}` : "";
      // The pill says how the list stands: the count still to do leads the line of the other items.
      const count = sum.open ? this._t("todo_n", { n: sum.open }) : "";
      const text = [count, names + more].filter(Boolean).join(" · ");
      body = `${this._heroLines(sum, 2)}${text ? `<div class="line">${svgIcon(ICONS.list)}<span>${esc(text)}</span></div>` : ""}`;
    }
    const art = c.show_hero === false || c.illustration !== false ? "" : `<div class="hero-art">${todoArt(isShopping(list), listState(sum))}</div>`;
    const add =
      c.show_add !== false && this._supports(list, "create")
        ? `<div class="controls"><button class="btn round primary" data-action="add_dialog" title="${esc(this._t("add_to", { list: list.name }))}" aria-label="${esc(this._t("add_to", { list: list.name }))}">${svgIcon(ICONS.plus)}</button></div>`
        : "";
    return `<style>${BASE_STYLE}${TODO_STYLE}${MINI_STYLE}${this._bannerStyle()}${this._scheme()}</style>
      <ha-card>
        ${this._head(sum, c.title || list.name, "")}
        <div class="content mini">${art}<div class="info">${body}</div>${add}</div>
      </ha-card>`;
  }
}

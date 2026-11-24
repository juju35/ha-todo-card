// ── End of the folded top bar ──
import { NEW_LIST_URL, PANEL_ICONS, PANEL_KEY, PANEL_SORTS, PANEL_STYLE } from "./sidebar-panel.js";
import { todoPanelFold } from "./core.js";

export class TodoPanel extends TodoCard {
  constructor() {
    super();
    this._tab = this._tabFromUrl();
    let saved = {};
    try {
      saved = JSON.parse(window.localStorage?.getItem(PANEL_KEY) || "{}") || {};
    } catch {
      saved = {};
    }
    this._sort = PANEL_SORTS.includes(saved.sort) ? saved.sort : null;
    this._error = "";
    // Reorder: an item dragged by its handle (pointer), or moved with the arrow keys on its handle.
    this.shadowRoot.addEventListener("pointerdown", (ev) => {
      const handle = ev.composedPath().find((n) => n.classList?.contains?.("handle"));
      if (handle) this._startDrag(handle, ev);
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const handle = ev.composedPath?.().find((n) => n.classList?.contains?.("handle"));
      if (!handle || (ev.key !== "ArrowUp" && ev.key !== "ArrowDown")) return;
      ev.preventDefault();
      this._moveBy(handle.dataset.drag, ev.key === "ArrowUp" ? -1 : 1);
    });
    this._onPop = () => {
      this._tab = this._tabFromUrl();
      this._update();
    };
  }

  // Home Assistant gives the panel its configuration (`config:` of panel_custom), the narrow flag and hass.
  set panel(panel) {
    this._panel = panel;
    const config = { ...(panel?.config || {}) };
    const key = JSON.stringify(config);
    if (key === this._panelKey && this._config) return;
    this._panelKey = key;
    this.setConfig(config);
  }

  get panel() {
    return this._panel;
  }

  set narrow(narrow) {
    this._narrow = narrow;
    this._syncMenu();
  }

  get narrow() {
    return this._narrow;
  }

  static getStubConfig() {
    return {};
  }

  // The list of the address (`?entity_id=`, as on Home Assistant's own page), kept when the configuration changes.
  _configChanged() {
    this._tab = this._tabFromUrl() || this._tab || null;
  }

  _tabFromUrl() {
    try {
      return new URLSearchParams(window.location?.search || "").get("entity_id") || null;
    } catch {
      return null;
    }
  }

  _onConnect() {
    window.addEventListener("popstate", this._onPop);
  }

  _onDisconnect() {
    super._onDisconnect();
    this._fold?.detach();
    this._fold = null;
    this._foldTop = null;
    window.removeEventListener("popstate", this._onPop);
  }

  _extraDeps() {
    return [...super._extraDeps(), this._sort, this._error, this._hass?.user?.is_admin];
  }

  // The order: the one picked on the page (remembered), else `sort` of the configuration.
  _split() {
    this._config.sort = this._sort || this._config.sortDefault || "manual";
    return super._split();
  }

  setConfig(config) {
    super.setConfig({ ...config, sortDefault: config?.sort });
  }

  _admin() {
    return this._hass?.user?.is_admin !== false;
  }

  _bare() {
    const mode = this._config.hide_header;
    return mode === true || mode === "all" || (mode === "non_admin" && this._hass?.user?.is_admin === false);
  }

  _afterUpdate() {
    super._afterUpdate();
    this.toggleAttribute?.("bare", this._bare());
    this._syncMenu();
    // The top bar folds on scroll; set up again when the banner comes back (option Hide the top bar)
    const top = this.shadowRoot?.querySelector?.(".pbanner") || null;
    if (top !== this._foldTop) {
      this._foldTop = top;
      this._attachFold();
    }
  }

  // The page is drawn into a box of its own: the folded top bar stays beside it, out of the diff.
  _drawRoot() {
    if (typeof this.shadowRoot?.append !== "function") return this.shadowRoot;
    if (!this._box || this._box.parentNode !== this.shadowRoot) {
      this._box = document.createElement("div");
      this._box.className = "td-box";
      this.shadowRoot.append(this._box);
    }
    return this._box;
  }

  /** The top bar folds on scroll into one bar with the lists as icon pills (see todoPanelFold). */
  _attachFold() {
    this._fold?.detach();
    this._fold = todoPanelFold(this, {
      top: ".pbanner",
      tabs: ".tabbar",
      tab: ".ptab",
      key: (b) => b.dataset.list,
      icons: {},
      badge: ".pcount",
      name: ".pbanner .name",
      sub: ".pbanner .sub",
      icon: ".pbanner .type-icon",
      status: ".pbanner .chip",
      acts: ".pbanner .hbtns > *",
      accent: "#1e88e5",
      mount: this._box,
      css: ":host([pf-folded]) .pbanner, :host([pf-folded]) .tabbar { display:none !important; }",
      menu: () => ({ hass: this._hass, narrow: this._narrow, show: Boolean(this._narrow) }),
    });
  }

  // Home Assistant's menu button (shown on a narrow screen) needs hass and narrow after each drawing.
  _syncMenu() {
    const menu = this.shadowRoot?.querySelector?.("ha-menu-button");
    if (!menu) return;
    menu.hass = this._hass;
    menu.narrow = this._narrow;
  }

  _save() {
    try {
      window.localStorage?.setItem(PANEL_KEY, JSON.stringify({ sort: this._sort }));
    } catch {
      /* private mode, quota: not remembered */
    }
  }

  // The banner's round buttons: the list's information, create a list and delete it (administrators).
  _buttons(list) {
    const btn = (action, icon, label) => `<button class="hbtn" data-action="${action}" title="${esc(label)}" aria-label="${esc(label)}">${svgIcon(icon)}</button>`;
    const admin = this._admin();
    return [
      list ? btn("info", PANEL_ICONS.info, this._t("information")) : "",
      admin ? btn("new_list", PANEL_ICONS.new_list, this._t("create_list")) : "",
      admin && list?.platform === "local_todo" ? btn("delete_list", PANEL_ICONS.delete_list, this._t("delete_list")) : "",
    ].join("");
  }

  // The cards' illustrated banner across the page: the list's picture, its name with the status pill, the counts.
  _banner(sum, buttons) {
    const shopping = isShopping(sum?.list);
    const state = sum ? listState(sum) : "pending";
    const loading = !sum || sum.open === null || sum.open === undefined;
    const cls = loading && !sum?.overdue ? "idle" : { overdue: "crit", done: "ok", pending: "accent" }[state];
    const night = isNight(this._hass, this._config);
    const chip = sum?.chip ? `<span class="chip ${sum.chip.cls}" title="${esc(sum.chip.text)}"><span class="dot"></span><span class="chip-text">${esc(sum.chip.text)}</span></span>` : "";
    const counts = sum && !loading ? [this._t("todo_n", { n: sum.open }), this._t("done_n", { n: sum.done.length })].join(" · ") : "";
    const title = this._config.title || sum?.list.name || this._t("panel_title");
    return `<div class="td-banner pbanner td-${shopping ? "shop" : "todo"} td-${state}${night ? " night" : ""}">${sceneSvg(shopping, state, this._uid)}
      <div class="phtext"><ha-menu-button></ha-menu-button><div class="type-icon ${cls}">${svgIcon(shopping ? ICONS.cart : ICONS.list)}</div>
        <div class="titles"><div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${counts ? `<div class="sub">${esc(counts)}</div>` : ""}</div></div>
      <div class="hbtns">${buttons}</div></div>`;
  }

  // One text tab per list, with its count of items left.
  _tabbar(m, list, bare, buttons) {
    const tabs = m.lists
      .map((l) => {
        const n = Number(this._s(l.entity)?.state);
        const on = l.entity === list.entity;
        return `<button class="ptab" role="tab" aria-selected="${on}" tabindex="${on ? 0 : -1}" data-action="tab" data-list="${esc(l.entity)}">${svgIcon(isShopping(l) ? ICONS.cart : ICONS.list)}<span>${esc(l.name)}</span>${
          Number.isFinite(n) && n > 0 ? `<span class="pcount">${n}</span>` : ""
        }</button>`;
      })
      .join("");
    return `<div class="tabbar">${bare ? "<ha-menu-button></ha-menu-button>" : ""}<div class="ptabs" role="tablist">${tabs}</div><div class="tb-side">${bare ? buttons : ""}</div></div>`;
  }

  _tile(icon, color, name, n, text) {
    return `<div class="ptile ${n ? color : "rest"}"><span class="pastille">${svgIcon(icon)}${n ? `<span class="pbadge">${n > 99 ? "99+" : n}</span>` : ""}</span>
      <span class="tl"><span class="tn">${esc(name)}</span><span class="ts">${esc(text)}</span></span></div>`;
  }

  _tiles(sum) {
    const n = (list) => (this._items === undefined ? 0 : list.length);
    const open = this._items === undefined ? 0 : sum.todo.filter((it) => !it.ticking).length;
    const none = this._t("none");
    return `<div class="ptiles">${[
      this._tile(ICONS.list, "accent", this._t("to_do_title"), open, open ? this._t("todo_n", { n: open }) : this._t("nothing_to_do")),
      this._tile(PANEL_ICONS.overdue, "crit", this._t("overdue"), n(sum.late), sum.late.length ? this._t("overdue_n", { n: sum.late.length }) : none),
      this._tile(ICONS.calendar, "warn", this._t("due_today"), n(sum.dueToday), sum.dueToday.length ? this._t("due_today_n", { n: sum.dueToday.length }) : none),
      this._tile(ICONS.done_all, "ok", this._t("completed"), n(sum.done), sum.done.length ? this._t("done_n", { n: sum.done.length }) : none),
    ].join("")}</div>`;
  }

  _sorts() {
    const cur = this._config.sort;
    return `<div class="sorts" role="group" aria-label="${esc(this._t("sort"))}"><span class="lbl">${esc(this._t("sort"))}</span>${PANEL_SORTS.map(
      (s) => `<button class="sort" data-action="sort" data-sort="${s}" aria-pressed="${s === cur}">${esc(this._t(`sort_${s}`))}</button>`,
    ).join("")}</div>`;
  }

  // A row: the card's item (checkbox, text, details pill), with a drag handle (to do, manual order, the list can move
  // items) or a delete button (completed items).
  _row(it, list, { drag, del }) {
    const key = keyOf(it);
    const item = this._item(it, this._supports(list, "update"));
    const handle = drag ? `<button class="handle" data-drag="${esc(key)}" title="${esc(this._t("move_item", { item: it.summary }))}" aria-label="${esc(this._t("move_item", { item: it.summary }))}">${svgIcon(PANEL_ICONS.drag)}</button>` : "";
    const remove = del ? `<button class="del" data-action="remove_item" data-uid="${esc(key)}" title="${esc(this._t("remove_item", { item: it.summary }))}" aria-label="${esc(this._t("remove_item", { item: it.summary }))}">${svgIcon(ICONS.delete)}</button>` : "";
    return `<div class="prow" data-row="${esc(key)}">${handle}${item}${remove}</div>`;
  }

  _boxes(sum, list) {
    const loading = this._items === undefined;
    const drag = this._config.sort === "manual" && this._supports(list, "move") && sum.todo.every((it) => it.uid);
    const del = this._supports(list, "delete");
    const todo = loading
      ? `<div class="empty">${esc(this._t("loading"))}</div>`
      : sum.todo.length
        ? `<div class="items prows">${sum.todo.map((it) => this._row(it, list, { drag })).join("")}</div>`
        : `<div class="alldone">${svgIcon(ICONS.done_all)}<span>${esc(this._t("nothing_to_do"))}</span></div>`;
    const clear = del && sum.done.length ? `<button class="btn" data-action="clear">${svgIcon(ICONS.sweep)}<span>${esc(this._t("clear_completed"))}</span></button>` : "";
    const done = sum.done.length ? `<div class="items">${sum.done.map((it) => this._row(it, list, { del })).join("")}</div>` : `<div class="empty">${esc(this._t("none_completed"))}</div>`;
    const head = (title, n, side = "") => `<div class="bh"><h2>${esc(title)}</h2>${n ? `<span class="pcount">${n}</span>` : ""}${side}</div>`;
    return `<div class="pgrid">
      <section class="pbox">${head(this._t("to_do_title"), loading ? 0 : sum.todo.length)}${todo}</section>
      <section class="pbox">${head(this._t("completed"), sum.done.length, clear)}${loading ? "" : done}</section></div>`;
  }

  _render() {
    const m = this._resolve();
    const style = `<style>${BASE_STYLE}${TODO_STYLE}${BANNER_STYLE}${PANEL_STYLE}${this._scheme()}</style>`;
    const bare = this._bare();
    const dialog = this._dialog ? `<style>${DIALOG_STYLE}</style>${this._dialogHtml()}` : "";
    const error = this._error ? `<div class="errbar" role="alert">${esc(this._error)}</div>` : "";
    if (!m?.lists.length) {
      const buttons = this._buttons(null);
      const create = m && this._admin() ? `<button class="btn primary" data-action="new_list">${svgIcon(PANEL_ICONS.new_list)}<span>${esc(this._t("create_list"))}</span></button>` : "";
      return `${style}<div class="ppage">${bare ? `<div class="tabbar"><ha-menu-button></ha-menu-button><div class="ptabs"></div><div class="tb-side">${buttons}</div></div>` : this._banner(null, buttons)}
        <main>${error}<div class="pempty">${esc(this._t(m ? "no_data" : "no_registry"))}${create}</div></main>${dialog}</div>`;
    }
    const sum = this._summary(m);
    const { list } = sum;
    const buttons = this._buttons(list);
    const tools = `<div class="ptools">${this._adder(list)}${this._sorts()}</div>`;
    return `${style}<div class="ppage">${bare ? "" : this._banner(sum, buttons)}${this._tabbar(m, list, bare, buttons)}
      <main>${error}${this._tiles(sum)}${tools}${this._boxes(sum, list)}</main>${dialog}</div>`;
  }

  _action(action, el) {
    const m = this._resolve();
    const list = m?.lists.length ? this._list(m) : null;
    if (action === "new_list") {
      this._navigate(NEW_LIST_URL);
      return true;
    }
    if (!list) return false;
    if (action === "tab") {
      if (el.dataset.list !== list.entity) this._pushTab(el.dataset.list);
      return super._action(action, el);
    }
    if (action === "sort") {
      this._sort = PANEL_SORTS.includes(el.dataset.sort) ? el.dataset.sort : "manual";
      this._save();
      this._update();
      return true;
    }
    if (action === "info") {
      this._moreInfo(list.entity);
      return true;
    }
    if (action === "delete_list") {
      this._openDialog({ deleteList: true, entity: list.entity, name: list.name });
      return true;
    }
    if (action === "remove_item") {
      const it = this._uidItem(el.dataset.uid);
      if (it && this._supports(list, "delete")) this._call("todo", "remove_item", { entity_id: list.entity, item: keyOf(it) });
      return true;
    }
    return super._action(action, el);
  }

  _pushTab(entity) {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("entity_id", entity);
      window.history.pushState(null, "", `${window.location.pathname}?${params}`);
    } catch {
      /* no history (embedded page): the tab still changes */
    }
  }

  // Home Assistant's own navigation (no page reload).
  _navigate(path) {
    try {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } catch {
      /* no history */
    }
  }

  _dialogAction(action, el) {
    const d = this._dialog;
    if (action === "dialog_ok" && d.deleteList) {
      this._closeDialog();
      this._deleteList(d.entity);
      return;
    }
    super._dialogAction(action, el);
  }

  // Deleting a list removes its Local To-do entry, as Home Assistant's page does.
  async _deleteList(entity) {
    this._error = "";
    try {
      const entry = await this._hass.callWS({ type: "config/entity_registry/get", entity_id: entity });
      if (!entry?.config_entry_id) throw new Error(entity);
      await this._hass.callWS({ type: "config_entries/delete", entry_id: entry.config_entry_id });
      this._tab = null;
      this._pushTab("");
    } catch (err) {
      this._error = `${this._t("action_failed")} ${err?.message || err}`;
    }
    this._lastDeps = null;
    this._update();
  }

  // The edit popup of the page: a field for the name, a box for the description (several lines), the due date.
  _dialogHtml() {
    const d = this._dialog;
    if (d.deleteList) {
      return this._modal(this._t("delete_list"), `<div class="muted">${esc(this._t("delete_list_text", { list: d.name }))}</div>`, this._t("delete"), PANEL_ICONS.delete_list);
    }
    if (d.add || !d.description) return super._dialogHtml();
    const html = super._dialogHtml();
    return html.replace(
      /<input class="field" type="text" data-keep="edit_desc"[^>]*>/,
      `<textarea class="field" data-keep="edit_desc" rows="3" placeholder="${esc(this._t("details"))}" aria-label="${esc(this._t("details"))}"></textarea>`,
    );
  }

  // --- Reorder ---------------------------------------------------------------------------------------------------

  // The items to do in the order shown, and the list.
  _todoOrder() {
    const m = this._resolve();
    const list = this._list(m);
    return { list, todo: this._split().todo };
  }

  // Moves an item to `to` (an index among the items to do): shown at once, then sent to the list (previous_uid: the
  // item it now follows, none at the top).
  _moveTo(key, to) {
    const { list, todo } = this._todoOrder();
    const from = todo.findIndex((it) => keyOf(it) === key);
    if (from < 0 || to === from || to < 0 || to >= todo.length || !this._supports(list, "move")) return false;
    const order = todo.filter((_it, i) => i !== from);
    order.splice(to, 0, todo[from]);
    const prev = to > 0 ? order[to - 1].uid : undefined;
    const moved = new Set(order.map(keyOf));
    this._items = [...order.map((it) => (this._items || []).find((x) => keyOf(x) === keyOf(it))), ...(this._items || []).filter((x) => !moved.has(keyOf(x)))];
    this._ws({ type: "todo/item/move", entity_id: list.entity, uid: todo[from].uid, ...(prev ? { previous_uid: prev } : {}) });
    this._lastDeps = null;
    this._update();
    return true;
  }

  _moveBy(key, step) {
    const { todo } = this._todoOrder();
    const from = todo.findIndex((it) => keyOf(it) === key);
    if (from >= 0 && this._moveTo(key, from + step)) {
      this.shadowRoot.querySelector?.(`.handle[data-drag="${CSS.escape(key)}"]`)?.focus?.();
    }
  }

  // Dragging by the handle: the row follows the pointer, the others step aside; dropped, the item moves there.
  _startDrag(handle, ev) {
    const row = handle.closest(".prow");
    const box = row?.parentElement;
    if (!row || !box) return;
    ev.preventDefault();
    const rows = [...box.querySelectorAll(":scope > .prow")];
    const from = rows.indexOf(row);
    const tops = rows.map((r) => r.getBoundingClientRect());
    const height = tops[from].height;
    const startY = ev.clientY;
    let to = from;
    row.classList.add("dragging");
    for (const r of rows) if (r !== row) r.classList.add("shift");
    handle.setPointerCapture?.(ev.pointerId);
    const move = (e) => {
      const dy = e.clientY - startY;
      row.style.transform = `translateY(${dy}px)`;
      const mid = tops[from].top + height / 2 + dy;
      to = from;
      tops.forEach((r, i) => {
        if (i < from && mid < r.top + r.height / 2) to = Math.min(to, i);
        if (i > from && mid > r.top + r.height / 2) to = Math.max(to, i);
      });
      rows.forEach((r, i) => {
        if (r === row) return;
        const shift = from < to && i > from && i <= to ? -height : from > to && i >= to && i < from ? height : 0;
        r.style.transform = shift ? `translateY(${shift}px)` : "";
      });
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      rows.forEach((r) => {
        r.style.transform = "";
        r.classList.remove("shift", "dragging");
      });
      // Drawn again once the press is over (CardBase holds the drawing back under a press).
      setTimeout(() => {
        if (!this._moveTo(row.dataset.row, to)) {
          this._lastDeps = null;
          this._update();
        }
      }, 0);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
}

define("todo-panel", TodoPanel);

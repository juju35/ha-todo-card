import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const td = load();
const TodoPanel = td.element("todo-panel");

const makeHass = ({ admin = true, variant = "default" } = {}) => {
  const d = mockData(variant);
  const calls = [];
  const wsCalls = [];
  return {
    calls,
    wsCalls,
    ...d,
    language: "en",
    locale: { language: "en" },
    user: { is_admin: admin },
    callService: (...a) => calls.push(a),
    callWS: async (msg) => {
      wsCalls.push(msg);
      if (msg.type === "config/entity_registry/get") return { entity_id: msg.entity_id, config_entry_id: "entry-home" };
      return null;
    },
    connection: {
      subscribeMessage: async (cb, msg) => {
        const ev = d.subs[`${msg.type}|${msg.entity_id}`];
        if (ev) cb(structuredClone(ev));
        return () => {};
      },
    },
  };
};

const mount = async (config = {}, opts = {}) => {
  const panel = new TodoPanel();
  panel._connected = true;
  panel.panel = { config };
  panel.narrow = false;
  const hass = makeHass(opts);
  panel.hass = hass;
  panel.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  return { panel, hass, html: () => panel.shadowRoot.innerHTML.replace(/[   ]/g, " ") };
};

const click = (el, dataset) => el._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("panel: the banner, one tab per list, the tiles, the field and both boxes", async () => {
  const { html } = await mount();
  const h = html();
  assert.match(h, /class="td-banner pbanner td-todo td-overdue/);
  assert.match(h, /<ha-menu-button>/);
  assert.equal((h.match(/class="ptab"/g) || []).length, 3);
  assert.match(h, /aria-selected="true"[^>]*data-list="todo\.maison"/);
  assert.match(h, /class="ptile crit"/);
  assert.match(h, /data-keep="new"/);
  assert.match(h, /Change the ventilation filter/);
  assert.match(h, /Clear completed/);
  // Manual order on a list that can move items: a drag handle per item.
  assert.equal((h.match(/class="handle"/g) || []).length, 4);
});

test("panel: a tab shows its list (supermarket banner, no handle on Bring!, which can't move items)", async () => {
  const { panel, html } = await mount();
  click(panel, { action: "tab", list: "todo.courses" });
  await new Promise((r) => setTimeout(r, 0));
  assert.match(html(), /td-banner pbanner td-shop/);
  assert.match(html(), /Tomatoes/);
  assert.doesNotMatch(html(), /class="handle"/);
});

test("panel: tick, delete a completed item, clear, add", async () => {
  const { panel, hass } = await mount({ entity: "todo.maison" });
  click(panel, { action: "toggle", uid: "m4" });
  click(panel, { action: "remove_item", uid: "m5" });
  click(panel, { action: "clear" });
  panel._inputs.new = "Paint the fence";
  click(panel, { action: "add" });
  const calls = JSON.parse(JSON.stringify(hass.calls));
  assert.deepEqual(calls[0], ["todo", "update_item", { entity_id: "todo.maison", item: "m4", status: "completed" }]);
  assert.deepEqual(calls[1], ["todo", "remove_item", { entity_id: "todo.maison", item: "m5" }]);
  assert.deepEqual(calls[2], ["todo", "remove_completed_items", { entity_id: "todo.maison" }]);
  assert.deepEqual(calls[3], ["todo", "add_item", { entity_id: "todo.maison", item: "Paint the fence" }]);
});

test("panel: the edit popup has a box for the description (several lines)", async () => {
  const { panel, html } = await mount({ entity: "todo.maison" });
  click(panel, { action: "edit", uid: "m3" });
  assert.match(html(), /<textarea class="field" data-keep="edit_desc"/);
  assert.match(html(), /type="datetime-local"/);
});

test("panel: reorder sends todo/item/move after the item it now follows, and shows it at once", async () => {
  const { panel, hass, html } = await mount({ entity: "todo.maison" });
  assert.equal(panel._moveTo("m3", 0), true);
  assert.deepEqual(JSON.parse(JSON.stringify(hass.wsCalls.at(-1))), { type: "todo/item/move", entity_id: "todo.maison", uid: "m3" });
  assert.ok(html().indexOf("Book the boiler service") < html().indexOf("Change the ventilation filter"));
  panel._moveTo("m3", 2);
  assert.deepEqual(JSON.parse(JSON.stringify(hass.wsCalls.at(-1))), { type: "todo/item/move", entity_id: "todo.maison", uid: "m3", previous_uid: "m2" });
});

test("panel: the order chips sort the items; no handle outside the manual order", async () => {
  const { panel, html } = await mount({ entity: "todo.maison" });
  click(panel, { action: "sort", sort: "alpha" });
  assert.match(html(), /data-sort="alpha" aria-pressed="true"/);
  assert.ok(html().indexOf("Book the boiler service") < html().indexOf("Take the bins out"));
  assert.doesNotMatch(html(), /class="handle"/);
});

test("panel: create and delete list for administrators only; delete removes the Local To-do entry", async () => {
  const user = await mount({}, { admin: false });
  assert.doesNotMatch(user.html(), /data-action="new_list"|data-action="delete_list"/);
  assert.match(user.html(), /data-action="info"/);
  const { panel, hass, html } = await mount();
  assert.match(html(), /data-action="new_list"/);
  assert.match(html(), /data-action="delete_list"/);
  click(panel, { action: "delete_list" });
  assert.match(html(), /The list Home and all its items will be deleted/);
  click(panel, { action: "dialog_ok" });
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(
    hass.wsCalls.map((m) => m.type),
    ["config/entity_registry/get", "config_entries/delete"],
  );
  assert.equal(hass.wsCalls[1].entry_id, "entry-home");
  // Only Local To-do lists can be deleted from the page (past the guard after a popup closes).
  panel._dialogClosedAt = 0;
  click(panel, { action: "tab", list: "todo.projets" });
  assert.doesNotMatch(html(), /data-action="delete_list"/);
});

test("panel: hide_header keeps the tabs, with the menu and the buttons beside them", async () => {
  const { html } = await mount({ hide_header: true });
  assert.doesNotMatch(html(), /class="td-banner/);
  assert.match(html(), /<div class="tabbar"><ha-menu-button>/);
  assert.match(html(), /<div class="tb-side"><button class="hbtn" data-action="info"/);
  const admin = await mount({ hide_header: "non_admin" });
  assert.match(admin.html(), /class="td-banner/);
  const user = await mount({ hide_header: "non_admin" }, { admin: false });
  assert.doesNotMatch(user.html(), /class="td-banner/);
});

test("panel: the information button opens the list's more-info", async () => {
  const { panel } = await mount({ entity: "todo.projets" });
  click(panel, { action: "info" });
  assert.equal(panel.events.at(-1).type, "hass-more-info");
  assert.equal(panel.events.at(-1).detail.entityId, "todo.projets");
});

// ----- Sidebar badge ----------------------------------------------------------------------------------------------
// The number of items to do on the panel's sidebar entry, like Home Assistant's notifications count. The bundle runs
// on every page that loads it (the dashboards' resource, the panel's module): it finds the todo-panel entries in
// `hass.panels` (panel_custom), adds up the state of their lists (a to-do entity's state is its count of items to
// do; `config.entities`, else every to-do list) and keeps a badge on each entry, drawn again when a list changes or
// the sidebar rebuilds its items. `config: {badge: false}` leaves an entry without it.

// The panels drawn by todo-panel and their counts, from a hass object.
export const todoBadgeCounts = (hass) => {
  const out = [];
  if (!hass?.panels || !hass.states) return out;
  let all;
  for (const p of Object.values(hass.panels)) {
    const cfg = p?.config || {};
    if (p?.component_name !== "custom" || cfg._panel_custom?.name !== "todo-panel" || cfg.badge === false || !p.url_path) continue;
    all ??= Object.keys(hass.states).filter((id) => id.startsWith("todo."));
    const ids = Array.isArray(cfg.entities) && cfg.entities.length ? cfg.entities : all;
    const count = ids.reduce((n, id) => {
      const v = Number.parseInt(hass.states[id]?.state, 10);
      return n + (Number.isFinite(v) && v > 0 ? v : 0);
    }, 0);
    out.push({ path: p.url_path, count });
  }
  return out;
};

// One badge span, styled as Home Assistant's own sidebar badge (class `badge`: the sidebar shows the start one over
// the icon when collapsed and the end one at the trailing edge when expanded). A custom panel's icon is an <ha-icon>,
// which the sidebar's `ha-svg-icon + .badge` rule does not match: the start one is placed over the icon here.
export const todoBadgeSpan = (text, slot) => {
  const el = document.createElement("span");
  el.className = "badge todo-panel-badge";
  el.slot = slot;
  el.dataset.text = text;
  el.textContent = text;
  const place = slot === "start" ? "position:absolute; top:var(--ha-space-1, 4px); left:26px; z-index:1; pointer-events:none; " : "";
  el.style.cssText = `${place}display:inline-flex; justify-content:center; align-items:center; min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; border-radius:9px; font-size:11px; font-weight:500; line-height:1; color:var(--text-primary-color, #fff); background:var(--primary-color);`;
  return el;
};

export const todoSidebar = () =>
  document.querySelector?.("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar")?.shadowRoot || null;

// The badges drawn from the last counts; unchanged, nothing is written (so the observer below does not loop).
export const todoBadgeRedraw = () => {
  const sidebar = todoSidebar();
  if (!sidebar) return false;
  for (const { path, count } of window.__todoPanelBadge.counts) {
    const item = sidebar.querySelector(`#sidebar-panel-${CSS.escape(path)}`) || sidebar.querySelector(`[href="/${CSS.escape(path)}"]`) || sidebar.querySelector(`[data-panel="${CSS.escape(path)}"]`);
    if (!item) continue;
    const spans = item.querySelectorAll(":scope > .todo-panel-badge");
    const text = count > 99 ? "99+" : String(count);
    if (!count) {
      for (const b of spans) b.remove();
      continue;
    }
    if (item.localName === "a") {
      let badge = spans[0];
      if (badge?.dataset.text === text) continue;
      if (!badge) {
        badge = todoBadgeSpan(text, "end");
        badge.style.cssText += "position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none;";
        item.style.position = "relative";
        item.appendChild(badge);
      }
      badge.dataset.text = badge.textContent = text;
      continue;
    }
    if (spans.length === 2 && spans[0].dataset.text === text) continue;
    for (const b of spans) b.remove();
    const icon = item.querySelector(':scope > ha-svg-icon[slot="start"], :scope > ha-icon[slot="start"]');
    const start = todoBadgeSpan(text, "start");
    if (icon) item.insertBefore(start, icon.nextSibling);
    else item.appendChild(start);
    item.appendChild(todoBadgeSpan(text, "end"));
  }
  return true;
};

export const todoBadgeUpdate = () => {
  const hass = document.querySelector?.("home-assistant")?.hass;
  const counts = todoBadgeCounts(hass);
  const key = JSON.stringify(counts);
  if (key !== window.__todoPanelBadge.key) {
    window.__todoPanelBadge.key = key;
    window.__todoPanelBadge.counts = counts;
  }
  todoBadgeRedraw();
  return hass;
};

// Started once per page (the bundle may be loaded twice, under two addresses), in a browser only.
export const todoBadgeStart = (tries = 0) => {
  const hass = todoBadgeUpdate();
  const sidebar = todoSidebar();
  if (!hass?.connection || !sidebar) {
    if (tries < 60) setTimeout(() => todoBadgeStart(tries + 1), 500);
    return;
  }
  // A list's count changed (state_changed of a to-do entity): counted again once hass carries the new state.
  let timer = 0;
  hass.connection
    .subscribeEvents((ev) => {
      if (!ev?.data?.entity_id?.startsWith("todo.")) return;
      clearTimeout(timer);
      timer = setTimeout(todoBadgeUpdate, 300);
    }, "state_changed")
    .catch(() => {});
  // The sidebar rebuilds its items (folded, edited, panels changed): the badges are put back.
  let frame = 0;
  new MutationObserver(() => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      todoBadgeRedraw();
    });
  }).observe(sidebar, { childList: true, subtree: true });
};

if (typeof window !== "undefined" && typeof document?.querySelector === "function" && !window.__todoPanelBadge) {
  window.__todoPanelBadge = { key: "", counts: [] };
  todoBadgeStart();
}

// ---------------------------------------------------------------------------
// Lists and items
// ---------------------------------------------------------------------------
import { asList, domainOf, nameOf, parseTime, startOfDay } from "./helpers.js";

export const _cache = new WeakMap();

// The to-do lists of the configuration, else every to-do entity: [{ entity, name, platform }].
export const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify(config.entities ?? null)}|${Object.keys(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const ids = config.entities
    ? asList(config.entities)
        .map((x) => (typeof x === "string" ? { entity: x } : x))
        .filter((x) => x?.entity && hass.states[x.entity])
    : Object.keys(hass.states)
        .filter((id) => domainOf(id) === "todo")
        .sort((a, b) => nameOf(hass, a).localeCompare(nameOf(hass, b)))
        .map((entity) => ({ entity }));
  const lists = ids.map((x) => ({ entity: x.entity, name: x.name || nameOf(hass, x.entity), platform: hass.entities?.[x.entity]?.platform || null }));
  const out = { lists };
  per.set(sig, out);
  return out;
};

// When an item is due: { at (ms), allDay, cls: "crit" (overdue) | "warn" (today) | "idle" }; null without a due date.
export const dueOf = (item, now = Date.now()) => {
  const d = item?.due;
  if (!d) return null;
  const allDay = /^\d{4}-\d{2}-\d{2}$/.test(String(d));
  const at = allDay ? new Date(`${d}T00:00:00`).getTime() : parseTime(d);
  if (at === null || Number.isNaN(at)) return null;
  const day = startOfDay(at);
  const today = startOfDay(now);
  const overdue = allDay ? day < today : at < now;
  return { at, allDay, cls: overdue ? "crit" : day === today ? "warn" : "idle" };
};

// An item's key: its uid, else its summary (the to-do services accept either as `item`).
export const keyOf = (it) => it?.uid || it?.summary || "";

// A due date as the value of a date field ("2026-11-17") or of a date and time field ("2026-11-17T08:00").
export const dueValue = (due, withTime) => {
  if (!due) return "";
  const pad = (n) => String(n).padStart(2, "0");
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(due))) return withTime ? `${due}T00:00` : String(due);
  const at = parseTime(due);
  if (at === null) return "";
  const d = new Date(at);
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return withTime ? `${day}T${pad(d.getHours())}:${pad(d.getMinutes())}` : day;
};

// The service fields for a due date field's value: due_datetime when the list takes a time, else due_date; null clears.
export const dueFields = (value, withTime) => {
  const v = String(value || "").trim();
  if (!v) return { [withTime ? "due_datetime" : "due_date"]: null };
  if (withTime) return { due_datetime: v.includes("T") ? `${v.replace("T", " ")}:00` : `${v} 00:00:00` };
  return { due_date: v.slice(0, 10) };
};

// Items in the order asked: as the list keeps them (manual), by due date (undated last) or by name.
export const sortItems = (items, sort) => {
  const list = [...items];
  if (sort === "due") return list.sort((a, b) => (dueOf(a)?.at ?? Number.MAX_SAFE_INTEGER) - (dueOf(b)?.at ?? Number.MAX_SAFE_INTEGER));
  if (sort === "alpha") return list.sort((a, b) => String(a.summary).localeCompare(String(b.summary)));
  return list;
};

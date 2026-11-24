/*
 * To-do Card for Home Assistant
 * https://github.com/juju35/ha-todo-card
 *
 * Lovelace cards for to-do and shopping lists: every list of every to-do integration (Local To-do, Shopping list,
 * Bring!, Todoist, Google Tasks, CalDAV, Mealie, OurGroceries, AnyList, Picnic, Cookidoo, Habitica, Remember The
 * Milk, iCloud reminders, Alexa…), with tabs between lists, items ticked off with a tap, a field to add items, due
 * dates (overdue, today, tomorrow), details, renaming and deleting, and the completed items folded away.
 * Lists are the to-do entities of Home Assistant; the items are read live through its to-do subscription.
 */

export const VERSION = "__VERSION__";

export const CARD_ICONS = {
  list: "M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z",
  cart: "M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z",
  calendar: "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",
  delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
  sweep: "M18,4H15L14,3H10L9,4H6V6H18M7,19A2,2 0 0,0 9,21H15A2,2 0 0,0 17,19V7H7V19M9.5,11.5L11,13L14.5,9.5L15.5,10.5L11,15L8.5,12.5L9.5,11.5Z",
  done_all: "M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z",
};

// Supported features of a to-do list entity (TodoListEntityFeature).
export const FEATURE = { create: 1, delete: 2, update: 4, move: 8, due_date: 16, due_datetime: 32, description: 64 };
// Lists that are shopping lists: a cart for an icon.
export const SHOPPING = new Set(["shopping_list", "bring", "ourgroceries", "any_list", "anylist", "picnic", "cookidoo", "mealie", "kitchenowl"]);
// Alexa and Grocy also have task lists: a shopping list only when its name says so.
export const MAYBE_SHOPPING = new Set(["alexa_devices", "grocy"]);
export const SHOPPING_NAME = /shop|course|einkauf|compra|spesa|boodschap|zakup|grocer|market/i;
export const isShopping = (list) => SHOPPING.has(list?.platform) || (MAYBE_SHOPPING.has(list?.platform) && SHOPPING_NAME.test(list?.name || ""));
// How long a ticked item shows its tick before it moves (or until the list reports it done).
export const TICK_MS = 1200;

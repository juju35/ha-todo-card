// ---------------------------------------------------------------------------
// Sidebar panel (optional): Home Assistant's To-do page, in the look of the other panels
// ---------------------------------------------------------------------------
// Declared in YAML with `panel_custom` (see the README), loading this same file: the cards never need it. It draws
// its own page (no card inside): the cards' illustrated banner across the top (kitchen or supermarket, the status in
// the icon's colour), one text tab per list under it (the list in the address, `?entity_id=todo.home`, as on Home
// Assistant's page), then the summary tiles, the field to add an item, the items to do (dragged by their handle to
// reorder them) and the completed ones. Everything Home Assistant's To-do page does: tick off, add, edit (name,
// description, due date), delete, reorder, clear the completed items, the list's information, create a list and
// delete a Local To-do list (administrators). The order picked is remembered in the browser.

export const PANEL_ICONS = {
  info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
  new_list: "M3,16H10V14H3M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H3V8H14M14,10H3V12H14V10Z",
  delete_list: "M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z",
  drag: "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z",
  overdue: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
};
export const PANEL_SORTS = ["manual", "due", "alpha"];
export const PANEL_KEY = "todo-panel";
// The page Home Assistant opens to create a list (a Local To-do list).
export const NEW_LIST_URL = "/config/integrations/dashboard/add?domain=local_todo";

export const PANEL_STYLE = `
  :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color); --td-natural-width: auto; }
  :host::before { display: none; }
  .ppage { container: td-card / inline-size; }
  /* The cards' banner across the page: the wall, the picture on the right, the 10 px floor strip. */
  .td-banner.pbanner { height: 90px; }
  .pbanner .td-scene { width: min(260px, 38%); }
  .pbanner .phtext { position: absolute; left: 8px; top: 0; bottom: 10px; right: calc(min(260px, 38%) + 132px); display: flex; align-items: center; gap: 10px; min-width: 0; }
  .pbanner ha-menu-button { flex: none; color: inherit; }
  .pbanner .type-icon { width: 44px; height: 44px; margin-left: 4px; }
  .pbanner .titles { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .pbanner .name { font-size: 20px; font-weight: 500; }
  .pbanner .sub { font-size: 13px; }
  /* Round glass buttons, at the left of the picture, centred on the wall. */
  .hbtns { position: absolute; right: calc(min(260px, 38%) + 12px); top: calc((100% - 10px) / 2 - 16px); display: flex; gap: 6px; }
  .hbtn { all: unset; box-sizing: border-box; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
          color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .hbtn .icon { width: 18px; height: 18px; }
  .hbtn:hover { background: rgba(255,255,255,.75); }
  .night .hbtn { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .night .hbtn:hover { background: rgba(255,255,255,.22); }
  .hbtn:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 1px; }
  /* Text tabs under the banner, the active one underlined; with the banner hidden, the menu and the buttons join them. */
  .tabbar { display: flex; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.12));
            background: var(--primary-background-color); position: sticky; top: 0; z-index: 2; }
  .tabbar ha-menu-button { flex: none; margin-left: -8px; color: var(--primary-text-color); }
  .ptabs { flex: 1; min-width: 0; display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
  .ptab { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 12px 10px 10px; font-size: 14px; font-weight: 500; white-space: nowrap;
          color: var(--secondary-text-color); border-bottom: 2px solid transparent; }
  .ptab .icon { width: 16px; height: 16px; }
  .ptab[aria-selected="true"] { color: var(--primary-text-color); border-bottom-color: var(--td-accent); }
  .ptab[aria-selected="true"] .icon { color: var(--td-accent); }
  .ptab:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: -2px; }
  .pcount { display: inline-block; min-width: 18px; padding: 1px 5px; border-radius: 9px; font-size: 11px; text-align: center; box-sizing: border-box;
            color: var(--td-accent-text); background: color-mix(in srgb, var(--td-accent) 16%, transparent); }
  .pcount.crit { color: color-mix(in srgb, var(--td-crit) 55%, var(--primary-text-color)); background: color-mix(in srgb, var(--td-crit) 14%, transparent); }
  .tb-side { flex: none; display: flex; align-items: center; gap: 4px; }
  .tb-side .hbtn { width: 36px; height: 36px; color: var(--secondary-text-color); background: none; box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }
  .tb-side .hbtn:hover { background: color-mix(in srgb, var(--secondary-text-color) 14%, transparent); color: var(--primary-text-color); }
  main { max-width: 1100px; margin: 0 auto; padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px; }
  /* Tiles of the chart: neutral surface, round tinted pastille with the count as badge, name + coloured state line. */
  .ptiles { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ptile { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 12px 14px; border-radius: 12px; box-sizing: border-box; --c: var(--td-idle);
           background: var(--card-background-color, #fff); border: 1px solid var(--divider-color, #e0e0e0); }
  .pastille { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--c);
              background: color-mix(in srgb, var(--c) 16%, transparent); }
  .pastille .icon { width: 22px; height: 22px; }
  .pbadge { position: absolute; top: -3px; right: -5px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; font-size: 11px;
            font-weight: 600; line-height: 18px; text-align: center; color: #fff; background: var(--c); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
  .ptile .tl { display: flex; flex-direction: column; min-width: 0; }
  .ptile .tn { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ptile .ts { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: color-mix(in srgb, var(--c) 65%, var(--primary-text-color)); }
  .ptile.accent { --c: var(--td-accent); } .ptile.crit { --c: var(--td-crit); } .ptile.warn { --c: var(--td-warn); } .ptile.ok { --c: var(--td-ok); }
  .ptile.rest { --c: var(--td-idle); } .ptile.rest .ts { color: var(--secondary-text-color); }
  /* The field to add an item, the order chips at its right. */
  .ptools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .ptools .adder { flex: 1 1 320px; min-width: 0; }
  .ptools .adder .field { background: var(--card-background-color, #fff); }
  .sorts { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .sorts .lbl { font-size: 13px; color: var(--secondary-text-color); }
  .sort { all: unset; cursor: pointer; font-size: 13px; padding: 4px 12px; border-radius: 14px; border: 1px solid var(--divider-color, #e0e0e0); color: var(--secondary-text-color); }
  .sort[aria-pressed="true"] { color: var(--td-accent-text); border-color: color-mix(in srgb, var(--td-accent) 50%, transparent); background: color-mix(in srgb, var(--td-accent) 10%, transparent); }
  .sort:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); }
  /* To do (two thirds) and Completed side by side on a wide page. */
  .pgrid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 14px; align-items: start; }
  .pbox { background: var(--card-background-color, #fff); border-radius: var(--ha-card-border-radius, 12px); padding: 12px 16px; min-width: 0;
          border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color, #e0e0e0)); }
  .bh { display: flex; align-items: center; gap: 8px; min-height: 32px; margin-bottom: 4px; }
  .bh h2 { margin: 0; font-size: 14px; font-weight: 500; color: var(--secondary-text-color); }
  .bh .btn { margin-left: auto; }
  .prow { display: flex; align-items: center; gap: 2px; min-width: 0; border-radius: 8px; }
  .prow + .prow { border-top: 1px solid color-mix(in srgb, var(--divider-color, rgba(0,0,0,.12)) 70%, transparent); }
  .prow > .item { flex: 1; }
  .prow.dragging { position: relative; z-index: 3; background: var(--card-background-color, #fff); box-shadow: 0 4px 16px rgba(0,0,0,.18); }
  .prow.shift { transition: transform .15s ease; }
  .handle { all: unset; flex: none; box-sizing: border-box; width: 28px; height: 36px; display: grid; place-items: center; cursor: grab; touch-action: none;
            color: var(--secondary-text-color); border-radius: 6px; }
  .handle .icon { width: 18px; height: 18px; }
  .handle:hover { color: var(--primary-text-color); }
  .handle:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); }
  .dragging .handle { cursor: grabbing; }
  .prow .del { all: unset; flex: none; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; color: var(--secondary-text-color); }
  .prow .del .icon { width: 18px; height: 18px; }
  .prow .del:hover { color: color-mix(in srgb, var(--td-crit) 55%, var(--primary-text-color)); background: color-mix(in srgb, var(--td-crit) 10%, transparent); }
  .prow .del:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); }
  .errbar { padding: 8px 12px; border-radius: 8px; font-size: 13px; color: color-mix(in srgb, var(--td-crit) 55%, var(--primary-text-color));
            background: color-mix(in srgb, var(--td-crit) 10%, transparent); }
  .pempty { padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; color: var(--secondary-text-color); }
  /* The popup at the top of the page, under the banner and the tabs. */
  .ppage > .backdrop { position: fixed; padding-top: 112px; border-radius: 0; }
  .ppage > .backdrop .modal { width: min(92%, 440px); max-height: calc(100% - 136px); overflow-y: auto; }
  textarea.field { resize: vertical; min-height: 72px; font: inherit; font-size: 15px; }
  :host([bare]) .ppage > .backdrop { padding-top: 64px; }
  @container td-card (max-width: 900px) { .pgrid { grid-template-columns: minmax(0, 1fr); } .ptiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  /* A phone: no picture, the buttons at the right, the pill's dot alone. */
  @container td-card (max-width: 600px) {
    main { padding: 12px; }
    .pbanner .td-scene { display: none; }
    .pbanner .phtext { right: 132px; }
    .hbtns { right: 12px; }
    .pbanner .name { font-size: 17px; }
    .pbanner .chip { padding: 4px; } .pbanner .chip .chip-text { display: none; }
    .ptools .adder { flex-basis: 100%; }
  }
`;

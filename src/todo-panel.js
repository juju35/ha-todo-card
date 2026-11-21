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

const PANEL_ICONS = {
  info: "M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z",
  new_list: "M3,16H10V14H3M18,14V10H16V14H12V16H16V20H18V16H22V14M14,6H3V8H14M14,10H3V12H14V10Z",
  delete_list: "M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19M8,9H16V19H8V9M15.5,4L14.5,3H9.5L8.5,4H5V6H19V4H15.5Z",
  drag: "M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z",
  overdue: "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",
};
const PANEL_SORTS = ["manual", "due", "alpha"];
const PANEL_KEY = "todo-panel";
// The page Home Assistant opens to create a list (a Local To-do list).
const NEW_LIST_URL = "/config/integrations/dashboard/add?domain=local_todo";

const PANEL_STYLE = `
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

// ── Folded top bar ──
// As on the dashboards' illustrated headers (ha-dashboard-header): past 24 px of scroll the 90 px top bar and the
// text tabs fold into one 64 px bar — the panel's icon, title and line, the tabs as round icon pills, the status pill
// and the round buttons — sticky at the top; back under 8 px they unfold. The content does not move: the folded bar
// keeps the room of the top bar and tabs under it. On a narrow panel the pills get a row of their own under the bar,
// the status pill turns to a dot and only the first round button is kept. The folded bar mirrors the top bar and the
// tabs (their text, counts, active tab and buttons): a click on a pill or a button clicks the original.
const todoPanel_FOLD_CSS = `
  .pf-sense { position:relative; height:0; }
  .pf-sense, .pf-fold, .pf-top, .pf-tabs { overflow-anchor:none; }
  .pf-sense > i { position:absolute; left:0; width:1px; height:1px; pointer-events:none; visibility:hidden; }
  .pf-sense > .pf-s1 { top:24px; } .pf-sense > .pf-s2 { top:8px; }
  .pf-fold { display:none; position:sticky; top:0; z-index:6; container-type:inline-size; color:var(--primary-text-color);
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  :host([pf-folded]) .pf-fold { display:block; }
  .pf-fold.pf-measure { display:block; position:absolute; visibility:hidden; }
  :host([pf-folded]) .pf-top, :host([pf-folded]) .pf-tabs { display:none !important; }
  .pf-bar { display:flex; flex-wrap:wrap; align-items:center; column-gap:12px; min-height:64px; padding:0 16px; box-sizing:border-box; }
  .pf-menu { flex:none; display:flex; margin-inline:-8px -4px; color:var(--primary-text-color); }
  .pf-menu[hidden] { display:none; }
  .pf-ic { flex:none; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; color:var(--pf-accent);
           background:color-mix(in srgb, currentColor 14%, transparent); }
  .pf-ic svg, .pf-ic img { width:22px; height:22px; fill:currentColor; }
  .pf-ic ha-icon, .pf-ic ha-svg-icon { --mdc-icon-size:22px; }
  .pf-names { display:flex; flex-direction:column; flex:0 1 auto; min-width:0; max-width:260px; }
  .pf-t { font-size:17px; font-weight:700; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s { font-size:12.5px; line-height:1.3; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pf-s:empty { display:none; }
  .pf-pills { display:flex; gap:6px; flex:1 1 0; min-width:0; overflow-x:auto; scrollbar-width:none; padding:8px 6px 6px 2px; }
  .pf-pills::-webkit-scrollbar { display:none; }
  .pf-pill { all:unset; position:relative; flex:none; width:48px; height:40px; box-sizing:border-box; border-radius:999px; cursor:pointer;
             display:grid; place-items:center; color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-pill:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-pill[aria-selected="true"] { color:var(--pf-accent); border:1.5px solid var(--pf-accent); background:color-mix(in srgb, var(--pf-accent) 14%, transparent); }
  .pf-pill:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-pill svg { width:20px; height:20px; fill:currentColor; flex:none; }
  .pf-pill ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-pill .pf-l { font-size:14px; font-weight:700; }
  .pf-pill b { position:absolute; top:-5px; right:-5px; min-width:18px; height:18px; padding:0 4px; box-sizing:border-box; border-radius:999px;
               font-size:11px; font-weight:700; line-height:14px; text-align:center; color:#fff; background:var(--pf-accent);
               border:2px solid var(--card-background-color, #fff); }
  .pf-end { display:flex; align-items:center; gap:8px; flex:0 1 auto; min-width:0; margin-inline-start:auto; }
  .pf-end > :not(.pf-stat):not(.pf-acts) { min-width:0; max-width:220px; }
  .pf-stat { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600;
             white-space:nowrap; color:var(--pf-c); background:color-mix(in srgb, var(--pf-c) 14%, transparent); }
  .pf-stat > i { width:8px; height:8px; border-radius:50%; background:currentColor; flex:none; }
  .pf-stat:empty, .pf-stat[hidden] { display:none; }
  .pf-acts { display:flex; gap:8px; }
  .pf-acts > * { all:unset; box-sizing:border-box; cursor:pointer; width:40px; height:40px; border-radius:50%; display:grid; place-items:center;
                 color:var(--primary-text-color); border:1px solid var(--divider-color, rgba(0,0,0,.12)); }
  .pf-acts > *:hover { background:color-mix(in srgb, currentColor 6%, transparent); }
  .pf-acts > *:focus-visible { outline:2px solid var(--pf-accent); outline-offset:2px; }
  .pf-acts > *[disabled] { opacity:.6; cursor:default; }
  .pf-acts svg { width:20px; height:20px; fill:currentColor; }
  .pf-acts > .on { color:var(--pf-on, var(--pf-accent)); border:1.5px solid currentColor; background:color-mix(in srgb, currentColor 14%, transparent); }
  .pf-acts ha-icon { --mdc-icon-size:20px; display:flex; }
  .pf-acts .spin svg, .pf-acts .spinning svg { animation:pf-spin 1s linear infinite; }
  @keyframes pf-spin { to { transform:rotate(360deg); } }
  .pf-extra:empty { display:none; }
  .pf-subs { position:absolute; left:0; right:0; top:100%; display:flex; gap:4px; padding:0 12px; overflow-x:auto; scrollbar-width:none;
             background:var(--card-background-color, #fff); border-bottom:1px solid var(--divider-color, rgba(0,0,0,.12));
             box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .pf-subs[hidden] { display:none; }
  .pf-subs::-webkit-scrollbar { display:none; }
  .pf-sub { all:unset; flex:none; display:inline-flex; align-items:center; gap:6px; padding:9px 10px 7px; cursor:pointer; font-size:13px;
            font-weight:500; color:var(--secondary-text-color); border-bottom:2px solid transparent; white-space:nowrap; --mdc-icon-size:18px; }
  .pf-sub:hover { color:var(--primary-text-color); }
  .pf-sub[aria-selected="true"] { color:var(--primary-text-color); border-bottom-color:var(--pf-accent); }
  .pf-sub[aria-selected="true"] ha-icon { color:var(--pf-accent); }
  .pf-sub:focus-visible { outline:2px solid var(--pf-accent); outline-offset:-2px; }
  @container (max-width: 600px) {
    .pf-bar { min-height:0; padding:12px 12px 0 16px; column-gap:10px; row-gap:2px; }
    .pf-names { flex:1 1 0; max-width:none; }
    .pf-t { font-size:17px; }
    .pf-pills { order:9; flex:1 0 100%; margin:0 -12px 0 -16px; padding:6px 12px 10px; }
    .pf-stat { width:26px; height:26px; padding:0; justify-content:center; }
    .pf-stat > span { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
    .pf-acts > *:not(:first-child) { display:none; }
    .pf-end > :not(.pf-stat):not(.pf-acts) { max-width:120px; }
    .pf-amenu .pf-acts > *, .pf-amenu .pf-acts > *:not(:first-child) { display:none; }
    .pf-amenu .pf-acts > .on { display:grid; position:relative; }
    .pf-amenu .pf-acts > .on::after { content:""; position:absolute; right:-3px; bottom:-3px; width:14px; height:14px; border-radius:50%;
      background:var(--card-background-color, #fff) no-repeat center / 12px
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      box-shadow:0 0 0 1px var(--divider-color, rgba(0,0,0,.12)); }
    .pf-amenu.pf-open .pf-acts { position:absolute; z-index:3; right:8px; top:8px; flex-direction:column; padding:6px; border-radius:26px;
      background:var(--card-background-color, #fff); box-shadow:0 6px 18px rgba(0,0,0,.18); }
    .pf-amenu.pf-open .pf-acts > * { display:grid; }
    .pf-amenu.pf-open .pf-acts > .on::after { display:none; }
  }
`;

/**
 * Folds the panel's top bar on scroll. `o`: `top` and `tabs` (the top bar and the tab row), `tab` (a tab, in the
 * row), `key` (a tab's id, from the button), `icons` (id → SVG path), `badge` (a tab's count, in it), `name`, `sub`,
 * `icon`, `status` (in the top bar), `acts` (its round buttons), `accent` (CSS colour), `extra` (an element shown
 * under the bar when folded, such as a sub-tab row: moved there while folded), `side` (an element moved before the
 * status pill while folded, such as an account picker), `subtab` (the sub-tabs of the tab shown, in the page:
 * mirrored in a row under the folded bar), `mount` (the node the folded bar goes before, when not the top bar), `menu` (() => ({ hass, narrow,
 * show })) for Home Assistant's menu button, `css` (the panel's own rules while folded; the folded bar's height is
 * `--pf-h` on the panel), `actsMenu` (narrow: only the active button `.on`, which opens the others, such as alarm
 * modes), `folded` (start folded: the page was drawn again while folded), `badgeColors` (the counts take the colours of the tabs' own badges), `skip` (() => true while the top bar must not fold). Returns { sync, detach }, or null when the panel has no top bar.
 */
function todoPanelFold(host, o) {
  const root = host.shadowRoot;
  const q = (sel) => (sel ? root?.querySelector?.(sel) : null);
  const top = q(o.top);
  const tabs = q(o.tabs);
  host.removeAttribute?.("pf-folded");
  if (!root || !top || !tabs || typeof root.querySelector !== "function") return null;
  if (!root.getElementById?.("pf-style")) {
    const style = document.createElement("style");
    style.id = "pf-style";
    style.textContent = todoPanel_FOLD_CSS + (o.css || "");
    root.appendChild(style);
  }
  top.classList.add("pf-top");
  tabs.classList.add("pf-tabs");
  const sense = document.createElement("div");
  sense.className = "pf-sense";
  sense.setAttribute("aria-hidden", "true");
  sense.innerHTML = '<i class="pf-s1"></i><i class="pf-s2"></i>';
  const fold = document.createElement("div");
  fold.className = "pf-fold";
  fold.style.setProperty("--pf-accent", o.accent);
  if (o.actsMenu) fold.classList.add("pf-amenu");
  fold.innerHTML = `<div class="pf-bar"><span class="pf-menu" hidden></span><span class="pf-ic" aria-hidden="true"></span>
    <div class="pf-names"><span class="pf-t"></span><span class="pf-s"></span></div>
    <div class="pf-pills" role="tablist"></div>
    <div class="pf-end"><span class="pf-stat" role="status"></span><div class="pf-acts"></div></div></div><div class="pf-extra"></div><div class="pf-subs" role="tablist" hidden></div>`;
  const at = o.mount || top;
  at.parentNode.insertBefore(sense, at);
  at.parentNode.insertBefore(fold, at);
  const el = (c) => fold.querySelector(c);
  // Home Assistant's menu button, in a shadow root of its own: the panel's own look-ups of its menu button never
  // find this one
  const menuBtn = document.createElement("ha-menu-button");
  el(".pf-menu").attachShadow?.({ mode: "open" })?.append(menuBtn);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  let folded = false;
  let queued = false;
  let extraHome = null;
  let sideHome = null;

  const tabButtons = () => [...tabs.querySelectorAll(o.tab)];
  const tabLabel = (b) => {
    const clone = b.cloneNode(true);
    for (const n of clone.querySelectorAll?.(`${o.badge || ".badge"}, ha-menu-button, svg`) || []) n.remove();
    return (b.getAttribute("aria-label") || clone.textContent || "").trim();
  };
  const isActive = (b) => b.classList.contains("active") || b.getAttribute("aria-selected") === "true";

  const sync = () => {
    queued = false;
    if (!folded) return;
    const iconBox = q(o.icon);
    const icon = iconBox?.querySelector("svg, ha-icon, ha-svg-icon, img");
    el(".pf-ic").replaceChildren(...(icon ? [icon.cloneNode(true)] : []));
    // The icon keeps the colour of its state, as in the top bar
    el(".pf-ic").style.color = iconBox && !o.iconAccent ? getComputedStyle(iconBox).color : "";
    el(".pf-t").textContent = (q(o.name)?.textContent || "").trim();
    el(".pf-s").textContent = (q(o.sub)?.textContent || "").trim();
    const st = q(o.status);
    const stat = el(".pf-stat");
    const text = (st?.textContent || "").trim();
    stat.hidden = !text;
    if (text) {
      stat.style.setProperty("--pf-c", getComputedStyle(st).color || "var(--pf-accent)");
      stat.setAttribute("aria-label", text);
      stat.innerHTML = `<i></i><span>${esc(text)}</span>`;
    }
    const focused = root.activeElement?.closest?.(".pf-pill")?.dataset.i;
    const shown = tabs.hidden ? [] : tabButtons();
    el(".pf-pills").innerHTML = (shown.length > 1 ? shown : [])
      .map((b, i) => {
        const id = o.key(b);
        const label = tabLabel(b);
        const badgeEl = b.querySelector(o.badge || ".badge");
        const count = (badgeEl?.textContent || "").trim();
        // The count in the colour of its tab's own badge (its tone), where the panel colours them
        let tone = "";
        if (count && o.badgeColors) {
          const cs = getComputedStyle(badgeEl);
          tone = ` style="background:${cs.backgroundColor};color:${cs.color}"`;
        }
        const path = o.icons[id];
        const own = path ? null : b.querySelector("svg, ha-icon");
        const glyph = !path
          ? own
            ? own.outerHTML
            : `<span class="pf-l" aria-hidden="true">${esc(label.slice(0, 1))}</span>`
          : path.startsWith("mdi:")
            ? `<ha-icon icon="${esc(path)}" aria-hidden="true"></ha-icon>`
            : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
        const on = isActive(b);
        return `<button class="pf-pill" role="tab" data-i="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}" title="${esc(label)}" aria-label="${esc(count ? `${label} (${count})` : label)}">${glyph}${count ? `<b aria-hidden="true"${tone}>${esc(count)}</b>` : ""}</button>`;
      })
      .join("");
    if (focused !== undefined) el(`.pf-pill[data-i="${focused}"]`)?.focus({ preventScroll: true });
    // The active pill in sight in a scrolling row, without scrolling the page
    const row = el(".pf-pills");
    const act = el(".pf-pill[aria-selected=true]");
    if (act && (act.offsetLeft < row.scrollLeft || act.offsetLeft + act.offsetWidth > row.scrollLeft + row.clientWidth)) {
      row.scrollLeft = Math.max(0, act.offsetLeft - 16);
    }
    // The sub-tabs of the tab shown (in the page, under the top bar), mirrored in a row under the folded bar
    const subs = o.subtab ? [...root.querySelectorAll(o.subtab)].filter((b) => !fold.contains(b)) : [];
    const subRow = el(".pf-subs");
    subRow.hidden = subs.length < 2;
    subRow.innerHTML = subs.length < 2 ? "" : subs
      .map((b, i) => {
        const on = isActive(b);
        const ic = b.querySelector("ha-icon")?.getAttribute("icon");
        return `<button class="pf-sub" role="tab" data-s="${i}" aria-selected="${on}" tabindex="${on ? 0 : -1}">${ic ? `<ha-icon icon="${esc(ic)}" aria-hidden="true"></ha-icon>` : ""}${esc(tabLabel(b))}</button>`;
      })
      .join("");
    subRow.onclick = (ev) => {
      const sb = ev.target.closest?.(".pf-sub");
      if (sb) subs[Number(sb.dataset.s)]?.click();
    };
    const acts = el(".pf-acts");
    acts.textContent = "";
    for (const a of o.acts ? root.querySelectorAll(o.acts) : []) {
      if (a.offsetParent === null && !top.contains(a)) continue;
      const c = a.cloneNode(true);
      c.removeAttribute("id");
      // An active button (`.on`) keeps the colour of its state
      if (c.classList.contains("on")) c.style.setProperty("--pf-on", getComputedStyle(a).color);
      if (c.tagName !== "A") {
        // The panel's own click handlers see the original only (its data-* stay off the copy)
        for (const n of [c, ...c.querySelectorAll("*")]) for (const at of [...n.attributes]) if (at.name.startsWith("data-")) n.removeAttribute(at.name);
        c.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          // Narrow, with `actsMenu`: the active button opens the list of the others first
          if (o.actsMenu && fold.clientWidth <= 600 && (!fold.classList.contains("pf-open") || c.classList.contains("on"))) {
            fold.classList.toggle("pf-open");
            return;
          }
          fold.classList.remove("pf-open");
          a.click();
        });
      }
      acts.appendChild(c);
    }
    const m = o.menu?.();
    el(".pf-menu").hidden = !m?.show;
    if (m) {
      menuBtn.hass = m.hass;
      menuBtn.narrow = m.narrow;
    }
  };
  const queue = () => {
    if (queued || !folded) return;
    queued = true;
    requestAnimationFrame(sync);
  };

  const setFolded = (v) => {
    if (v === folded) return;
    if (v) {
      const t = top.getBoundingClientRect();
      const b = tabs.getBoundingClientRect();
      if (!t.height || o.skip?.()) return; // top bar hidden (Settings): the tabs alone stay sticky
      const extra = q(o.extra);
      // The room of the top bar and the tabs (and an extra row), by their heights: the tabs may be stuck at the top
      // already (a jump down the page), where their position says nothing of the room they take in the page
      const room = t.height + b.height + (extra ? extra.getBoundingClientRect().height : 0);
      folded = true;
      sync();
      if (extra) {
        extraHome = [extra.parentNode, extra.nextSibling];
        el(".pf-extra").appendChild(extra);
      }
      const side = q(o.side);
      if (side) {
        sideHome = [side.parentNode, side.nextSibling];
        el(".pf-end").prepend(side);
      }
      // Measured out of the flow first, so that the content never moves (nor the browser's scroll anchoring with it)
      fold.style.width = `${t.width}px`;
      fold.classList.add("pf-measure");
      const h = fold.offsetHeight;
      fold.classList.remove("pf-measure");
      fold.style.width = "";
      fold.style.marginBottom = `${Math.round(room - h)}px`;
      host.style.setProperty("--pf-h", `${h}px`);
      host.setAttribute("pf-folded", "");
    } else {
      folded = false;
      const extra = el(".pf-extra").firstElementChild;
      if (extra && extraHome) extraHome[0].insertBefore(extra, extraHome[1] && extraHome[1].parentNode === extraHome[0] ? extraHome[1] : null);
      extraHome = null;
      const side = sideHome && el(".pf-end").firstElementChild;
      if (side && !side.matches(".pf-stat")) sideHome[0].insertBefore(side, sideHome[1] && sideHome[1].parentNode === sideHome[0] ? sideHome[1] : null);
      sideHome = null;
      host.removeAttribute("pf-folded");
      fold.style.marginBottom = "";
    }
  };

  el(".pf-pills").addEventListener("click", (ev) => {
    const p = ev.target.closest?.(".pf-pill");
    if (p) tabButtons()[Number(p.dataset.i)]?.click();
  });
  el(".pf-pills").addEventListener("keydown", (ev) => {
    const step = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
    const p = ev.target.closest?.(".pf-pill");
    if (!step || !p) return;
    ev.preventDefault();
    const all = [...el(".pf-pills").children];
    all[(Number(p.dataset.i) + step + all.length) % all.length]?.focus();
  });

  // The list of buttons opened (narrow, `actsMenu`) closes at a click elsewhere
  const closeMenu = (ev) => {
    if (fold.classList.contains("pf-open") && !ev.composedPath().includes(el(".pf-acts"))) fold.classList.remove("pf-open");
  };
  if (o.actsMenu) root.addEventListener("click", closeMenu, true);
  let io = null;
  if (typeof IntersectionObserver === "function") {
    const [s1, s2] = sense.children;
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const above = !e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0);
        if (e.target === s1 && above) setFolded(true);
        if (e.target === s2 && e.isIntersecting) setFolded(false);
      }
    });
    io.observe(s1);
    io.observe(s2);
  }
  const mo = typeof MutationObserver === "function" ? new MutationObserver(queue) : null;
  mo?.observe(top, { subtree: true, childList: true, characterData: true, attributes: true });
  mo?.observe(tabs, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-selected", "hidden"] });
  // Drawn again while folded (a panel that rewrites its page): folded straight away, without a frame unfolded
  if (o.folded) setFolded(true);
  return {
    sync: queue,
    detach() {
      root.removeEventListener?.("click", closeMenu, true);
      io?.disconnect();
      mo?.disconnect();
      setFolded(false);
      sense.remove();
      fold.remove();
      host.removeAttribute("pf-folded");
    },
  };
}
// ── End of the folded top bar ──

class TodoPanel extends TodoCard {
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

// ----- Sidebar badge ----------------------------------------------------------------------------------------------
// The number of items to do on the panel's sidebar entry, like Home Assistant's notifications count. The bundle runs
// on every page that loads it (the dashboards' resource, the panel's module): it finds the todo-panel entries in
// `hass.panels` (panel_custom), adds up the state of their lists (a to-do entity's state is its count of items to
// do; `config.entities`, else every to-do list) and keeps a badge on each entry, drawn again when a list changes or
// the sidebar rebuilds its items. `config: {badge: false}` leaves an entry without it.

// The panels drawn by todo-panel and their counts, from a hass object.
const todoBadgeCounts = (hass) => {
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
const todoBadgeSpan = (text, slot) => {
  const el = document.createElement("span");
  el.className = "badge todo-panel-badge";
  el.slot = slot;
  el.dataset.text = text;
  el.textContent = text;
  const place = slot === "start" ? "position:absolute; top:var(--ha-space-1, 4px); left:26px; z-index:1; pointer-events:none; " : "";
  el.style.cssText = `${place}display:inline-flex; justify-content:center; align-items:center; min-width:18px; height:18px; box-sizing:border-box; padding:0 5px; border-radius:9px; font-size:11px; font-weight:500; line-height:1; color:var(--text-primary-color, #fff); background:var(--primary-color);`;
  return el;
};

const todoSidebar = () =>
  document.querySelector?.("home-assistant")?.shadowRoot?.querySelector("home-assistant-main")?.shadowRoot?.querySelector("ha-sidebar")?.shadowRoot || null;

// The badges drawn from the last counts; unchanged, nothing is written (so the observer below does not loop).
const todoBadgeRedraw = () => {
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

const todoBadgeUpdate = () => {
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
const todoBadgeStart = (tries = 0) => {
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

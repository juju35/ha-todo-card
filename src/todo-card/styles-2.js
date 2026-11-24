// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

export const TODO_STYLE = `
  .due-field { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--secondary-text-color); }
  .check:disabled { cursor: default; opacity: .45; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .tab { font: inherit; font-size: 13px; font-weight: 500; border: none; cursor: pointer; padding: 6px 12px; border-radius: 16px; min-height: 32px;
         background: var(--secondary-background-color, rgba(127,127,127,.12)); color: var(--primary-text-color); display: inline-flex; align-items: center; gap: 6px; }
  .tab .n { font-weight: 400; color: var(--secondary-text-color); }
  .tab[aria-selected="true"] { background: color-mix(in srgb, var(--td-accent) 16%, transparent); color: var(--td-accent-text); }
  .tab[aria-selected="true"] .n { color: inherit; }
  .tab:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: 2px; }
  .adder { display: flex; gap: 8px; align-items: center; }
  .field { font: inherit; font-size: 14px; width: 100%; box-sizing: border-box; padding: 8px 14px; border-radius: 18px; color: var(--primary-text-color); min-width: 0;
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  /* The date pickers' icon follows the dashboard theme, not the system's. */
  .field { color-scheme: var(--td-scheme, light); }
  .field::placeholder { color: var(--secondary-text-color); }
  /* A narrow card: the placeholder ("Add to Home…") ends in an ellipsis rather than a cut letter. */
  .adder .field { text-overflow: ellipsis; }
  .field:focus { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: -1px; }
  .items { display: flex; flex-direction: column; }
  .item { display: flex; align-items: center; gap: 10px; min-height: 40px; min-width: 0; }
  .check { all: unset; box-sizing: border-box; width: 22px; height: 22px; flex: none; border-radius: 6px; cursor: pointer; display: grid; place-items: center;
           border: 2px solid color-mix(in srgb, var(--primary-text-color) 35%, transparent); color: #fff; margin: 9px; }
  .check:hover { border-color: var(--td-accent); }
  .check:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: 2px; }
  .check svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .check svg { opacity: 0; }
  .item.done .check svg { opacity: 1; }
  .check svg path { stroke-dasharray: 22; stroke-dashoffset: 0; }
  .item.done .check { background: var(--td-accent); border-color: var(--td-accent); }
  .item.done .text .s { text-decoration: line-through; color: var(--secondary-text-color); }
  /* A ticked item: its box fills, its tick draws, a line strikes the text, before it moves to the completed items. */
  .item.ticking .check { animation: td-fill .25s ease-out both; }
  .item.ticking .check svg path { animation: td-draw .35s .15s ease-out both; }
  .item.ticking .text .s { position: relative; color: var(--secondary-text-color); transition: color .3s; }
  .item.ticking .text .s::after { content: ""; position: absolute; left: 0; top: 52%; height: 1.5px; background: currentColor; animation: td-strike .35s .3s ease-out both; }
  @keyframes td-fill { from { background: transparent; border-color: color-mix(in srgb, var(--primary-text-color) 35%, transparent); transform: scale(.8); } to { background: var(--td-accent); border-color: var(--td-accent); transform: scale(1); } }
  @keyframes td-draw { from { stroke-dashoffset: 22; } to { stroke-dashoffset: 0; } }
  @keyframes td-strike { from { width: 0; } to { width: 100%; } }
  .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; padding: 4px 0; }
  .text .s { font-size: 15px; line-height: 1.3; overflow-wrap: break-word; min-width: 0; max-width: 100%; align-self: flex-start; }
  .text .d { font-size: 12px; color: var(--secondary-text-color); overflow-wrap: break-word; }
  .text .due { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--secondary-text-color); }
  .text .due .icon { width: 14px; height: 14px; }
  .text .due.crit, .text .due.warn { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .text .due.crit .icon, .text .due.warn .icon { color: var(--c); }
  .item > .pill { flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* The illustration: a list on a clipboard, a cart for a shopping list. Colors mixed with the card's background so
     that it reads in a light and a dark theme. */
  .art-paper { fill: color-mix(in srgb, #1e88e5 12%, var(--ha-card-background, var(--card-background-color, #fff))); stroke: #64b5f6; stroke-width: 2; }
  .art-clip { fill: #64b5f6; }
  .art-line { fill: color-mix(in srgb, #64b5f6 70%, var(--ha-card-background, var(--card-background-color, #fff))); }
  .art-box { fill: var(--ha-card-background, var(--card-background-color, #fff)); stroke: #90caf9; stroke-width: 2; }
  .art-box.on { fill: #43a047; stroke: #43a047; }
  .content.mini .hero-art { width: 84px; }
  .more { font-size: 12px; color: var(--secondary-text-color); padding: 4px 0 0 42px; }
  .row-end { display: flex; justify-content: flex-end; margin-top: 4px; }
  .alldone { display: flex; align-items: center; gap: 8px; color: var(--secondary-text-color); font-size: 14px; padding: 6px 0; }
  .alldone .icon { color: var(--td-ok); }
  .modal .danger { margin-right: auto; color: color-mix(in srgb, var(--td-crit) 55%, var(--primary-text-color)); }
  .modal .danger .icon { color: var(--td-crit); }
  @container td-card (max-width: 300px) {
    .tab { padding: 4px 10px; font-size: 12px; }
    .text .s { font-size: 14px; }
    .hero-art { width: 88px; }
    .big b { font-size: 26px; }
  }
  @container td-card (max-width: 200px) {
    .check { margin: 9px 4px; }
    .item { gap: 6px; }
    .text .s { font-size: 13px; }
    .more { padding-left: 32px; }
    .hero-art { display: none; }
    .item > .pill { display: none; }
  }
`;

// The illustration of the summary: a list on a clipboard (one item ticked), with a cart for a shopping list. `state`
// shows where the list stands: "pending" (one item ticked, the pencil at work), "done" (every box ticked) or
// "overdue" (the first box red, an exclamation mark in it).
export const todoArt = (shopping, state = "pending") => {
  const rows = [30, 46, 62]
    .map((y, i) => {
      const bx = shopping ? 38 : 44;
      const box = state === "done" ? "on" : state === "overdue" ? (i ? "" : "late") : i ? "" : "on";
      const mark =
        box === "on"
          ? `<path d="M${bx + 2} ${y + 5} l3 3 l5 -6" stroke="#fff" stroke-width="2" fill="none"/>`
          : box === "late"
            ? `<path d="M${bx + 5} ${y + 2.4} v3.4 M${bx + 5} ${y + 7.6} v.1" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>`
            : "";
      return `<rect class="art-box${box ? ` ${box}` : ""}" x="${bx}" y="${y}" width="10" height="10" rx="3"/>${mark}<rect class="art-line" x="${shopping ? 53 : 59}" y="${y + 3}" width="${24 - i * 4}" height="4" rx="2"/>`;
    })
    .join("");
  const x = shopping ? 30 : 36;
  const cart = shopping
    ? '<path d="M84 60 h18 l-4 18 h-12 z" fill="#ffb74d"/><circle cx="88" cy="82" r="3" fill="#8d6e63"/><circle cx="98" cy="82" r="3" fill="#8d6e63"/><path d="M80 56 h5 l3 6" stroke="#8d6e63" stroke-width="2" fill="none"/><circle cx="92" cy="56" r="4" fill="#e53935"/><path d="M95 52 q3 -4 6 -2" stroke="#43a047" stroke-width="2" fill="none"/>'
    : '<g class="art-pen"><path d="M88 30 l10 10 l-22 22 l-12 3 l3 -12 z" fill="#ffb74d"/><path d="M88 30 l10 10 l4 -4 l-10 -10 z" fill="#e57373"/></g>';
  return `<svg viewBox="0 0 120 100" aria-hidden="true"><rect class="art-paper" x="${x}" y="14" width="56" height="74" rx="8"/><rect class="art-clip" x="${x + 16}" y="9" width="24" height="10" rx="4"/>${rows}${cart}</svg>`;
};

// Where a list stands, for the header's picture and the colour of its icon.
export const listState = (sum) => (sum.overdue ? "overdue" : sum.open === 0 ? "done" : "pending");

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The card's list (todoArt) placed in the scene: an inner <svg> cropped to the clipboard.
export const placedArt = (shopping, state, x, y, w, h) =>
  todoArt(shopping, state).replace('<svg viewBox="0 0 120 100"', `<svg class="td-list" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${shopping ? "26 5 80 84" : "32 5 72 84"}"`);

// The header's picture, 200 × 80 at the right of the banner, over a 10 px tiled floor strip edge to edge.
// A to-do list: a kitchen, the list stuck on the fridge door (a red note on the freezer when something is late,
// a green tick magnet once all is done). A shopping list: a supermarket aisle, a trolley rolling along the shelves
// (parked and full once all is bought), the list on the floor at the end of the aisle.
// `uid` keeps each card's mask id apart on a page with several cards.
export const sceneSvg = (shopping, state, uid) => {
  const fade = `<defs><linearGradient id="td-fade-${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="34" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient><mask id="td-mask-${uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="80"><rect width="200" height="80" fill="url(#td-fade-${uid})"/></mask></defs>`;
  const sparks = [
    [150, 20],
    [196, 30],
    [144, 52],
  ]
    .map(([cx, cy], i) => `<path class="td-spark" style="animation-delay:${i * 0.5}s" d="M${cx} ${cy - 3.4}l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1Z"/>`)
    .join("");
  let body;
  if (shopping) {
    const colors = ["#e5484d", "#f5b400", "#43a047", "#2f80ed", "#d4537e", "#1d9e75"];
    const shelves = [0, 1, 2]
      .map(
        (r) =>
          `${Array.from({ length: 14 }, (_, i) => `<rect class="td-product" x="${44 + i * 11}" y="${4 + r * 20}" width="8" height="10" rx="1.2" fill="${colors[(i + r) % 6]}"/>`).join("")}<rect class="td-shelf" x="40" y="${14 + r * 20}" width="160" height="2.4"/>`,
      )
      .join("");
    const load = state === "done" ? '<rect x="-1" y="-24" width="7" height="8" rx="1" fill="#43a047"/><rect x="7" y="-26" width="6" height="10" rx="1" fill="#2f80ed"/><rect x="14" y="-23" width="7" height="7" rx="1" fill="#e5484d"/>' : "";
    const trolley = `<g class="td-trolley"><g transform="translate(52 78)">${load}<path class="td-cart" d="M-8 -22H-4L0 -6H22L25 -18H-2"/><circle class="td-wheel" cx="2" cy="-2" r="2"/><circle class="td-wheel" cx="19" cy="-2" r="2"/></g></g>`;
    const tag = state === "overdue" ? '<g class="td-alert"><circle cx="194" cy="46" r="4.6"/><path d="M194 43.4v3M194 48.6v.1"/></g>' : "";
    body = `<g mask="url(#td-mask-${uid})">${shelves}</g>${trolley}${placedArt(true, state, 164, 44, 34, 36)}${tag}${state === "done" ? sparks : ""}`;
  } else {
    const doors = [4, 44, 84].map((x, i) => `<rect class="td-door" x="${x}" y="58" width="${i === 2 ? 34 : 36}" height="20" rx="1.5"/>`).join("");
    const note = state === "overdue" ? '<g class="td-note"><rect x="174" y="12" width="13" height="12" rx="1"/><path d="M180.5 14.6v4.2M180.5 21.2v.1"/></g>' : "";
    const magnet = state === "done" ? '<g class="td-magnet"><circle cx="180" cy="18" r="5"/><path d="M177.6 18.2l1.7 1.7 3.2-3.6"/></g>' : '<circle cx="180" cy="18" r="2.4" fill="#f5b400"/>';
    body = `<g mask="url(#td-mask-${uid})"><rect class="td-counter" x="0" y="54" width="122" height="2"/><rect class="td-cabinet" x="0" y="56" width="120" height="24"/>${doors}</g>
      <g class="td-fridge"><rect class="td-fridge-body" x="150" y="6" width="44" height="74" rx="4"/><line class="td-fridge-line" x1="150" y1="32" x2="194" y2="32"/><rect class="td-handle" x="188" y="14" width="2" height="12" rx="1"/><rect class="td-handle" x="188" y="38" width="2" height="16" rx="1"/><circle cx="160" cy="14" r="2.4" fill="#e5484d"/>${magnet}${note}</g>
      ${placedArt(false, state, 154, 36, 28, 33)}${state === "done" ? sparks : ""}`;
  }
  return `<div class="td-ground" aria-hidden="true"></div><svg class="td-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">${fade}${body}</svg>`;
};

// The banner: a kitchen or a supermarket wall, the title on its left, the picture on its right, day and night.
export const BANNER_STYLE = `
  .td-banner { position: relative; overflow: hidden; height: 90px; --td-wall: #eef3f4; background: var(--td-wall); color: #10283f; }
  .td-banner.td-shop { --td-wall: #f4f1ec; }
  .td-banner.night { --td-wall: #283040; color: #fff; }
  .td-banner.night.td-shop { --td-wall: #262c3a; }
  .td-scene { position: absolute; right: 0; bottom: 10px; width: min(200px, 58%); height: 80px; overflow: visible; }
  .td-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px;
               background: repeating-linear-gradient(90deg, #d9dfe3 0 18px, #c6cdd2 18px 19px); box-shadow: inset 0 2px 0 #b8c0c6; }
  .night .td-ground { background: repeating-linear-gradient(90deg, #3a4250 0 18px, #2e3542 18px 19px); box-shadow: inset 0 2px 0 #4a5262; }
  .td-htext { position: absolute; left: 12px; top: 6px; bottom: 16px; right: calc(min(200px, 58%) - 36px); display: flex; align-items: center; gap: 10px; min-width: 0; }
  .td-htext .titles { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .td-htext .name { font-weight: 600; }
  .td-htext .sub { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 12.5px; color: #3d5670; }
  .night .td-htext .sub { color: rgba(255,255,255,.8); }
  .td-htext .sub > .txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .td-htext .titles { flex: 1 1 0; min-width: 0; align-self: stretch; display: flex; flex-direction: column; justify-content: center; }
  .tstack { display: flex; flex-direction: column; gap: 1px; align-items: flex-start; min-width: 0; width: 100%; }
  .tstack > * { max-width: 100%; }
  /* The status pill on the banner: the status colour on frosted glass. */
  .td-banner .chip { display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto; margin: 0; max-width: 51%; padding: 1px 8px; border-radius: 12px;
                  font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; overflow: hidden; box-sizing: border-box;
                  background: color-mix(in srgb, var(--c, var(--td-accent)) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c, var(--td-accent)) 45%, #0d2a45); }
  .td-banner.night .chip { background: color-mix(in srgb, var(--c, var(--td-accent)) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c, var(--td-accent)) 35%, #ffffff); }
  .td-banner .chip .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: var(--c, var(--td-accent)); }
  .td-banner .chip .chip-text { display: inline; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  @container td-card (max-width: 200px) { .td-banner ~ .content .line.pill-echo { display: flex; } }
  .td-banner:has(.titles.dotonly) ~ .content .line.pill-echo { display: flex; }
  /* The round icon on a frosted badge; its colour is the list's state (accent: to do, green: all done, red: late, grey: loading). */
  .td-banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px rgba(47,125,225,.18); }
  .td-banner .type-icon .icon { fill: color-mix(in srgb, var(--c) 82%, #10283f); }
  .td-banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .td-banner.night .type-icon .icon { fill: color-mix(in srgb, var(--c) 72%, #fff); }
  /* The mini card's detail button: a frosted round button in the banner's top-right corner. */
  .td-banner .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; cursor: pointer; width: 24px; height: 24px;
                  border-radius: 50%; display: grid; place-items: center; box-sizing: border-box; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
  .td-banner .zoom .icon { width: 16px; height: 16px; }
  .td-banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .td-banner.night .zoom { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .td-banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #ffffff; }
  .td-banner .zoom:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  /* Kitchen. */
  .td-counter { fill: #cfd9de; } .td-cabinet { fill: #fff; } .td-door { fill: #e8eef1; stroke: #cfd9de; stroke-width: .6; }
  .night .td-counter { fill: #3a4456; } .night .td-cabinet { fill: #323b4e; } .night .td-door { fill: #3d475c; stroke: #4a5568; }
  .td-fridge-body { fill: #f6f8fa; stroke: #c9d2da; } .td-fridge-line { stroke: #c9d2da; } .td-handle { fill: #9aa3ae; }
  .night .td-fridge-body { fill: #3d475c; stroke: #55617a; } .night .td-fridge-line { stroke: #55617a; }
  .td-note rect { fill: #ff8a80; } .td-note path { stroke: #b71c1c; stroke-width: 1.8; stroke-linecap: round; }
  .td-note { transform-box: fill-box; transform-origin: 50% 0; animation: td-swing 1.6s ease-in-out infinite alternate; }
  .td-magnet circle { fill: #43a047; } .td-magnet path { fill: none; stroke: #fff; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
  .td-magnet { transform-box: fill-box; transform-origin: center; animation: td-pop .6s ease-out both; }
  /* Supermarket. */
  .td-shelf { fill: #b9a68a; } .night .td-shelf { fill: #4a5568; }
  .td-product { opacity: .9; } .night .td-product { opacity: .6; }
  .td-cart { fill: none; stroke: #5f6b7a; stroke-width: 1.4; stroke-linejoin: round; } .td-wheel { fill: #5f6b7a; }
  .night .td-cart { stroke: #9aa3ae; } .night .td-wheel { fill: #9aa3ae; }
  .td-pending .td-trolley { animation: td-roll 3s ease-in-out infinite alternate; }
  .td-done .td-trolley { transform: translateX(62px); }
  .td-alert circle { fill: #e53935; } .td-alert path { stroke: #fff; stroke-width: 1.6; stroke-linecap: round; }
  .td-alert { animation: td-blink 1.2s steps(2) infinite; }
  /* The card's list, in fixed colours on the scene. */
  .td-list .art-paper { fill: #eaf3fd; } .td-list .art-box { fill: #fff; } .td-list .art-line { fill: #a9cdf0; }
  .night .td-list .art-paper { fill: #2c3a52; } .night .td-list .art-box { fill: #1f2838; } .night .td-list .art-line { fill: #4f6f96; }
  .td-list .art-box.on { fill: #43a047; } .td-list .art-box.late { fill: #e53935; }
  .td-pending .art-pen { transform-box: fill-box; transform-origin: 0 100%; animation: td-write 1.4s ease-in-out infinite; }
  .td-spark { fill: #ffc940; opacity: 0; animation: td-twinkle 1.8s ease-in-out infinite; }
  @keyframes td-roll { from { transform: translateX(0); } to { transform: translateX(64px); } }
  @keyframes td-write { 0%, 100% { transform: translate(0, 0) rotate(0); } 25% { transform: translate(-3px, 2px) rotate(-4deg); } 50% { transform: translate(-6px, 0) rotate(0); } 75% { transform: translate(-3px, 2px) rotate(-4deg); } }
  @keyframes td-swing { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
  @keyframes td-pop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
  @keyframes td-blink { 50% { opacity: .25; } }
  @keyframes td-twinkle { 0%, 100% { opacity: 0; transform: scale(.6); } 50% { opacity: 1; transform: scale(1); } }
  .td-spark { transform-box: fill-box; transform-origin: center; }
  /* The mini card: the picture steps aside for the detail button in the top-right corner (5 + 24 px), its top shelf
     ending 7 px left of it, at full size. */
  @container td-card (min-width: 301px) {
    .td-banner:has(> .zoom) .td-scene { right: 36px; }
    .td-banner:has(> .zoom) .td-htext { right: calc(min(200px, 58%)); }
  }
  /* A narrow card: no room for the picture beside the text, the wall and the floor stay. */
  @container td-card (max-width: 300px) { .td-scene { display: none; } .td-htext { right: 36px; } }
`;

// The tick drawn in a checkbox.
export const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

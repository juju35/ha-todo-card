# Changelog

## 1.3.1 - 2026-11-20

### Fixes
- The page no longer jumps by itself: a change of the list (an item added, ticked or renamed, its entity updated) rebuilt the card's whole shadow DOM (168 nodes replaced on the full card, 107 on the mini card); the markup is now patched in place (0 replaced), so nothing shows anew for a frame and the focus, hover and animations are kept.

### Performance
- Dead code removed: the per-second countdown machinery (and its `left` string) and the unused `today_at` / `tomorrow_at` / `yesterday_at` strings, left over from the card template — every update no longer searches the card for countdowns, and the bundle and language files are smaller.

## 1.3.0 - 2026-11-19

### Features
- Optional sidebar panel (`todo-panel`, declared with `panel_custom`, loaded from the same file): Home Assistant's To-do page in the look of the other panels. The cards' illustrated banner across the top (kitchen or supermarket, night with a dark theme) with the list's status pill and round buttons (information, create a list, delete a Local To-do list — administrators only), one text tab per list under it (the list in the address, `?entity_id=`), summary tiles (to do, overdue, due today, completed), the add field and the order chips (remembered in the browser), the items to do — tick, edit (name, description on several lines, due date, delete), reorder by dragging the handle or with the arrow keys — and the completed items with a delete button each and *Clear completed*. Options: `entities`, `entity`, `sort`, `hide_header` (`true` or `non_admin`: the tabs stay, with the menu and the buttons), `illustration_theme`, `language`.

## 1.2.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.2.0 - 2026-11-17

### Features
- Illustrated, animated header (90 px) on the full and the mini card: the title on the left, a scene on the right over a 10 px tiled floor strip. A to-do list is stuck on a kitchen fridge (the pencil writes while items are left, a red note swings on the freezer when something is overdue, a green tick magnet and sparkles once all is done); a shopping list is at the end of a supermarket aisle with a trolley rolling along the shelves (parked and full once all is bought).
- The header icon's colour follows the list's state: accent with items to do, red when something is overdue, green once all is done, grey while loading.
- Night version after sunset (`sun.sun`) or with the dark theme; new options `illustration` (`false`: the classic header) and `illustration_theme` (`auto`, `day`, `night`), in the visual editors of both cards.
- The status pill, in the icon's colour, is placed by measurement in every header (illustrated or classic, full and mini card) and every language: on the title row right after the title only when the whole title and its whole label fit there, otherwise on its own line under the subtitle (cut to one line); only its dot when the banner has no room left above its ground strip, and on a card of 200 px or less. The mini card's detail button sits in the banner's top-right corner, in the frosted style of the other cards, the picture stepping aside for it.
- On a wide mini card, the scene steps a little further left: its top shelf no longer touches the corner expand / collapse button.
- Night picture with the dark theme even while the sun is up (a day picture would glare on a dark dashboard); `illustration_theme: day | night` still forces one.

### Fixes
- The body no longer repeats the header pill: the pill says how the list stands ("2 overdue", "1 due today", "Up to date", "All done") and the hero keeps the count still to do; a hero line saying word for word what the pill says comes back only when the pill keeps just its dot. The mini card gives the count at the head of its items line. On a narrow card the add field's placeholder ends in an ellipsis instead of a cut letter.

## 1.1.0 - 2026-11-16

### Features
- New look, shared with the other cards: a summary at the top beside an illustration (a clipboard, with a cart for a shopping list) with how many items are left to do and what is overdue, due today and done; due dates under each item in red or orange; a short detail (a quantity) as a pill on the right; a rounded field to add items.
- Mini card: the illustration, what is overdue and due today, the next items and the add button.
- New option `show_hero` to hide the summary.
- Due dates set, changed and cleared from the card, for the lists that take one: a date (or date and time) field in the edit popup and in the add popup, opened by a calendar button beside the add field.

### Fixes
- Lists that can't update items (a Picnic cart): the checkboxes are greyed out and nothing calls a service the list refuses.
- Items without an id are ticked, edited and deleted by their name.
- Shopping lists of AnyList (custom `anylist`) and KitchenOwl get the cart icon and illustration; Alexa and Grocy lists only when their name says they are shopping lists.
- The summary lines put the status first ("Overdue: …", "Due today: …"), so it stays visible when the item's name is cut.
- Mini card: items without an id show in the line of the next items.
- An empty list says "Nothing to do" once; while the items load, no count is shown.
- Dark theme: the date picker's icon follows the dashboard theme and stays visible.
- The add dialog opens empty.

## 1.0.0 - 2026-11-16

First release.

### Features
- **To-do Card** (`custom:todo-card`): tabs between to-do lists, items ticked off with a tap, a field to add items, due dates (overdue, today, later), details, editing (rename, details, delete) in a popup, and the completed items folded away with *Clear completed*.
- **To-do Mini Card** (`custom:todo-mini-card`): compact view with the first items to tick off and a button to add one; the detail button switches to the full card.
- Every to-do integration (Local To-do, Shopping list, Bring!, Todoist, Google Tasks, CalDAV, Mealie, OurGroceries, AnyList, Picnic, Cookidoo, Habitica, Remember The Milk, iCloud, Alexa…), items read live through Home Assistant's to-do subscription; only the buttons a list supports.
- Animation of an item ticked off (box filling, tick drawing, line striking it).
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.

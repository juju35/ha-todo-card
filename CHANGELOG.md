# Changelog

## 1.2.0 - 2026-11-17

### Features
- Illustrated, animated header (90 px) on the full and the mini card: the title on the left, a scene on the right over a 10 px tiled floor strip. A to-do list is stuck on a kitchen fridge (the pencil writes while items are left, a red note swings on the freezer when something is overdue, a green tick magnet and sparkles once all is done); a shopping list is at the end of a supermarket aisle with a trolley rolling along the shelves (parked and full once all is bought).
- The header icon's colour follows the list's state: accent with items to do, red when something is overdue, green once all is done, grey while loading.
- Night version after sunset (`sun.sun`, else the dark theme); new options `illustration` (`false`: the classic header) and `illustration_theme` (`auto`, `day`, `night`), in the visual editors of both cards.

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

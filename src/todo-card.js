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

const VERSION = "__VERSION__";

const CARD_ICONS = {
  list: "M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z",
  cart: "M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z",
  calendar: "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",
  delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
  sweep: "M18,4H15L14,3H10L9,4H6V6H18M7,19A2,2 0 0,0 9,21H15A2,2 0 0,0 17,19V7H7V19M9.5,11.5L11,13L14.5,9.5L15.5,10.5L11,15L8.5,12.5L9.5,11.5Z",
  done_all: "M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z",
};

// Supported features of a to-do list entity (TodoListEntityFeature).
const FEATURE = { create: 1, delete: 2, update: 4, move: 8, due_date: 16, due_datetime: 32, description: 64 };
// Lists that are shopping lists: a cart for an icon.
const SHOPPING = new Set(["shopping_list", "bring", "ourgroceries", "any_list", "anylist", "picnic", "cookidoo", "mealie", "kitchenowl"]);
// Alexa and Grocy also have task lists: a shopping list only when its name says so.
const MAYBE_SHOPPING = new Set(["alexa_devices", "grocy"]);
const SHOPPING_NAME = /shop|course|einkauf|compra|spesa|boodschap|zakup|grocer|market/i;
const isShopping = (list) => SHOPPING.has(list?.platform) || (MAYBE_SHOPPING.has(list?.platform) && SHOPPING_NAME.test(list?.name || ""));
// How long a ticked item shows its tick before it moves (or until the list reports it done).
const TICK_MS = 1200;

const STRINGS = {
  en: {
    lists: "Lists",
    todo_n: "{n} to do",
    overdue_n: "{n} overdue",
    up_to_date: "Up to date",
    all_done: "All done",
    mark_done: "Mark {item} as done",
    mark_todo: "Mark {item} as to do",
    edit_item: "Edit {item}",
    more_n: "+ {n} more",
    add_placeholder: "Add to {list}…",
    add: "Add",
    add_to: "Add to {list}",
    loading: "Loading…",
    nothing_to_do: "Nothing to do",
    completed: "Completed",
    clear_completed: "Clear completed",
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    name: "Name",
    details: "Details",
    delete: "Delete",
    save: "Save",
    no_data: "No to-do list found: add a to-do integration (Local To-do, Shopping list, Bring!, Todoist…).",
    entities: "Lists (empty: every to-do list)",
    entity: "List shown first",
    sort: "Order",
    sort_manual: "As in the list",
    sort_due: "By due date",
    sort_alpha: "Alphabetical",
    max_items: "Items shown (0: all)",
    show_tabs: "Show the tabs between lists",
    show_add: "Show the field to add items",
    show_completed: "Show the completed items",
    to_do: "to do",
    overdue_item: "Overdue: {item}",
    due_today_n: "{n} due today",
    due_today_item: "Due today: {item}",
    done_n: "{n} done",
    show_hero: "Show the summary with the illustration",
    illustration: "Animated illustration",
    illustration_theme: "Illustration theme",
    theme_auto: "Automatic: night with a dark theme, day with a light theme",
    theme_day: "Day",
    theme_night: "Night",
    due: "Due date",
    add_with_due: "Add with a due date",
    read_only: "This list can't be changed from Home Assistant",
    cancel: "Cancel",
    zoom_in: "Show details",
    zoom_out: "Show less",
    title: "Title (optional)",
    language: "Language",
    lang_auto: "Automatic",
    collapsed: "Sections folded by default",
    zoom: "Detail button",
    zoom_helper: "Switches the mini card to the full card's content",
    show_title: "Show title",
    show_subtitle: "Show subtitle",
    no_registry: "This card needs Home Assistant 2024.8 or later.",
    unavailable: "Unavailable",
    panel_title: "To-do lists",
    information: "Information",
    create_list: "Create list",
    delete_list: "Delete list",
    delete_list_text: "The list {list} and all its items will be deleted.",
    move_item: "Move {item} (drag, or the arrow keys)",
    remove_item: "Delete {item}",
    to_do_title: "To do",
    overdue: "Overdue",
    due_today: "Due today",
    none_completed: "No completed item",
    none: "None",
    action_failed: "Action failed:",
  },
  fr: {
    lists: "Listes",
    todo_n: "{n} à faire",
    overdue_n: "{n} en retard",
    up_to_date: "À jour",
    all_done: "Tout est fait",
    mark_done: "Marquer {item} comme fait",
    mark_todo: "Marquer {item} comme à faire",
    edit_item: "Modifier {item}",
    more_n: "+ {n} autres",
    add_placeholder: "Ajouter à {list}…",
    add: "Ajouter",
    add_to: "Ajouter à {list}",
    loading: "Chargement…",
    nothing_to_do: "Rien à faire",
    completed: "Terminés",
    clear_completed: "Effacer les terminés",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    yesterday: "Hier",
    name: "Nom",
    details: "Détails",
    delete: "Supprimer",
    save: "Enregistrer",
    no_data: "Aucune liste trouvée : ajoutez une intégration de listes (Local To-do, Liste de courses, Bring!, Todoist…).",
    entities: "Listes (vide : toutes les listes)",
    entity: "Liste affichée en premier",
    sort: "Ordre",
    sort_manual: "Comme dans la liste",
    sort_due: "Par échéance",
    sort_alpha: "Alphabétique",
    max_items: "Éléments affichés (0 : tous)",
    show_tabs: "Afficher les onglets des listes",
    show_add: "Afficher le champ d'ajout",
    show_completed: "Afficher les éléments terminés",
    to_do: "à faire",
    overdue_item: "En retard : {item}",
    due_today_n: "{n} pour aujourd'hui",
    due_today_item: "Pour aujourd'hui : {item}",
    done_n: "{n} faits",
    show_hero: "Afficher le résumé illustré",
    illustration: "Illustration animée",
    illustration_theme: "Thème de l’illustration",
    theme_auto: "Automatique : nuit avec un thème sombre, jour avec un thème clair",
    theme_day: "Jour",
    theme_night: "Nuit",
    due: "Échéance",
    add_with_due: "Ajouter avec une échéance",
    read_only: "Cette liste ne peut pas être modifiée depuis Home Assistant",
    cancel: "Annuler",
    zoom_in: "Afficher les détails",
    zoom_out: "Réduire",
    title: "Titre (facultatif)",
    language: "Langue",
    lang_auto: "Automatique",
    collapsed: "Sections repliées par défaut",
    zoom: "Bouton détail",
    zoom_helper: "Bascule la mini-carte vers le contenu de la carte complète",
    show_title: "Afficher le titre",
    show_subtitle: "Afficher le sous-titre",
    no_registry: "Cette carte nécessite Home Assistant 2024.8 ou plus récent.",
    unavailable: "Indisponible",
    panel_title: "Listes de tâches",
    information: "Informations",
    create_list: "Créer une liste",
    delete_list: "Supprimer la liste",
    delete_list_text: "La liste {list} et tous ses éléments seront supprimés.",
    move_item: "Déplacer {item} (glisser, ou flèches du clavier)",
    remove_item: "Supprimer {item}",
    to_do_title: "À faire",
    overdue: "En retard",
    due_today: "Pour aujourd'hui",
    none_completed: "Aucun élément terminé",
    none: "Aucun",
    action_failed: "Échec de l'action :",
  },
  de: {
    lists: "Listen",
    todo_n: "{n} offen",
    overdue_n: "{n} überfällig",
    up_to_date: "Auf dem neuesten Stand",
    all_done: "Alles erledigt",
    mark_done: "{item} als erledigt markieren",
    mark_todo: "{item} als offen markieren",
    edit_item: "{item} bearbeiten",
    more_n: "+ {n} weitere",
    add_placeholder: "Zu {list} hinzufügen…",
    add: "Hinzufügen",
    add_to: "Zu {list} hinzufügen",
    loading: "Wird geladen…",
    nothing_to_do: "Nichts zu tun",
    completed: "Erledigt",
    clear_completed: "Erledigte löschen",
    today: "Heute",
    tomorrow: "Morgen",
    yesterday: "Gestern",
    name: "Name",
    details: "Details",
    delete: "Löschen",
    save: "Speichern",
    no_data: "Keine Liste gefunden: eine To-do-Integration hinzufügen (Lokale To-do-Liste, Einkaufsliste, Bring!, Todoist…).",
    entities: "Listen (leer: alle To-do-Listen)",
    entity: "Zuerst angezeigte Liste",
    sort: "Reihenfolge",
    sort_manual: "Wie in der Liste",
    sort_due: "Nach Fälligkeit",
    sort_alpha: "Alphabetisch",
    max_items: "Angezeigte Einträge (0: alle)",
    show_tabs: "Reiter zwischen den Listen anzeigen",
    show_add: "Feld zum Hinzufügen anzeigen",
    show_completed: "Erledigte Einträge anzeigen",
    to_do: "offen",
    overdue_item: "Überfällig: {item}",
    due_today_n: "{n} heute fällig",
    due_today_item: "Heute fällig: {item}",
    done_n: "{n} erledigt",
    show_hero: "Zusammenfassung mit Illustration anzeigen",
    illustration: "Animierte Illustration",
    illustration_theme: "Thema der Illustration",
    theme_auto: "Automatisch: Nacht bei dunklem Thema, Tag bei hellem Thema",
    theme_day: "Tag",
    theme_night: "Nacht",
    due: "Fälligkeit",
    add_with_due: "Mit Fälligkeit hinzufügen",
    read_only: "Diese Liste kann in Home Assistant nicht geändert werden",
    cancel: "Abbrechen",
    zoom_in: "Details anzeigen",
    zoom_out: "Weniger anzeigen",
    title: "Titel (optional)",
    language: "Sprache",
    lang_auto: "Automatisch",
    collapsed: "Standardmäßig eingeklappte Bereiche",
    zoom: "Detail-Schaltfläche",
    zoom_helper: "Schaltet die Mini-Karte auf den Inhalt der vollen Karte um",
    show_title: "Titel anzeigen",
    show_subtitle: "Untertitel anzeigen",
    no_registry: "Diese Karte benötigt Home Assistant 2024.8 oder neuer.",
    unavailable: "Nicht verfügbar",
    panel_title: "To-do-Listen",
    information: "Informationen",
    create_list: "Liste erstellen",
    delete_list: "Liste löschen",
    delete_list_text: "Die Liste {list} und alle ihre Einträge werden gelöscht.",
    move_item: "{item} verschieben (ziehen oder Pfeiltasten)",
    remove_item: "{item} löschen",
    to_do_title: "Zu erledigen",
    overdue: "Überfällig",
    due_today: "Heute fällig",
    none_completed: "Kein erledigter Eintrag",
    none: "Keine",
    action_failed: "Aktion fehlgeschlagen:",
  },
  es: {
    lists: "Listas",
    todo_n: "{n} pendientes",
    overdue_n: "{n} con retraso",
    up_to_date: "Al día",
    all_done: "Todo hecho",
    mark_done: "Marcar {item} como hecho",
    mark_todo: "Marcar {item} como pendiente",
    edit_item: "Editar {item}",
    more_n: "+ {n} más",
    add_placeholder: "Añadir a {list}…",
    add: "Añadir",
    add_to: "Añadir a {list}",
    loading: "Cargando…",
    nothing_to_do: "Nada pendiente",
    completed: "Completados",
    clear_completed: "Borrar completados",
    today: "Hoy",
    tomorrow: "Mañana",
    yesterday: "Ayer",
    name: "Nombre",
    details: "Detalles",
    delete: "Eliminar",
    save: "Guardar",
    no_data: "No se encontró ninguna lista: añada una integración de tareas (Local To-do, Lista de la compra, Bring!, Todoist…).",
    entities: "Listas (vacío: todas las listas)",
    entity: "Lista mostrada primero",
    sort: "Orden",
    sort_manual: "Como en la lista",
    sort_due: "Por fecha límite",
    sort_alpha: "Alfabético",
    max_items: "Elementos mostrados (0: todos)",
    show_tabs: "Mostrar las pestañas de las listas",
    show_add: "Mostrar el campo para añadir",
    show_completed: "Mostrar los completados",
    to_do: "pendientes",
    overdue_item: "Con retraso: {item}",
    due_today_n: "{n} para hoy",
    due_today_item: "Para hoy: {item}",
    done_n: "{n} hechos",
    show_hero: "Mostrar el resumen ilustrado",
    illustration: "Ilustración animada",
    illustration_theme: "Tema de la ilustración",
    theme_auto: "Automático: noche con un tema oscuro, día con un tema claro",
    theme_day: "Día",
    theme_night: "Noche",
    due: "Fecha límite",
    add_with_due: "Añadir con fecha límite",
    read_only: "Esta lista no se puede modificar desde Home Assistant",
    cancel: "Cancelar",
    zoom_in: "Ver detalles",
    zoom_out: "Ver menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secciones plegadas por defecto",
    zoom: "Botón de detalle",
    zoom_helper: "Cambia la minitarjeta al contenido de la tarjeta completa",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Esta tarjeta necesita Home Assistant 2024.8 o posterior.",
    unavailable: "No disponible",
    panel_title: "Listas de tareas",
    information: "Información",
    create_list: "Crear lista",
    delete_list: "Eliminar lista",
    delete_list_text: "Se eliminarán la lista {list} y todos sus elementos.",
    move_item: "Mover {item} (arrastrar o teclas de flecha)",
    remove_item: "Eliminar {item}",
    to_do_title: "Por hacer",
    overdue: "Atrasadas",
    due_today: "Para hoy",
    none_completed: "Ningún elemento completado",
    none: "Ninguna",
    action_failed: "Error en la acción:",
  },
  it: {
    lists: "Elenchi",
    todo_n: "{n} da fare",
    overdue_n: "{n} in ritardo",
    up_to_date: "In pari",
    all_done: "Tutto fatto",
    mark_done: "Segna {item} come fatto",
    mark_todo: "Segna {item} come da fare",
    edit_item: "Modifica {item}",
    more_n: "+ altri {n}",
    add_placeholder: "Aggiungi a {list}…",
    add: "Aggiungi",
    add_to: "Aggiungi a {list}",
    loading: "Caricamento…",
    nothing_to_do: "Niente da fare",
    completed: "Completati",
    clear_completed: "Cancella i completati",
    today: "Oggi",
    tomorrow: "Domani",
    yesterday: "Ieri",
    name: "Nome",
    details: "Dettagli",
    delete: "Elimina",
    save: "Salva",
    no_data: "Nessun elenco trovato: aggiungi un'integrazione di elenchi (Local To-do, Lista della spesa, Bring!, Todoist…).",
    entities: "Elenchi (vuoto: tutti gli elenchi)",
    entity: "Elenco mostrato per primo",
    sort: "Ordine",
    sort_manual: "Come nell'elenco",
    sort_due: "Per scadenza",
    sort_alpha: "Alfabetico",
    max_items: "Elementi mostrati (0: tutti)",
    show_tabs: "Mostra le schede degli elenchi",
    show_add: "Mostra il campo per aggiungere",
    show_completed: "Mostra gli elementi completati",
    to_do: "da fare",
    overdue_item: "In ritardo: {item}",
    due_today_n: "{n} in scadenza oggi",
    due_today_item: "In scadenza oggi: {item}",
    done_n: "{n} fatti",
    show_hero: "Mostra il riepilogo illustrato",
    illustration: "Illustrazione animata",
    illustration_theme: "Tema dell’illustrazione",
    theme_auto: "Automatico: notte con un tema scuro, giorno con un tema chiaro",
    theme_day: "Giorno",
    theme_night: "Notte",
    due: "Scadenza",
    add_with_due: "Aggiungi con scadenza",
    read_only: "Questo elenco non può essere modificato da Home Assistant",
    cancel: "Annulla",
    zoom_in: "Mostra dettagli",
    zoom_out: "Mostra meno",
    title: "Titolo (facoltativo)",
    language: "Lingua",
    lang_auto: "Automatica",
    collapsed: "Sezioni chiuse per impostazione predefinita",
    zoom: "Pulsante dettagli",
    zoom_helper: "Passa la mini scheda al contenuto della scheda completa",
    show_title: "Mostra titolo",
    show_subtitle: "Mostra sottotitolo",
    no_registry: "Questa scheda richiede Home Assistant 2024.8 o successivo.",
    unavailable: "Non disponibile",
    panel_title: "Liste di cose da fare",
    information: "Informazioni",
    create_list: "Crea lista",
    delete_list: "Elimina lista",
    delete_list_text: "La lista {list} e tutti i suoi elementi saranno eliminati.",
    move_item: "Sposta {item} (trascina o tasti freccia)",
    remove_item: "Elimina {item}",
    to_do_title: "Da fare",
    overdue: "In ritardo",
    due_today: "In scadenza oggi",
    none_completed: "Nessun elemento completato",
    none: "Nessuna",
    action_failed: "Azione non riuscita:",
  },
  nl: {
    lists: "Lijsten",
    todo_n: "{n} te doen",
    overdue_n: "{n} te laat",
    up_to_date: "Op schema",
    all_done: "Alles gedaan",
    mark_done: "{item} als gedaan markeren",
    mark_todo: "{item} als te doen markeren",
    edit_item: "{item} bewerken",
    more_n: "+ {n} meer",
    add_placeholder: "Toevoegen aan {list}…",
    add: "Toevoegen",
    add_to: "Toevoegen aan {list}",
    loading: "Laden…",
    nothing_to_do: "Niets te doen",
    completed: "Voltooid",
    clear_completed: "Voltooide wissen",
    today: "Vandaag",
    tomorrow: "Morgen",
    yesterday: "Gisteren",
    name: "Naam",
    details: "Details",
    delete: "Verwijderen",
    save: "Opslaan",
    no_data: "Geen lijst gevonden: voeg een takenintegratie toe (Local To-do, Boodschappenlijst, Bring!, Todoist…).",
    entities: "Lijsten (leeg: alle takenlijsten)",
    entity: "Eerst getoonde lijst",
    sort: "Volgorde",
    sort_manual: "Zoals in de lijst",
    sort_due: "Op vervaldatum",
    sort_alpha: "Alfabetisch",
    max_items: "Getoonde items (0: alle)",
    show_tabs: "Tabbladen tussen lijsten tonen",
    show_add: "Veld om toe te voegen tonen",
    show_completed: "Voltooide items tonen",
    to_do: "te doen",
    overdue_item: "Te laat: {item}",
    due_today_n: "{n} vandaag",
    due_today_item: "Vandaag: {item}",
    done_n: "{n} gedaan",
    show_hero: "Samenvatting met illustratie tonen",
    illustration: "Geanimeerde illustratie",
    illustration_theme: "Thema van de illustratie",
    theme_auto: "Automatisch: nacht met een donker thema, dag met een licht thema",
    theme_day: "Dag",
    theme_night: "Nacht",
    due: "Vervaldatum",
    add_with_due: "Toevoegen met vervaldatum",
    read_only: "Deze lijst kan niet vanuit Home Assistant worden gewijzigd",
    cancel: "Annuleren",
    zoom_in: "Details tonen",
    zoom_out: "Minder tonen",
    title: "Titel (optioneel)",
    language: "Taal",
    lang_auto: "Automatisch",
    collapsed: "Standaard ingeklapte secties",
    zoom: "Detailknop",
    zoom_helper: "Schakelt de minikaart naar de inhoud van de volledige kaart",
    show_title: "Titel tonen",
    show_subtitle: "Ondertitel tonen",
    no_registry: "Deze kaart vereist Home Assistant 2024.8 of nieuwer.",
    unavailable: "Niet beschikbaar",
    panel_title: "Takenlijsten",
    information: "Informatie",
    create_list: "Lijst maken",
    delete_list: "Lijst verwijderen",
    delete_list_text: "De lijst {list} en al haar items worden verwijderd.",
    move_item: "{item} verplaatsen (slepen of pijltjestoetsen)",
    remove_item: "{item} verwijderen",
    to_do_title: "Te doen",
    overdue: "Te laat",
    due_today: "Vandaag",
    none_completed: "Geen voltooid item",
    none: "Geen",
    action_failed: "Actie mislukt:",
  },
  pt: {
    lists: "Listas",
    todo_n: "{n} por fazer",
    overdue_n: "{n} em atraso",
    up_to_date: "Em dia",
    all_done: "Tudo feito",
    mark_done: "Marcar {item} como feito",
    mark_todo: "Marcar {item} como por fazer",
    edit_item: "Editar {item}",
    more_n: "+ {n} mais",
    add_placeholder: "Adicionar a {list}…",
    add: "Adicionar",
    add_to: "Adicionar a {list}",
    loading: "A carregar…",
    nothing_to_do: "Nada por fazer",
    completed: "Concluídos",
    clear_completed: "Limpar concluídos",
    today: "Hoje",
    tomorrow: "Amanhã",
    yesterday: "Ontem",
    name: "Nome",
    details: "Detalhes",
    delete: "Eliminar",
    save: "Guardar",
    no_data: "Nenhuma lista encontrada: adicione uma integração de tarefas (Local To-do, Lista de compras, Bring!, Todoist…).",
    entities: "Listas (vazio: todas as listas)",
    entity: "Lista mostrada primeiro",
    sort: "Ordem",
    sort_manual: "Como na lista",
    sort_due: "Por data limite",
    sort_alpha: "Alfabética",
    max_items: "Itens mostrados (0: todos)",
    show_tabs: "Mostrar os separadores das listas",
    show_add: "Mostrar o campo para adicionar",
    show_completed: "Mostrar os concluídos",
    to_do: "por fazer",
    overdue_item: "Em atraso: {item}",
    due_today_n: "{n} para hoje",
    due_today_item: "Para hoje: {item}",
    done_n: "{n} feitos",
    show_hero: "Mostrar o resumo ilustrado",
    illustration: "Ilustração animada",
    illustration_theme: "Tema da ilustração",
    theme_auto: "Automático: noite com um tema escuro, dia com um tema claro",
    theme_day: "Dia",
    theme_night: "Noite",
    due: "Data limite",
    add_with_due: "Adicionar com data limite",
    read_only: "Esta lista não pode ser alterada a partir do Home Assistant",
    cancel: "Cancelar",
    zoom_in: "Mostrar detalhes",
    zoom_out: "Mostrar menos",
    title: "Título (opcional)",
    language: "Idioma",
    lang_auto: "Automático",
    collapsed: "Secções recolhidas por predefinição",
    zoom: "Botão de detalhe",
    zoom_helper: "Muda o minicartão para o conteúdo do cartão completo",
    show_title: "Mostrar título",
    show_subtitle: "Mostrar subtítulo",
    no_registry: "Este cartão requer o Home Assistant 2024.8 ou posterior.",
    unavailable: "Indisponível",
    panel_title: "Listas de tarefas",
    information: "Informações",
    create_list: "Criar lista",
    delete_list: "Eliminar lista",
    delete_list_text: "A lista {list} e todos os seus itens serão eliminados.",
    move_item: "Mover {item} (arrastar ou teclas de seta)",
    remove_item: "Eliminar {item}",
    to_do_title: "Por fazer",
    overdue: "Em atraso",
    due_today: "Para hoje",
    none_completed: "Nenhum item concluído",
    none: "Nenhuma",
    action_failed: "A ação falhou:",
  },
  pl: {
    lists: "Listy",
    todo_n: "Do zrobienia: {n}",
    overdue_n: "Zaległe: {n}",
    up_to_date: "Na bieżąco",
    all_done: "Wszystko zrobione",
    mark_done: "Oznacz {item} jako zrobione",
    mark_todo: "Oznacz {item} jako do zrobienia",
    edit_item: "Edytuj {item}",
    more_n: "+ jeszcze {n}",
    add_placeholder: "Dodaj do {list}…",
    add: "Dodaj",
    add_to: "Dodaj do {list}",
    loading: "Wczytywanie…",
    nothing_to_do: "Nic do zrobienia",
    completed: "Zrobione",
    clear_completed: "Usuń zrobione",
    today: "Dziś",
    tomorrow: "Jutro",
    yesterday: "Wczoraj",
    name: "Nazwa",
    details: "Szczegóły",
    delete: "Usuń",
    save: "Zapisz",
    no_data: "Nie znaleziono listy: dodaj integrację list zadań (Local To-do, Lista zakupów, Bring!, Todoist…).",
    entities: "Listy (puste: wszystkie listy)",
    entity: "Lista pokazywana jako pierwsza",
    sort: "Kolejność",
    sort_manual: "Jak na liście",
    sort_due: "Według terminu",
    sort_alpha: "Alfabetycznie",
    max_items: "Wyświetlane pozycje (0: wszystkie)",
    show_tabs: "Pokaż karty list",
    show_add: "Pokaż pole dodawania",
    show_completed: "Pokaż zrobione",
    to_do: "do zrobienia",
    overdue_item: "Po terminie: {item}",
    due_today_n: "Na dziś: {n}",
    due_today_item: "Na dziś: {item}",
    done_n: "Zrobione: {n}",
    show_hero: "Pokaż podsumowanie z ilustracją",
    illustration: "Animowana ilustracja",
    illustration_theme: "Motyw ilustracji",
    theme_auto: "Automatycznie: noc przy ciemnym motywie, dzień przy jasnym motywie",
    theme_day: "Dzień",
    theme_night: "Noc",
    due: "Termin",
    add_with_due: "Dodaj z terminem",
    read_only: "Tej listy nie można zmienić z poziomu Home Assistant",
    cancel: "Anuluj",
    zoom_in: "Pokaż szczegóły",
    zoom_out: "Pokaż mniej",
    title: "Tytuł (opcjonalnie)",
    language: "Język",
    lang_auto: "Automatycznie",
    collapsed: "Sekcje domyślnie zwinięte",
    zoom: "Przycisk szczegółów",
    zoom_helper: "Przełącza minikartę na zawartość pełnej karty",
    show_title: "Pokaż tytuł",
    show_subtitle: "Pokaż podtytuł",
    no_registry: "Ta karta wymaga Home Assistant 2024.8 lub nowszego.",
    unavailable: "Niedostępne",
    panel_title: "Listy zadań",
    information: "Informacje",
    create_list: "Utwórz listę",
    delete_list: "Usuń listę",
    delete_list_text: "Lista {list} i wszystkie jej elementy zostaną usunięte.",
    move_item: "Przenieś {item} (przeciągnij lub klawisze strzałek)",
    remove_item: "Usuń {item}",
    to_do_title: "Do zrobienia",
    overdue: "Zaległe",
    due_today: "Na dziś",
    none_completed: "Brak ukończonych elementów",
    none: "Brak",
    action_failed: "Akcja nie powiodła się:",
  },
  sr: {
    lists: "Листе",
    todo_n: "За урадити: {n}",
    overdue_n: "Касни: {n}",
    up_to_date: "Ажурно",
    all_done: "Све урађено",
    mark_done: "Означи {item} као урађено",
    mark_todo: "Означи {item} као неурађено",
    edit_item: "Измени {item}",
    more_n: "+ још {n}",
    add_placeholder: "Додај у {list}…",
    add: "Додај",
    add_to: "Додај у {list}",
    loading: "Учитавање…",
    nothing_to_do: "Ништа за урадити",
    completed: "Урађено",
    clear_completed: "Обриши урађено",
    today: "Данас",
    tomorrow: "Сутра",
    yesterday: "Јуче",
    name: "Назив",
    details: "Детаљи",
    delete: "Обриши",
    save: "Сачувај",
    no_data: "Није пронађена листа: додајте интеграцију листа (Local To-do, Листа за куповину, Bring!, Todoist…).",
    entities: "Листе (празно: све листе)",
    entity: "Листа приказана прва",
    sort: "Редослед",
    sort_manual: "Као у листи",
    sort_due: "По року",
    sort_alpha: "Абецедно",
    max_items: "Приказане ставке (0: све)",
    show_tabs: "Прикажи картице листа",
    show_add: "Прикажи поље за додавање",
    show_completed: "Прикажи урађене ставке",
    to_do: "за урадити",
    overdue_item: "Касни: {item}",
    due_today_n: "За данас: {n}",
    due_today_item: "За данас: {item}",
    done_n: "Урађено: {n}",
    show_hero: "Прикажи илустровани резиме",
    illustration: "Анимирана илустрација",
    illustration_theme: "Тема илустрације",
    theme_auto: "Аутоматски: ноћ уз тамну тему, дан уз светлу тему",
    theme_day: "Дан",
    theme_night: "Ноћ",
    due: "Рок",
    add_with_due: "Додај са роком",
    read_only: "Ова листа се не може мењати из Home Assistant-а",
    cancel: "Откажи",
    zoom_in: "Прикажи детаље",
    zoom_out: "Прикажи мање",
    title: "Наслов (опционо)",
    language: "Језик",
    lang_auto: "Аутоматски",
    collapsed: "Подразумевано скупљени одељци",
    zoom: "Дугме за детаље",
    zoom_helper: "Пребацује мини картицу на садржај пуне картице",
    show_title: "Прикажи наслов",
    show_subtitle: "Прикажи поднаслов",
    no_registry: "Ова картица захтева Home Assistant 2024.8 или новији.",
    unavailable: "Недоступно",
    panel_title: "Листе задатака",
    information: "Информације",
    create_list: "Направи листу",
    delete_list: "Обриши листу",
    delete_list_text: "Листа {list} и све њене ставке биће обрисане.",
    move_item: "Помери {item} (превуци или тастери са стрелицама)",
    remove_item: "Обриши {item}",
    to_do_title: "За урадити",
    overdue: "Касни",
    due_today: "Рок данас",
    none_completed: "Нема завршених ставки",
    none: "Нема",
    action_failed: "Радња није успела:",
  },
  "sr-Latn": {
    lists: "Liste",
    todo_n: "Za uraditi: {n}",
    overdue_n: "Kasni: {n}",
    up_to_date: "Ažurno",
    all_done: "Sve urađeno",
    mark_done: "Označi {item} kao urađeno",
    mark_todo: "Označi {item} kao neurađeno",
    edit_item: "Izmeni {item}",
    more_n: "+ još {n}",
    add_placeholder: "Dodaj u {list}…",
    add: "Dodaj",
    add_to: "Dodaj u {list}",
    loading: "Učitavanje…",
    nothing_to_do: "Ništa za uraditi",
    completed: "Urađeno",
    clear_completed: "Obriši urađeno",
    today: "Danas",
    tomorrow: "Sutra",
    yesterday: "Juče",
    name: "Naziv",
    details: "Detalji",
    delete: "Obriši",
    save: "Sačuvaj",
    no_data: "Nije pronađena lista: dodajte integraciju lista (Local To-do, Lista za kupovinu, Bring!, Todoist…).",
    entities: "Liste (prazno: sve liste)",
    entity: "Lista prikazana prva",
    sort: "Redosled",
    sort_manual: "Kao u listi",
    sort_due: "Po roku",
    sort_alpha: "Abecedno",
    max_items: "Prikazane stavke (0: sve)",
    show_tabs: "Prikaži kartice lista",
    show_add: "Prikaži polje za dodavanje",
    show_completed: "Prikaži urađene stavke",
    to_do: "za uraditi",
    overdue_item: "Kasni: {item}",
    due_today_n: "Za danas: {n}",
    due_today_item: "Za danas: {item}",
    done_n: "Urađeno: {n}",
    show_hero: "Prikaži ilustrovani rezime",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Automatski: noć uz tamnu temu, dan uz svetlu temu",
    theme_day: "Dan",
    theme_night: "Noć",
    due: "Rok",
    add_with_due: "Dodaj sa rokom",
    read_only: "Ova lista se ne može menjati iz Home Assistant-a",
    cancel: "Otkaži",
    zoom_in: "Prikaži detalje",
    zoom_out: "Prikaži manje",
    title: "Naslov (opciono)",
    language: "Jezik",
    lang_auto: "Automatski",
    collapsed: "Podrazumevano skupljeni odeljci",
    zoom: "Dugme za detalje",
    zoom_helper: "Prebacuje mini karticu na sadržaj pune kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ova kartica zahteva Home Assistant 2024.8 ili noviji.",
    unavailable: "Nedostupno",
    panel_title: "Liste zadataka",
    information: "Informacije",
    create_list: "Napravi listu",
    delete_list: "Obriši listu",
    delete_list_text: "Lista {list} i sve njene stavke biće obrisane.",
    move_item: "Pomeri {item} (prevuci ili tasteri sa strelicama)",
    remove_item: "Obriši {item}",
    to_do_title: "Za uraditi",
    overdue: "Kasni",
    due_today: "Rok danas",
    none_completed: "Nema završenih stavki",
    none: "Nema",
    action_failed: "Radnja nije uspela:",
  },
  ro: {
    lists: "Liste",
    todo_n: "{n} de făcut",
    overdue_n: "{n} întârziate",
    up_to_date: "La zi",
    all_done: "Totul e gata",
    mark_done: "Marchează {item} ca făcut",
    mark_todo: "Marchează {item} ca de făcut",
    edit_item: "Editează {item}",
    more_n: "+ încă {n}",
    add_placeholder: "Adaugă în {list}…",
    add: "Adaugă",
    add_to: "Adaugă în {list}",
    loading: "Se încarcă…",
    nothing_to_do: "Nimic de făcut",
    completed: "Finalizate",
    clear_completed: "Șterge finalizatele",
    today: "Astăzi",
    tomorrow: "Mâine",
    yesterday: "Ieri",
    name: "Nume",
    details: "Detalii",
    delete: "Șterge",
    save: "Salvează",
    no_data: "Nicio listă găsită: adăugați o integrare de liste (Local To-do, Listă de cumpărături, Bring!, Todoist…).",
    entities: "Liste (gol: toate listele)",
    entity: "Lista afișată prima",
    sort: "Ordine",
    sort_manual: "Ca în listă",
    sort_due: "După termen",
    sort_alpha: "Alfabetic",
    max_items: "Elemente afișate (0: toate)",
    show_tabs: "Afișează filele listelor",
    show_add: "Afișează câmpul de adăugare",
    show_completed: "Afișează elementele finalizate",
    to_do: "de făcut",
    overdue_item: "Întârziat: {item}",
    due_today_n: "{n} pentru azi",
    due_today_item: "Pentru azi: {item}",
    done_n: "{n} făcute",
    show_hero: "Afișează rezumatul ilustrat",
    illustration: "Ilustrație animată",
    illustration_theme: "Tema ilustrației",
    theme_auto: "Automat: noapte cu o temă întunecată, zi cu o temă luminoasă",
    theme_day: "Zi",
    theme_night: "Noapte",
    due: "Termen",
    add_with_due: "Adaugă cu termen",
    read_only: "Această listă nu poate fi modificată din Home Assistant",
    cancel: "Anulează",
    zoom_in: "Arată detalii",
    zoom_out: "Arată mai puțin",
    title: "Titlu (opțional)",
    language: "Limbă",
    lang_auto: "Automat",
    collapsed: "Secțiuni pliate implicit",
    zoom: "Buton de detalii",
    zoom_helper: "Comută mini cardul la conținutul cardului complet",
    show_title: "Afișează titlul",
    show_subtitle: "Afișează subtitlul",
    no_registry: "Acest card necesită Home Assistant 2024.8 sau mai nou.",
    unavailable: "Indisponibil",
    panel_title: "Liste de sarcini",
    information: "Informații",
    create_list: "Creează listă",
    delete_list: "Șterge lista",
    delete_list_text: "Lista {list} și toate elementele ei vor fi șterse.",
    move_item: "Mută {item} (trage sau tastele săgeți)",
    remove_item: "Șterge {item}",
    to_do_title: "De făcut",
    overdue: "Întârziate",
    due_today: "Scadente azi",
    none_completed: "Niciun element finalizat",
    none: "Niciuna",
    action_failed: "Acțiunea a eșuat:",
  },
  da: {
    lists: "Lister",
    todo_n: "{n} at gøre",
    overdue_n: "{n} forsinket",
    up_to_date: "Ajour",
    all_done: "Alt er gjort",
    mark_done: "Markér {item} som gjort",
    mark_todo: "Markér {item} som ikke gjort",
    edit_item: "Rediger {item}",
    more_n: "+ {n} mere",
    add_placeholder: "Tilføj til {list}…",
    add: "Tilføj",
    add_to: "Tilføj til {list}",
    loading: "Indlæser…",
    nothing_to_do: "Intet at gøre",
    completed: "Udført",
    clear_completed: "Ryd udførte",
    today: "I dag",
    tomorrow: "I morgen",
    yesterday: "I går",
    name: "Navn",
    details: "Detaljer",
    delete: "Slet",
    save: "Gem",
    no_data: "Ingen liste fundet: tilføj en opgaveintegration (Local To-do, Indkøbsliste, Bring!, Todoist…).",
    entities: "Lister (tom: alle opgavelister)",
    entity: "Liste vist først",
    sort: "Rækkefølge",
    sort_manual: "Som i listen",
    sort_due: "Efter forfaldsdato",
    sort_alpha: "Alfabetisk",
    max_items: "Viste elementer (0: alle)",
    show_tabs: "Vis faneblade mellem lister",
    show_add: "Vis feltet til at tilføje",
    show_completed: "Vis udførte elementer",
    to_do: "at gøre",
    overdue_item: "Forfalden: {item}",
    due_today_n: "{n} i dag",
    due_today_item: "I dag: {item}",
    done_n: "{n} udført",
    show_hero: "Vis resuméet med illustration",
    illustration: "Animeret illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatisk: nat med et mørkt tema, dag med et lyst tema",
    theme_day: "Dag",
    theme_night: "Nat",
    due: "Forfaldsdato",
    add_with_due: "Tilføj med forfaldsdato",
    read_only: "Denne liste kan ikke ændres fra Home Assistant",
    cancel: "Annuller",
    zoom_in: "Vis detaljer",
    zoom_out: "Vis mindre",
    title: "Titel (valgfri)",
    language: "Sprog",
    lang_auto: "Automatisk",
    collapsed: "Sektioner foldet sammen som standard",
    zoom: "Detaljeknap",
    zoom_helper: "Skifter minikortet til det fulde korts indhold",
    show_title: "Vis titel",
    show_subtitle: "Vis undertitel",
    no_registry: "Dette kort kræver Home Assistant 2024.8 eller nyere.",
    unavailable: "Utilgængelig",
    panel_title: "Opgavelister",
    information: "Information",
    create_list: "Opret liste",
    delete_list: "Slet liste",
    delete_list_text: "Listen {list} og alle dens punkter bliver slettet.",
    move_item: "Flyt {item} (træk eller piletaster)",
    remove_item: "Slet {item}",
    to_do_title: "At gøre",
    overdue: "Forsinket",
    due_today: "Forfalder i dag",
    none_completed: "Ingen fuldførte punkter",
    none: "Ingen",
    action_failed: "Handlingen mislykkedes:",
  },
  sv: {
    lists: "Listor",
    todo_n: "{n} att göra",
    overdue_n: "{n} försenade",
    up_to_date: "I fas",
    all_done: "Allt klart",
    mark_done: "Markera {item} som klar",
    mark_todo: "Markera {item} som att göra",
    edit_item: "Redigera {item}",
    more_n: "+ {n} till",
    add_placeholder: "Lägg till i {list}…",
    add: "Lägg till",
    add_to: "Lägg till i {list}",
    loading: "Läser in…",
    nothing_to_do: "Inget att göra",
    completed: "Klara",
    clear_completed: "Rensa klara",
    today: "I dag",
    tomorrow: "I morgon",
    yesterday: "I går",
    name: "Namn",
    details: "Detaljer",
    delete: "Ta bort",
    save: "Spara",
    no_data: "Ingen lista hittades: lägg till en att göra-integration (Local To-do, Inköpslista, Bring!, Todoist…).",
    entities: "Listor (tom: alla listor)",
    entity: "Lista som visas först",
    sort: "Ordning",
    sort_manual: "Som i listan",
    sort_due: "Efter förfallodatum",
    sort_alpha: "Alfabetisk",
    max_items: "Visade objekt (0: alla)",
    show_tabs: "Visa flikar mellan listor",
    show_add: "Visa fältet för att lägga till",
    show_completed: "Visa klara objekt",
    to_do: "att göra",
    overdue_item: "Försenad: {item}",
    due_today_n: "{n} i dag",
    due_today_item: "I dag: {item}",
    done_n: "{n} klara",
    show_hero: "Visa sammanfattningen med illustration",
    illustration: "Animerad illustration",
    illustration_theme: "Illustrationens tema",
    theme_auto: "Automatiskt: natt med ett mörkt tema, dag med ett ljust tema",
    theme_day: "Dag",
    theme_night: "Natt",
    due: "Förfallodatum",
    add_with_due: "Lägg till med förfallodatum",
    read_only: "Den här listan kan inte ändras från Home Assistant",
    cancel: "Avbryt",
    zoom_in: "Visa detaljer",
    zoom_out: "Visa mindre",
    title: "Titel (valfri)",
    language: "Språk",
    lang_auto: "Automatiskt",
    collapsed: "Sektioner hopfällda som standard",
    zoom: "Detaljknapp",
    zoom_helper: "Växlar minikortet till hela kortets innehåll",
    show_title: "Visa titel",
    show_subtitle: "Visa undertitel",
    no_registry: "Det här kortet kräver Home Assistant 2024.8 eller senare.",
    unavailable: "Otillgänglig",
    panel_title: "Att göra-listor",
    information: "Information",
    create_list: "Skapa lista",
    delete_list: "Ta bort lista",
    delete_list_text: "Listan {list} och alla dess punkter tas bort.",
    move_item: "Flytta {item} (dra eller piltangenter)",
    remove_item: "Ta bort {item}",
    to_do_title: "Att göra",
    overdue: "Försenade",
    due_today: "Förfaller i dag",
    none_completed: "Inga slutförda punkter",
    none: "Inga",
    action_failed: "Åtgärden misslyckades:",
  },
  bg: {
    lists: "Списъци",
    todo_n: "За правене: {n}",
    overdue_n: "Просрочени: {n}",
    up_to_date: "Навреме",
    all_done: "Всичко е готово",
    mark_done: "Отбележи {item} като готово",
    mark_todo: "Отбележи {item} като за правене",
    edit_item: "Редактирай {item}",
    more_n: "+ още {n}",
    add_placeholder: "Добави към {list}…",
    add: "Добави",
    add_to: "Добави към {list}",
    loading: "Зареждане…",
    nothing_to_do: "Няма нищо за правене",
    completed: "Готови",
    clear_completed: "Изчисти готовите",
    today: "Днес",
    tomorrow: "Утре",
    yesterday: "Вчера",
    name: "Име",
    details: "Подробности",
    delete: "Изтрий",
    save: "Запази",
    no_data: "Не е открит списък: добавете интеграция за задачи (Local To-do, Списък за пазаруване, Bring!, Todoist…).",
    entities: "Списъци (празно: всички списъци)",
    entity: "Списък, показван пръв",
    sort: "Ред",
    sort_manual: "Както в списъка",
    sort_due: "По краен срок",
    sort_alpha: "Азбучно",
    max_items: "Показани елементи (0: всички)",
    show_tabs: "Показване на разделите на списъците",
    show_add: "Показване на полето за добавяне",
    show_completed: "Показване на готовите",
    to_do: "за правене",
    overdue_item: "Закъснява: {item}",
    due_today_n: "За днес: {n}",
    due_today_item: "За днес: {item}",
    done_n: "Готови: {n}",
    show_hero: "Показване на илюстрираното резюме",
    illustration: "Анимирана илюстрация",
    illustration_theme: "Тема на илюстрацията",
    theme_auto: "Автоматично: нощ с тъмна тема, ден със светла тема",
    theme_day: "Ден",
    theme_night: "Нощ",
    due: "Срок",
    add_with_due: "Добавяне със срок",
    read_only: "Този списък не може да се променя от Home Assistant",
    cancel: "Отказ",
    zoom_in: "Покажи подробности",
    zoom_out: "Покажи по-малко",
    title: "Заглавие (по избор)",
    language: "Език",
    lang_auto: "Автоматично",
    collapsed: "Сгънати по подразбиране раздели",
    zoom: "Бутон за подробности",
    zoom_helper: "Превключва мини картата към съдържанието на пълната карта",
    show_title: "Покажи заглавие",
    show_subtitle: "Покажи подзаглавие",
    no_registry: "Тази карта изисква Home Assistant 2024.8 или по-нов.",
    unavailable: "Недостъпно",
    panel_title: "Списъци със задачи",
    information: "Информация",
    create_list: "Създай списък",
    delete_list: "Изтрий списъка",
    delete_list_text: "Списъкът {list} и всичките му елементи ще бъдат изтрити.",
    move_item: "Премести {item} (плъзни или клавиши със стрелки)",
    remove_item: "Изтрий {item}",
    to_do_title: "За изпълнение",
    overdue: "Просрочени",
    due_today: "Срок днес",
    none_completed: "Няма завършени елементи",
    none: "Няма",
    action_failed: "Действието е неуспешно:",
  },
  ru: {
    lists: "Списки",
    todo_n: "Сделать: {n}",
    overdue_n: "Просрочено: {n}",
    up_to_date: "Всё в срок",
    all_done: "Всё сделано",
    mark_done: "Отметить {item} как сделанное",
    mark_todo: "Отметить {item} как несделанное",
    edit_item: "Изменить {item}",
    more_n: "+ ещё {n}",
    add_placeholder: "Добавить в {list}…",
    add: "Добавить",
    add_to: "Добавить в {list}",
    loading: "Загрузка…",
    nothing_to_do: "Нечего делать",
    completed: "Сделано",
    clear_completed: "Очистить сделанное",
    today: "Сегодня",
    tomorrow: "Завтра",
    yesterday: "Вчера",
    name: "Название",
    details: "Подробности",
    delete: "Удалить",
    save: "Сохранить",
    no_data: "Список не найден: добавьте интеграцию списков дел (Local To-do, Список покупок, Bring!, Todoist…).",
    entities: "Списки (пусто: все списки)",
    entity: "Список, показываемый первым",
    sort: "Порядок",
    sort_manual: "Как в списке",
    sort_due: "По сроку",
    sort_alpha: "По алфавиту",
    max_items: "Показывать пунктов (0: все)",
    show_tabs: "Показывать вкладки списков",
    show_add: "Показывать поле добавления",
    show_completed: "Показывать сделанное",
    to_do: "сделать",
    overdue_item: "Просрочено: {item}",
    due_today_n: "На сегодня: {n}",
    due_today_item: "На сегодня: {item}",
    done_n: "Сделано: {n}",
    show_hero: "Показывать сводку с иллюстрацией",
    illustration: "Анимированная иллюстрация",
    illustration_theme: "Тема иллюстрации",
    theme_auto: "Автоматически: ночь при тёмной теме, день при светлой теме",
    theme_day: "День",
    theme_night: "Ночь",
    due: "Срок",
    add_with_due: "Добавить со сроком",
    read_only: "Этот список нельзя изменить из Home Assistant",
    cancel: "Отмена",
    zoom_in: "Показать подробности",
    zoom_out: "Свернуть",
    title: "Заголовок (необязательно)",
    language: "Язык",
    lang_auto: "Автоматически",
    collapsed: "Свёрнутые по умолчанию разделы",
    zoom: "Кнопка подробностей",
    zoom_helper: "Переключает мини-карточку на содержимое полной карточки",
    show_title: "Показывать заголовок",
    show_subtitle: "Показывать подзаголовок",
    no_registry: "Для этой карточки нужен Home Assistant 2024.8 или новее.",
    unavailable: "Недоступно",
    panel_title: "Списки дел",
    information: "Информация",
    create_list: "Создать список",
    delete_list: "Удалить список",
    delete_list_text: "Список {list} и все его элементы будут удалены.",
    move_item: "Переместить {item} (перетащите или клавиши со стрелками)",
    remove_item: "Удалить {item}",
    to_do_title: "К выполнению",
    overdue: "Просрочено",
    due_today: "Срок сегодня",
    none_completed: "Нет выполненных элементов",
    none: "Нет",
    action_failed: "Действие не выполнено:",
  },
  uk: {
    lists: "Списки",
    todo_n: "Зробити: {n}",
    overdue_n: "Прострочено: {n}",
    up_to_date: "Усе вчасно",
    all_done: "Усе зроблено",
    mark_done: "Позначити {item} як зроблене",
    mark_todo: "Позначити {item} як незроблене",
    edit_item: "Змінити {item}",
    more_n: "+ ще {n}",
    add_placeholder: "Додати до {list}…",
    add: "Додати",
    add_to: "Додати до {list}",
    loading: "Завантаження…",
    nothing_to_do: "Нічого робити",
    completed: "Зроблено",
    clear_completed: "Очистити зроблене",
    today: "Сьогодні",
    tomorrow: "Завтра",
    yesterday: "Учора",
    name: "Назва",
    details: "Подробиці",
    delete: "Видалити",
    save: "Зберегти",
    no_data: "Список не знайдено: додайте інтеграцію списків справ (Local To-do, Список покупок, Bring!, Todoist…).",
    entities: "Списки (порожньо: усі списки)",
    entity: "Список, що показується першим",
    sort: "Порядок",
    sort_manual: "Як у списку",
    sort_due: "За терміном",
    sort_alpha: "За абеткою",
    max_items: "Показувати пунктів (0: усі)",
    show_tabs: "Показувати вкладки списків",
    show_add: "Показувати поле додавання",
    show_completed: "Показувати зроблене",
    to_do: "зробити",
    overdue_item: "Прострочено: {item}",
    due_today_n: "На сьогодні: {n}",
    due_today_item: "На сьогодні: {item}",
    done_n: "Зроблено: {n}",
    show_hero: "Показувати зведення з ілюстрацією",
    illustration: "Анімована ілюстрація",
    illustration_theme: "Тема ілюстрації",
    theme_auto: "Автоматично: ніч з темною темою, день зі світлою темою",
    theme_day: "День",
    theme_night: "Ніч",
    due: "Термін",
    add_with_due: "Додати з терміном",
    read_only: "Цей список не можна змінити з Home Assistant",
    cancel: "Скасувати",
    zoom_in: "Показати подробиці",
    zoom_out: "Згорнути",
    title: "Заголовок (необов'язково)",
    language: "Мова",
    lang_auto: "Автоматично",
    collapsed: "Згорнуті за замовчуванням розділи",
    zoom: "Кнопка подробиць",
    zoom_helper: "Перемикає міні-картку на вміст повної картки",
    show_title: "Показувати заголовок",
    show_subtitle: "Показувати підзаголовок",
    no_registry: "Для цієї картки потрібен Home Assistant 2024.8 або новіший.",
    unavailable: "Недоступно",
    panel_title: "Списки справ",
    information: "Інформація",
    create_list: "Створити список",
    delete_list: "Видалити список",
    delete_list_text: "Список {list} і всі його елементи буде видалено.",
    move_item: "Перемістити {item} (перетягніть або клавіші зі стрілками)",
    remove_item: "Видалити {item}",
    to_do_title: "До виконання",
    overdue: "Прострочено",
    due_today: "Термін сьогодні",
    none_completed: "Немає виконаних елементів",
    none: "Немає",
    action_failed: "Дію не виконано:",
  },
  hu: {
    lists: "Listák",
    todo_n: "{n} teendő",
    overdue_n: "{n} késésben",
    up_to_date: "Naprakész",
    all_done: "Minden kész",
    mark_done: "{item} késznek jelölése",
    mark_todo: "{item} teendőnek jelölése",
    edit_item: "{item} szerkesztése",
    more_n: "+ még {n}",
    add_placeholder: "Hozzáadás: {list}…",
    add: "Hozzáadás",
    add_to: "Hozzáadás: {list}",
    loading: "Betöltés…",
    nothing_to_do: "Nincs teendő",
    completed: "Kész",
    clear_completed: "Készek törlése",
    today: "Ma",
    tomorrow: "Holnap",
    yesterday: "Tegnap",
    name: "Név",
    details: "Részletek",
    delete: "Törlés",
    save: "Mentés",
    no_data: "Nem található lista: adjon hozzá egy teendőlista-integrációt (Local To-do, Bevásárlólista, Bring!, Todoist…).",
    entities: "Listák (üres: minden lista)",
    entity: "Elsőként mutatott lista",
    sort: "Sorrend",
    sort_manual: "Ahogy a listában",
    sort_due: "Határidő szerint",
    sort_alpha: "Ábécé szerint",
    max_items: "Megjelenített elemek (0: mind)",
    show_tabs: "Listák füleinek megjelenítése",
    show_add: "Hozzáadó mező megjelenítése",
    show_completed: "Kész elemek megjelenítése",
    to_do: "teendő",
    overdue_item: "Lejárt: {item}",
    due_today_n: "Ma esedékes: {n}",
    due_today_item: "Ma esedékes: {item}",
    done_n: "Kész: {n}",
    show_hero: "Illusztrált összegzés megjelenítése",
    illustration: "Animált illusztráció",
    illustration_theme: "Az illusztráció témája",
    theme_auto: "Automatikus: éjszaka sötét témával, nappal világos témával",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
    due: "Határidő",
    add_with_due: "Hozzáadás határidővel",
    read_only: "Ez a lista nem módosítható a Home Assistantból",
    cancel: "Mégse",
    zoom_in: "Részletek",
    zoom_out: "Kevesebb",
    title: "Cím (nem kötelező)",
    language: "Nyelv",
    lang_auto: "Automatikus",
    collapsed: "Alapértelmezetten összecsukott szakaszok",
    zoom: "Részletek gomb",
    zoom_helper: "A minikártyát a teljes kártya tartalmára váltja",
    show_title: "Cím megjelenítése",
    show_subtitle: "Alcím megjelenítése",
    no_registry: "Ehhez a kártyához Home Assistant 2024.8 vagy újabb szükséges.",
    unavailable: "Nem elérhető",
    panel_title: "Teendőlisták",
    information: "Információ",
    create_list: "Lista létrehozása",
    delete_list: "Lista törlése",
    delete_list_text: "A(z) {list} lista és minden eleme törlődik.",
    move_item: "{item} áthelyezése (húzás vagy nyílbillentyűk)",
    remove_item: "{item} törlése",
    to_do_title: "Teendő",
    overdue: "Lejárt",
    due_today: "Ma esedékes",
    none_completed: "Nincs elvégzett elem",
    none: "Nincs",
    action_failed: "A művelet sikertelen:",
  },
  sk: {
    lists: "Zoznamy",
    todo_n: "Na urobenie: {n}",
    overdue_n: "Po termíne: {n}",
    up_to_date: "Včas",
    all_done: "Všetko hotové",
    mark_done: "Označiť {item} ako hotové",
    mark_todo: "Označiť {item} ako nehotové",
    edit_item: "Upraviť {item}",
    more_n: "+ ďalšie {n}",
    add_placeholder: "Pridať do {list}…",
    add: "Pridať",
    add_to: "Pridať do {list}",
    loading: "Načítava sa…",
    nothing_to_do: "Nič na urobenie",
    completed: "Hotové",
    clear_completed: "Vymazať hotové",
    today: "Dnes",
    tomorrow: "Zajtra",
    yesterday: "Včera",
    name: "Názov",
    details: "Podrobnosti",
    delete: "Odstrániť",
    save: "Uložiť",
    no_data: "Nenašiel sa žiadny zoznam: pridajte integráciu úloh (Local To-do, Nákupný zoznam, Bring!, Todoist…).",
    entities: "Zoznamy (prázdne: všetky zoznamy)",
    entity: "Zoznam zobrazený ako prvý",
    sort: "Poradie",
    sort_manual: "Ako v zozname",
    sort_due: "Podľa termínu",
    sort_alpha: "Abecedne",
    max_items: "Zobrazené položky (0: všetky)",
    show_tabs: "Zobraziť karty zoznamov",
    show_add: "Zobraziť pole na pridanie",
    show_completed: "Zobraziť hotové",
    to_do: "na urobenie",
    overdue_item: "Po termíne: {item}",
    due_today_n: "Na dnes: {n}",
    due_today_item: "Na dnes: {item}",
    done_n: "Hotovo: {n}",
    show_hero: "Zobraziť ilustrovaný súhrn",
    illustration: "Animovaná ilustrácia",
    illustration_theme: "Téma ilustrácie",
    theme_auto: "Automaticky: noc s tmavou témou, deň so svetlou témou",
    theme_day: "Deň",
    theme_night: "Noc",
    due: "Termín",
    add_with_due: "Pridať s termínom",
    read_only: "Tento zoznam sa nedá zmeniť z Home Assistant",
    cancel: "Zrušiť",
    zoom_in: "Zobraziť podrobnosti",
    zoom_out: "Zobraziť menej",
    title: "Názov (voliteľné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Predvolene zbalené sekcie",
    zoom: "Tlačidlo podrobností",
    zoom_helper: "Prepne mini kartu na obsah úplnej karty",
    show_title: "Zobraziť názov",
    show_subtitle: "Zobraziť podnadpis",
    no_registry: "Táto karta vyžaduje Home Assistant 2024.8 alebo novší.",
    unavailable: "Nedostupné",
    panel_title: "Zoznamy úloh",
    information: "Informácie",
    create_list: "Vytvoriť zoznam",
    delete_list: "Odstrániť zoznam",
    delete_list_text: "Zoznam {list} a všetky jeho položky budú odstránené.",
    move_item: "Presunúť {item} (potiahnutím alebo klávesmi so šípkami)",
    remove_item: "Odstrániť {item}",
    to_do_title: "Na vybavenie",
    overdue: "Po termíne",
    due_today: "Termín dnes",
    none_completed: "Žiadna dokončená položka",
    none: "Žiadne",
    action_failed: "Akcia zlyhala:",
  },
  cs: {
    lists: "Seznamy",
    todo_n: "K udělání: {n}",
    overdue_n: "Po termínu: {n}",
    up_to_date: "Včas",
    all_done: "Vše hotovo",
    mark_done: "Označit {item} jako hotové",
    mark_todo: "Označit {item} jako nehotové",
    edit_item: "Upravit {item}",
    more_n: "+ další {n}",
    add_placeholder: "Přidat do {list}…",
    add: "Přidat",
    add_to: "Přidat do {list}",
    loading: "Načítání…",
    nothing_to_do: "Nic k udělání",
    completed: "Hotové",
    clear_completed: "Vymazat hotové",
    today: "Dnes",
    tomorrow: "Zítra",
    yesterday: "Včera",
    name: "Název",
    details: "Podrobnosti",
    delete: "Smazat",
    save: "Uložit",
    no_data: "Nebyl nalezen žádný seznam: přidejte integraci úkolů (Local To-do, Nákupní seznam, Bring!, Todoist…).",
    entities: "Seznamy (prázdné: všechny seznamy)",
    entity: "Seznam zobrazený jako první",
    sort: "Pořadí",
    sort_manual: "Jako v seznamu",
    sort_due: "Podle termínu",
    sort_alpha: "Abecedně",
    max_items: "Zobrazené položky (0: všechny)",
    show_tabs: "Zobrazit karty seznamů",
    show_add: "Zobrazit pole pro přidání",
    show_completed: "Zobrazit hotové",
    to_do: "k udělání",
    overdue_item: "Po termínu: {item}",
    due_today_n: "Na dnes: {n}",
    due_today_item: "Na dnes: {item}",
    done_n: "Hotovo: {n}",
    show_hero: "Zobrazit ilustrovaný souhrn",
    illustration: "Animovaná ilustrace",
    illustration_theme: "Motiv ilustrace",
    theme_auto: "Automaticky: noc s tmavým motivem, den se světlým motivem",
    theme_day: "Den",
    theme_night: "Noc",
    due: "Termín",
    add_with_due: "Přidat s termínem",
    read_only: "Tento seznam nelze změnit z Home Assistant",
    cancel: "Zrušit",
    zoom_in: "Zobrazit podrobnosti",
    zoom_out: "Zobrazit méně",
    title: "Název (volitelné)",
    language: "Jazyk",
    lang_auto: "Automaticky",
    collapsed: "Ve výchozím stavu sbalené sekce",
    zoom: "Tlačítko podrobností",
    zoom_helper: "Přepne mini kartu na obsah plné karty",
    show_title: "Zobrazit název",
    show_subtitle: "Zobrazit podtitul",
    no_registry: "Tato karta vyžaduje Home Assistant 2024.8 nebo novější.",
    unavailable: "Nedostupné",
    panel_title: "Seznamy úkolů",
    information: "Informace",
    create_list: "Vytvořit seznam",
    delete_list: "Smazat seznam",
    delete_list_text: "Seznam {list} a všechny jeho položky budou smazány.",
    move_item: "Přesunout {item} (přetažením nebo šipkami)",
    remove_item: "Smazat {item}",
    to_do_title: "K vyřízení",
    overdue: "Po termínu",
    due_today: "Termín dnes",
    none_completed: "Žádná dokončená položka",
    none: "Žádné",
    action_failed: "Akce se nezdařila:",
  },
  sl: {
    lists: "Seznami",
    todo_n: "Za narediti: {n}",
    overdue_n: "Zamuja: {n}",
    up_to_date: "Na tekočem",
    all_done: "Vse narejeno",
    mark_done: "Označi {item} kot narejeno",
    mark_todo: "Označi {item} kot nenarejeno",
    edit_item: "Uredi {item}",
    more_n: "+ še {n}",
    add_placeholder: "Dodaj v {list}…",
    add: "Dodaj",
    add_to: "Dodaj v {list}",
    loading: "Nalaganje…",
    nothing_to_do: "Nič za narediti",
    completed: "Narejeno",
    clear_completed: "Počisti narejeno",
    today: "Danes",
    tomorrow: "Jutri",
    yesterday: "Včeraj",
    name: "Ime",
    details: "Podrobnosti",
    delete: "Izbriši",
    save: "Shrani",
    no_data: "Ni najdenega seznama: dodajte integracijo opravil (Local To-do, Nakupovalni seznam, Bring!, Todoist…).",
    entities: "Seznami (prazno: vsi seznami)",
    entity: "Seznam, prikazan prvi",
    sort: "Vrstni red",
    sort_manual: "Kot v seznamu",
    sort_due: "Po roku",
    sort_alpha: "Po abecedi",
    max_items: "Prikazani elementi (0: vsi)",
    show_tabs: "Prikaži zavihke seznamov",
    show_add: "Prikaži polje za dodajanje",
    show_completed: "Prikaži narejeno",
    to_do: "za narediti",
    overdue_item: "Zamuja: {item}",
    due_today_n: "Za danes: {n}",
    due_today_item: "Za danes: {item}",
    done_n: "Narejeno: {n}",
    show_hero: "Prikaži ilustriran povzetek",
    illustration: "Animirana ilustracija",
    illustration_theme: "Tema ilustracije",
    theme_auto: "Samodejno: noč s temno temo, dan s svetlo temo",
    theme_day: "Dan",
    theme_night: "Noč",
    due: "Rok",
    add_with_due: "Dodaj z rokom",
    read_only: "Tega seznama ni mogoče spremeniti iz Home Assistanta",
    cancel: "Prekliči",
    zoom_in: "Prikaži podrobnosti",
    zoom_out: "Prikaži manj",
    title: "Naslov (neobvezno)",
    language: "Jezik",
    lang_auto: "Samodejno",
    collapsed: "Privzeto strnjeni razdelki",
    zoom: "Gumb za podrobnosti",
    zoom_helper: "Preklopi mini kartico na vsebino polne kartice",
    show_title: "Prikaži naslov",
    show_subtitle: "Prikaži podnaslov",
    no_registry: "Ta kartica potrebuje Home Assistant 2024.8 ali novejši.",
    unavailable: "Ni na voljo",
    panel_title: "Seznami opravil",
    information: "Informacije",
    create_list: "Ustvari seznam",
    delete_list: "Izbriši seznam",
    delete_list_text: "Seznam {list} in vsi njegovi elementi bodo izbrisani.",
    move_item: "Premakni {item} (povleci ali smerne tipke)",
    remove_item: "Izbriši {item}",
    to_do_title: "Za narediti",
    overdue: "Zamujeno",
    due_today: "Rok danes",
    none_completed: "Ni dokončanih elementov",
    none: "Nič",
    action_failed: "Dejanje ni uspelo:",
  },
  lv: {
    lists: "Saraksti",
    todo_n: "Jāizdara: {n}",
    overdue_n: "Nokavēti: {n}",
    up_to_date: "Laikā",
    all_done: "Viss izdarīts",
    mark_done: "Atzīmēt {item} kā izdarītu",
    mark_todo: "Atzīmēt {item} kā neizdarītu",
    edit_item: "Rediģēt {item}",
    more_n: "+ vēl {n}",
    add_placeholder: "Pievienot sarakstam {list}…",
    add: "Pievienot",
    add_to: "Pievienot sarakstam {list}",
    loading: "Ielādē…",
    nothing_to_do: "Nav ko darīt",
    completed: "Izdarīti",
    clear_completed: "Notīrīt izdarītos",
    today: "Šodien",
    tomorrow: "Rīt",
    yesterday: "Vakar",
    name: "Nosaukums",
    details: "Sīkāka informācija",
    delete: "Dzēst",
    save: "Saglabāt",
    no_data: "Saraksts nav atrasts: pievienojiet uzdevumu integrāciju (Local To-do, Iepirkumu saraksts, Bring!, Todoist…).",
    entities: "Saraksti (tukšs: visi saraksti)",
    entity: "Pirmais rādītais saraksts",
    sort: "Secība",
    sort_manual: "Kā sarakstā",
    sort_due: "Pēc termiņa",
    sort_alpha: "Alfabētiski",
    max_items: "Rādītie vienumi (0: visi)",
    show_tabs: "Rādīt sarakstu cilnes",
    show_add: "Rādīt pievienošanas lauku",
    show_completed: "Rādīt izdarītos",
    to_do: "jāizdara",
    overdue_item: "Nokavēts: {item}",
    due_today_n: "Šodien: {n}",
    due_today_item: "Šodien: {item}",
    done_n: "Izdarīts: {n}",
    show_hero: "Rādīt ilustrēto kopsavilkumu",
    illustration: "Animēta ilustrācija",
    illustration_theme: "Ilustrācijas motīvs",
    theme_auto: "Automātiski: nakts ar tumšu tēmu, diena ar gaišu tēmu",
    theme_day: "Diena",
    theme_night: "Nakts",
    due: "Termiņš",
    add_with_due: "Pievienot ar termiņu",
    read_only: "Šo sarakstu nevar mainīt no Home Assistant",
    cancel: "Atcelt",
    zoom_in: "Rādīt detaļas",
    zoom_out: "Rādīt mazāk",
    title: "Virsraksts (neobligāts)",
    language: "Valoda",
    lang_auto: "Automātiski",
    collapsed: "Pēc noklusējuma sakļautās sadaļas",
    zoom: "Detaļu poga",
    zoom_helper: "Pārslēdz mini kartīti uz pilnās kartītes saturu",
    show_title: "Rādīt virsrakstu",
    show_subtitle: "Rādīt apakšvirsrakstu",
    no_registry: "Šai kartītei nepieciešams Home Assistant 2024.8 vai jaunāks.",
    unavailable: "Nav pieejams",
    panel_title: "Uzdevumu saraksti",
    information: "Informācija",
    create_list: "Izveidot sarakstu",
    delete_list: "Dzēst sarakstu",
    delete_list_text: "Saraksts {list} un visi tā vienumi tiks dzēsti.",
    move_item: "Pārvietot {item} (velciet vai bulttaustiņi)",
    remove_item: "Dzēst {item}",
    to_do_title: "Jāizdara",
    overdue: "Nokavēti",
    due_today: "Termiņš šodien",
    none_completed: "Nav pabeigtu vienumu",
    none: "Nav",
    action_failed: "Darbība neizdevās:",
  },
  el: {
    lists: "Λίστες",
    todo_n: "{n} εκκρεμή",
    overdue_n: "{n} καθυστερημένα",
    up_to_date: "Εντάξει",
    all_done: "Όλα έγιναν",
    mark_done: "Σήμανση του {item} ως ολοκληρωμένου",
    mark_todo: "Σήμανση του {item} ως εκκρεμούς",
    edit_item: "Επεξεργασία {item}",
    more_n: "+ {n} ακόμη",
    add_placeholder: "Προσθήκη στη λίστα {list}…",
    add: "Προσθήκη",
    add_to: "Προσθήκη στη λίστα {list}",
    loading: "Φόρτωση…",
    nothing_to_do: "Τίποτα εκκρεμές",
    completed: "Ολοκληρωμένα",
    clear_completed: "Εκκαθάριση ολοκληρωμένων",
    today: "Σήμερα",
    tomorrow: "Αύριο",
    yesterday: "Χθες",
    name: "Όνομα",
    details: "Λεπτομέρειες",
    delete: "Διαγραφή",
    save: "Αποθήκευση",
    no_data: "Δεν βρέθηκε λίστα: προσθέστε μια ενσωμάτωση εργασιών (Local To-do, Λίστα αγορών, Bring!, Todoist…).",
    entities: "Λίστες (κενό: όλες οι λίστες)",
    entity: "Λίστα που εμφανίζεται πρώτη",
    sort: "Σειρά",
    sort_manual: "Όπως στη λίστα",
    sort_due: "Κατά προθεσμία",
    sort_alpha: "Αλφαβητικά",
    max_items: "Εμφανιζόμενα στοιχεία (0: όλα)",
    show_tabs: "Εμφάνιση καρτελών λιστών",
    show_add: "Εμφάνιση πεδίου προσθήκης",
    show_completed: "Εμφάνιση ολοκληρωμένων",
    to_do: "για να γίνουν",
    overdue_item: "Εκπρόθεσμο: {item}",
    due_today_n: "Για σήμερα: {n}",
    due_today_item: "Για σήμερα: {item}",
    done_n: "Ολοκληρώθηκαν: {n}",
    show_hero: "Εμφάνιση της εικονογραφημένης σύνοψης",
    illustration: "Κινούμενη εικονογράφηση",
    illustration_theme: "Θέμα εικονογράφησης",
    theme_auto: "Αυτόματο: νύχτα με σκούρο θέμα, μέρα με ανοιχτό θέμα",
    theme_day: "Ημέρα",
    theme_night: "Νύχτα",
    due: "Προθεσμία",
    add_with_due: "Προσθήκη με προθεσμία",
    read_only: "Αυτή η λίστα δεν μπορεί να αλλάξει από το Home Assistant",
    cancel: "Ακύρωση",
    zoom_in: "Εμφάνιση λεπτομερειών",
    zoom_out: "Εμφάνιση λιγότερων",
    title: "Τίτλος (προαιρετικό)",
    language: "Γλώσσα",
    lang_auto: "Αυτόματα",
    collapsed: "Ενότητες συμπτυγμένες από προεπιλογή",
    zoom: "Κουμπί λεπτομερειών",
    zoom_helper: "Αλλάζει τη μίνι κάρτα στο περιεχόμενο της πλήρους κάρτας",
    show_title: "Εμφάνιση τίτλου",
    show_subtitle: "Εμφάνιση υπότιτλου",
    no_registry: "Αυτή η κάρτα απαιτεί Home Assistant 2024.8 ή νεότερο.",
    unavailable: "Μη διαθέσιμο",
    panel_title: "Λίστες εργασιών",
    information: "Πληροφορίες",
    create_list: "Δημιουργία λίστας",
    delete_list: "Διαγραφή λίστας",
    delete_list_text: "Η λίστα {list} και όλα τα στοιχεία της θα διαγραφούν.",
    move_item: "Μετακίνηση {item} (σύρετε ή πλήκτρα βέλους)",
    remove_item: "Διαγραφή {item}",
    to_do_title: "Προς εκτέλεση",
    overdue: "Εκπρόθεσμα",
    due_today: "Λήγουν σήμερα",
    none_completed: "Κανένα ολοκληρωμένο στοιχείο",
    none: "Κανένα",
    action_failed: "Η ενέργεια απέτυχε:",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_ICONS = {
  chevron_down: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  alert: "M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z",
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  minus: "M19,13H5V11H19V13Z",
  play: "M8,5.14V19.14L19,12.14L8,5.14Z",
  pause: "M14,19H18V5H14M6,19H10V5H6V19Z",
  stop: "M18,18H6V6H18V18Z",
  check: "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};
const ICONS = { ...BASE_ICONS, ...CARD_ICONS };

// Shadow DOM patching: a new render rewrites the markup in place instead of replacing it (innerHTML), so the nodes
// kept keep their size, running animations, focus, hover and scroll. Replacing them all on every change of the list
// made the card show anew for a frame, the Sections view reflowing and the page jumping by itself. Elements with a
// data-key are matched by it, the others by position; a node of another kind is replaced. A custom element written
// empty (<ha-icon>) draws its own content: only the attributes the markup gives are updated.
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!o || o.nodeType !== n.nodeType || o.nodeName !== n.nodeName || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    if (o !== ref) cur.insertBefore(o, ref);
    if (n.nodeType !== 1) {
      if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
      return;
    }
    const own = n.localName.includes("-") && !n.firstChild;
    if (!own) for (const { name } of [...o.attributes]) if (!n.hasAttribute(name)) o.removeAttribute(name);
    for (const { name, value } of n.attributes) if (o.getAttribute(name) !== value) o.setAttribute(name, value);
    if (!own) patchChildren(o, n);
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = root.childNodes && document.createElement("template");
  if (!tpl?.content) {
    root.innerHTML = html;
    return;
  }
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: the card's language, or Home Assistant's full locale when it has the same base (pt-BR, de-CH).
// A bare "pt" (Home Assistant's code for European Portuguese) becomes "pt-PT", otherwise Intl formats it the Brazilian way.
const intlLocale = (hass, config) => {
  const l = lang(hass, config);
  const src = config?.language || (hass && (hass.locale?.language || hass.language)) || "";
  const out = src && src.split("-")[0] === l.split("-")[0] ? src : l;
  return out === "pt" ? "pt-PT" : out;
};

const t = (hass, config, key, vars = {}) =>
  String(STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");



const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Attributes of an element that opens an entity's more-info (nothing without an entity).
const moreInfo = (id) => (id ? ` role="button" tabindex="0" data-entity="${esc(id)}"` : "");
const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const domainOf = (id) => String(id || "").split(".")[0];
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const DAY_MS = 8.64e7;


// A time stamp (ISO string, sensor state or input_datetime "YYYY-MM-DD HH:MM:SS") in ms; null otherwise.
const parseTime = (v) => {
  if (v === null || v === undefined || v === "" || v === "unknown" || v === "unavailable") return null;
  if (typeof v === "number") return v > 1e11 ? v : v * 1000;
  const s = String(v);
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2} \d/.test(s) ? s.replace(" ", "T") : s);
  return Number.isFinite(ms) ? ms : null;
};

const startOfDay = (ms) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const fmtTime = (hass, config, ms) =>
  new Intl.DateTimeFormat(intlLocale(hass, config), { hour: "numeric", minute: "2-digit" }).format(new Date(ms));




const nameOf = (hass, id, fallback) => fallback || hass.states[id]?.attributes?.friendly_name || id;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BASE_STYLE = `
  :host { --td-accent: #1e88e5; --td-ok: var(--success-color, #43a047); --td-warn: var(--warning-color, #ffa600);
          --td-crit: var(--error-color, #db4437); --td-idle: var(--disabled-text-color, #9e9e9e); --td-active: var(--info-color, #039be5);
          /* Text in a state color is mixed with the text color so that it reads at 4.5:1 at least. */
          --td-accent-text: color-mix(in srgb, var(--td-accent) 50%, var(--primary-text-color)); }
  ha-card { overflow: hidden; container: td-card / inline-size; }
  /* Natural width in a parent that sizes to its content (inline-block, grid "auto" column), without a minimum. */
  :host { display: block; min-width: 0; --td-natural-width: 380px; }
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, var(--td-natural-width)); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .clickable { cursor: pointer; }
  [role="button"]:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: 2px; border-radius: 4px; }
  .ok { --c: var(--td-ok); } .warn { --c: var(--td-warn); } .crit { --c: var(--td-crit); } .idle { --c: var(--td-idle); }
  .active { --c: var(--td-active); } .accent { --c: var(--td-accent); }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c, var(--td-ok)); flex: none; display: inline-block; }
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; white-space: nowrap;
          background: color-mix(in srgb, var(--c, var(--td-ok)) 15%, transparent); color: color-mix(in srgb, var(--c, var(--td-ok)) 50%, var(--primary-text-color));
          flex: 0 1 auto; min-width: 0; max-width: 50%; overflow: hidden; box-sizing: border-box; }
  .chip-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 12px 0; }
  /* The chip sits on the title's line, whether a subtitle follows or not. */
  .header .zoom { align-self: flex-start; margin-top: 10px; }
  .type-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex: none;
               --td-tint: var(--c, var(--td-accent)); background: color-mix(in srgb, var(--td-tint) 16%, transparent); transition: background-color .3s ease; }
  .type-icon .icon { width: 24px; height: 24px; fill: color-mix(in srgb, var(--td-tint) 60%, var(--primary-text-color)); transition: fill .3s ease; }
  .titles { flex: 1 1 0; min-width: 0; }
  :host([hide-title]) .titles .name, :host([hide-subtitle]) .titles .sub { display: none; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sub { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .warning { padding: 16px; color: color-mix(in srgb, var(--td-warn) 50%, var(--primary-text-color)); }
  /* Buttons as on the other cards: a smoked-glass background (never a filled color), the icon in the accent color. */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; cursor: pointer; font: inherit; font-size: 13px;
         font-weight: 500; padding: 6px 12px; border-radius: 18px; background: var(--secondary-background-color, rgba(127,127,127,.12));
         color: var(--primary-text-color); min-width: 0; }
  .btn span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn:not(:disabled):hover { background: color-mix(in srgb, var(--td-accent) 12%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  .btn .icon { width: 18px; height: 18px; color: var(--td-accent); }
  .btn.primary { background: color-mix(in srgb, var(--td-accent) 16%, transparent); color: var(--td-accent-text); }
  .btn.primary:not(:disabled):hover { background: color-mix(in srgb, var(--td-accent) 24%, transparent); }
  .btn.active { background: color-mix(in srgb, var(--td-active) 16%, transparent); color: color-mix(in srgb, var(--td-active) 50%, var(--primary-text-color)); }
  .btn.active .icon { color: var(--td-active); }
  .btn.round { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: 2px; }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--td-idle) 16%, transparent); color: var(--primary-text-color); }
  .zoom:focus-visible { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: 1px; }
  .line { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--secondary-text-color); min-width: 0; }
  .line .icon { width: 16px; height: 16px; }
  .line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .line.ok, .line.warn, .line.crit, .line.active, .line.accent { color: color-mix(in srgb, var(--c) 50%, var(--primary-text-color)); }
  .line.ok .icon, .line.warn .icon, .line.crit .icon, .line.active .icon, .line.accent .icon { color: var(--c); }
  .info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .num { font-variant-numeric: tabular-nums; }
  .content { padding: 8px 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .section-title { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; text-transform: uppercase;
                   letter-spacing: .04em; color: var(--secondary-text-color); margin-bottom: 6px; }
  .section-title.toggle { cursor: pointer; user-select: none; }
  .section-title .icon { width: 16px; height: 16px; }
  .section-title span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .section-title .count { margin-left: 2px; text-transform: none; letter-spacing: 0; font-weight: 400; }
  .section-title.toggle[aria-expanded="false"] { margin-bottom: 0; }
  /* Folded: the chevron points right; unfolded: down. */
  .section-title .chevron { margin-left: auto; width: 16px; height: 16px; transition: transform .2s ease; }
  .section-title.toggle[aria-expanded="false"] .chevron { transform: rotate(-90deg); }
  .empty { font-size: 13px; color: var(--secondary-text-color); padding: 2px 0; }
  .ring-svg { position: absolute; inset: 0; transform: rotate(-90deg); }
  .ring-svg circle { fill: none; }
  .ring-svg .track { stroke: color-mix(in srgb, var(--c, var(--td-accent)) 18%, transparent); }
  .ring-svg .prog { stroke: var(--c, var(--td-accent)); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  /* Hero, as on the garden and tempo cards: a flat illustration on the left, a big value and a few colored lines on the right. */
  .hero { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .hero-art { flex: none; width: 120px; display: grid; place-items: center; }
  .hero-art svg { width: 100%; height: auto; display: block; }
  .hero-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .hero-kick { font-size: 12px; color: var(--secondary-text-color); }
  .big { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
  .big .icon { width: 24px; height: 24px; align-self: center; color: var(--c, var(--td-accent)); }
  .big b { font-size: 30px; font-weight: 400; line-height: 1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .big span { font-size: 14px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hero .line { font-size: 12.5px; }
  /* What the header pill already says is not repeated below it, unless the pill keeps only its dot. */
  .line.pill-echo { display: none; }
  @container td-card (max-width: 200px) { .header ~ .content .line.pill-echo { display: flex; } }
  .header:has(.titles.dotonly) ~ .content .line.pill-echo { display: flex; }
  /* Rows, as the watering zones: a round icon (grey at rest, tinted otherwise, a ring while it runs), name, colored state, a button. */
  .row { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .row-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; flex: none; display: grid; place-items: center;
              --t: var(--c, var(--td-idle)); background: color-mix(in srgb, var(--t) 18%, transparent); color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); }
  .row-icon.idle { background: color-mix(in srgb, var(--primary-text-color) 8%, transparent); color: var(--secondary-text-color); }
  .row-icon > .icon, .row-icon > ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
  .row-icon .ring-svg { inset: -2px; width: 44px; height: 44px; }
  .badge { position: absolute; right: -3px; bottom: -3px; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center;
           background: var(--b, var(--td-ok)); color: #fff; box-shadow: 0 0 0 2px var(--ha-card-background, var(--card-background-color, #fff)); }
  .badge .icon { width: 11px; height: 11px; }
  .row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .row-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state { font-size: 12.5px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .row-state.ok, .row-state.warn, .row-state.crit, .row-state.active, .row-state.accent { color: color-mix(in srgb, var(--c) 60%, var(--primary-text-color)); }
  .rows { display: flex; flex-direction: column; gap: 8px; }
  /* Tiles, as on room overview: grey, tinted with a border when they need a look; small badges below. */
  .tiles { display: grid; gap: 8px; grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
  .tile { min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 10px; box-sizing: border-box;
          background: var(--secondary-background-color, rgba(127,127,127,.12)); border: 1px solid transparent; }
  .tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
               border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  .tile-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .tile .row-icon { width: 30px; height: 30px; } .tile .row-icon > .icon { width: 18px; height: 18px; }
  .tile .row-state { font-size: 12px; }
  .badges { display: flex; gap: 4px; flex-wrap: wrap; }
  .pill { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; padding: 1px 7px; border-radius: 10px;
          color: color-mix(in srgb, var(--c, var(--td-idle)) 60%, var(--primary-text-color)); background: color-mix(in srgb, var(--c, var(--td-idle)) 14%, transparent); }
  .pill .icon { width: 14px; height: 14px; color: var(--c, var(--td-idle)); }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
  @container td-card (max-width: 230px) { .header { gap: 6px; } }
  /* The status pill, in every header: on the title row right after the title only when the whole title and the pill's
     whole label fit there; otherwise on its own line under the subtitle, cut to one line; its dot alone, beside the
     title, when the banner has no room left above its ground strip, or on a card of 200 px or less. Decided by
     measurement (see _fitPill), so that every language and every width gets it right. */
  .titles .trow { display: flex; align-items: center; gap: 8px; min-width: 0; width: 100%; }
  .titles .trow > .name { flex: 0 1 auto; min-width: 0; }
  .titles .trow > .chip { flex: none; max-width: none; margin: 0; align-self: center; }
  .titles.below { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
  .titles.below > * { max-width: 100%; }
  .titles.below .trow { display: contents; }
  .titles.below .trow > .name { max-width: 100%; }
  .titles.below .trow > .chip { order: 9; max-width: 100%; margin-top: 2px; align-self: flex-start; }
  /* In the banner, a pill on its own line may run over the picture, up to the banner's edge. */
  .banner .titles.below .trow > .chip { max-width: none; }
  .titles.below :is(.sub) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .titles.dotonly .trow > .chip { padding: 4px; } .titles.dotonly .trow > .chip .chip-text { display: none; }
  @container td-card (max-width: 200px) { .titles .trow > .chip { padding: 4px; } .titles .trow > .chip .chip-text { display: none; } }
`;

// Popup at the top of the card, over a backdrop: it stays in view on a long card.
const DIALOG_STYLE = `
  ha-card.dialog-open { position: relative; min-height: 220px; }
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 12px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #1c1c1c); color: var(--primary-text-color); width: min(92%, 340px); max-height: calc(100% - 24px);
           box-sizing: border-box; border-radius: 14px; padding: 16px; box-shadow: 0 8px 30px rgba(0,0,0,.4); display: flex; flex-direction: column; gap: 12px; }
  .modal .msg { font-size: 15px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .stepper { display: flex; align-items: center; justify-content: center; gap: 14px; }
  .stepper .val { font-size: 28px; font-weight: 400; min-width: 4ch; text-align: center; }
  .stepper .val small { font-size: 14px; color: var(--secondary-text-color); margin-left: 2px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
  .preset { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color);
            background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 16%, transparent); }
  .preset.on { border-color: color-mix(in srgb, var(--td-accent) 60%, transparent); color: var(--td-accent-text); font-weight: 500;
               background: color-mix(in srgb, var(--td-accent) 10%, transparent); }
  .field { font: inherit; font-size: 15px; width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; color: var(--primary-text-color);
           background: transparent; border: 1px solid color-mix(in srgb, var(--primary-text-color) 20%, transparent); }
  .field:focus { outline: 2px solid var(--primary-color, var(--td-accent)); outline-offset: -1px; }
`;

// The mini card: header and a compact row; its detail button switches it to the full card's content.
const MINI_STYLE = `
  :host { --td-natural-width: 300px; }
  .content.mini { flex-direction: row; align-items: center; gap: 12px; }
  .mini .info { gap: 4px; }
  .mini .line .icon { width: 14px; height: 14px; }
  .controls { display: flex; gap: 6px; flex: none; }
  @container td-card (max-width: 300px) {
    .content.mini { flex-wrap: wrap; row-gap: 8px; }
    .mini .controls { flex-basis: 100%; justify-content: flex-end; }
  }
`;

// Element names of Home Assistant dialogs (a more-info opened from the card): a click there is not "elsewhere".
const DIALOG_TAGS = new Set(["HA-MORE-INFO-DIALOG", "HA-DIALOG", "DIALOG"]);
const isOutside = (card, ev) => {
  const path = ev.composedPath();
  return !path.includes(card) && !path.some((n) => DIALOG_TAGS.has(n.tagName));
};

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app) a
// tap on something that is not clickable (the background, an empty spot, a card with no action) sends no click to the
// page. It counts when the press and the release are both outside the card (a slider dragged out of the card does not
// fold it), and a scroll does not count (the browser cancels the pointer). Keyboard clicks still go through the click
// event. `tap(ev)` (a press and a release at the same spot) is for the tests.
const watchOutside = (isOut, handler) => {
  let downOutside = false;
  const onDown = (ev) => {
    downOutside = isOut(ev);
  };
  const onUp = (ev) => {
    if (downOutside && isOut(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && isOut(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
  };
};
// After a popup closes, clicks on the card are ignored this long (the second click of a double click).
const CONFIRM_GUARD_MS = 400;
// Elements a click acts on, and how one is told from the others across renders (focus kept for keyboard users).
const FOCUS_SELECTOR = "[data-action], [data-entity], [data-keep]";
const focusKey = (el) => {
  const data = Object.entries({ ...el.dataset });
  return data.length ? `${el.tagName}|${JSON.stringify(data)}` : "";
};

// ---------------------------------------------------------------------------
// Card base
// ---------------------------------------------------------------------------

// What every card of this file shares: rendering only when something shown changed, no rewrite under a press, focus
// kept for keyboard users, folding sections, a popup at the top of the card, service calls.
// A card defines _build() (its model from the registries and the configuration), _entityIds(m), _render(), and may
// define _action(action, el, ev), _dialogHtml() / _dialogAction(action, el), _extraDeps(), _onConnect() / _onDisconnect().
class CardBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._inputs = {};
    // No rewrite of the card between a press and its click: Home Assistant updates the card several times a second,
    // and a rewrite under the pointer replaces the element pressed, so that the click lands on the card itself and
    // does nothing. The update held back is drawn once released: by the click (registered before the card's own
    // handler, which renders at once), else right after the release.
    this._onPress = () => {
      this._byPointer = true;
      this._pressing = true;
      window.addEventListener("pointerup", this._onPressEnd, true);
      window.addEventListener("pointercancel", this._onPressEnd, true);
    };
    this._onPressEnd = () => {
      window.removeEventListener("pointerup", this._onPressEnd, true);
      window.removeEventListener("pointercancel", this._onPressEnd, true);
      setTimeout(() => {
        this._pressing = false;
        if (this._dirty) this._update();
      }, 0);
    };
    this._onPressClick = (ev) => {
      if (ev.detail === 0) this._byPointer = false;
      this._pressing = false;
    };
    this.shadowRoot.addEventListener("pointerdown", this._onPress);
    this.shadowRoot.addEventListener("click", this._onPressClick);
    // From the keyboard, the focus is kept across rewrites (with the pointer it would draw the focus ring).
    this.shadowRoot.addEventListener("keydown", () => {
      this._byPointer = false;
    });
    this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    // Text typed in a field of the card is kept across rewrites (see _update); Enter in it acts as its button.
    this.shadowRoot.addEventListener("input", (ev) => {
      const key = ev.target?.dataset?.keep;
      if (key) this._inputs[key] = ev.target.value;
    });
    this.shadowRoot.addEventListener("keydown", (ev) => {
      const el = ev.target;
      if (ev.key === "Enter" && el?.dataset?.keep && el.dataset.submit) {
        ev.preventDefault();
        this._onClick({ composedPath: () => [{ dataset: { action: el.dataset.submit } }], stopPropagation() {}, detail: 0 });
        return;
      }
      // Enter / Space on an element with the button role acts as a click, as on a <button>.
      if ((ev.key !== "Enter" && ev.key !== " ") || el?.getAttribute?.("role") !== "button") return;
      ev.preventDefault();
      el.click();
    });
    this._onKey = (ev) => {
      if (ev.key !== "Escape" || !this._dialog) return;
      ev.stopPropagation();
      this._closeDialog();
    };
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this.toggleAttribute?.("hide-title", config.show_title === false);
    this.toggleAttribute?.("hide-subtitle", config.show_subtitle === false);
    this._html = "";
    this._lastDeps = null;
    this._model = null;
    this._configChanged?.();
    this._update();
  }

  // Home Assistant pushes a new hass on every state change of the whole instance: the card is only rebuilt when
  // something it shows changed (see _deps).
  set hass(hass) {
    this._hass = hass;
    const deps = this._deps();
    const prev = this._lastDeps;
    if (deps && prev && deps.length === prev.length && deps.every((d, i) => d === prev[i])) return;
    this._lastDeps = deps;
    this._update();
  }

  get hass() {
    return this._hass;
  }

  // The registries, the language, the theme, the state objects the card reads, its own data and the minute (the
  // "12 min ago" texts move on their own).
  _deps() {
    const h = this._hass;
    if (!h || !this._config) return null;
    const m = this._resolve();
    const ids = m ? this._entityIds(m) : [];
    return [h.entities, h.devices, h.areas, h.language, h.locale, h.themes?.darkMode, Math.floor(Date.now() / 6e4), ...this._extraDeps(), ...ids.map((id) => h.states[id])];
  }

  _extraDeps() {
    return [];
  }

  // The model is rebuilt when the registries or the set of entities change (a new entity, a device renamed).
  _resolve() {
    const h = this._hass;
    if (!h?.entities || !h?.devices) return null;
    const key = [h.entities, h.devices, h.areas, Object.keys(h.states).length];
    if (this._model && this._modelKey?.every((k, i) => k === key[i])) return this._model;
    this._modelKey = key;
    this._model = this._build();
    return this._model;
  }

  connectedCallback() {
    // A click elsewhere on the page folds the sections back to their defaults and closes the popup.
    this._outside ??= watchOutside(
      (ev) => isOutside(this, ev),
      () => {
        if (!this._toggled?.size && !this._dialog) return;
        this._toggled = new Map();
        if (this._dialog) this._closeDialog();
        else this._update();
      },
    );
    this._outside.on();
    if (this._dialog) window.addEventListener("keydown", this._onKey);
    clearInterval(this._tick);
    this._tick = setInterval(() => {
      if (this._hass) this.hass = this._hass;
    }, 60000);
    this._onConnect?.();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._resize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._fitWidth) return;
        this._fitWidth = w;
        cancelAnimationFrame(this._fitFrame);
        this._fitFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._resize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    this._update();
  }

  disconnectedCallback() {
    this._pressing = this._dirty = false;
    window.removeEventListener("pointerup", this._onPressEnd, true);
    window.removeEventListener("pointercancel", this._onPressEnd, true);
    clearInterval(this._tick);
    this._tick = null;
    this._outside?.off();
    window.removeEventListener("keydown", this._onKey);
    this._onDisconnect?.();
    this._resize?.disconnect();
    this._fitWidth = null;
    // Left (another dashboard view, a conditional card hidden): back to the defaults, so that the card does not come
    // back unfolded or with its popup open.
    this._toggled = new Map();
    this._dialog = null;
  }

  // The status pill goes right after the title only when the whole title and the pill's whole label fit on that row;
  // otherwise it takes a line of its own under the subtitle (.titles.below, the subtitle cut to one line). In the
  // banner (where that line may run over the picture), when the titles still run below the top of the ground strip or
  // out of the banner, and in the classic header when the label does not fit even alone, the pill keeps its dot alone,
  // beside the title (.titles.dotonly). Measured in fractional pixels.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const row = t.querySelector(".trow");
      const chips = row ? [...row.querySelectorAll(":scope > .chip")] : [];
      if (!chips.length || !row.getBoundingClientRect) continue;
      t.classList.remove("below", "dotonly");
      const name = row.querySelector(":scope > .name");
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const widths = chips.map((c) => c.getBoundingClientRect().width);
      let need = -gap;
      if (name && getComputedStyle(name).display !== "none") {
        name.style.flex = "none";
        need = name.getBoundingClientRect().width;
        name.style.flex = "";
      }
      for (const w of widths) need += gap + w;
      const room = row.getBoundingClientRect().width + 0.01;
      if (need <= room) continue;
      t.classList.add("below");
      const banner = t.closest(".banner");
      const cut = !banner && widths.some((w) => w > room);
      let out = false;
      if (banner) {
        const b = banner.getBoundingClientRect();
        const floor = b.bottom - (banner.querySelector(".td-ground")?.getBoundingClientRect().height ?? 10) + 0.5;
        out = [...t.querySelectorAll(".name, .sub, .chip")].some((e) => {
          const r = e.getBoundingClientRect();
          return r.height && (r.bottom > floor || r.top < b.top - 0.5 || r.right > b.right + 0.5);
        });
      }
      if (cut || out) t.classList.replace("below", "dotonly");
    }
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _locale() {
    return intlLocale(this._hass, this._config);
  }

  _s(id) {
    return id ? this._hass.states[id] : undefined;
  }

  // Service call whose failure Home Assistant already reports (toast): handled here so that it does not end up as
  // "Uncaught (in promise)".
  _call(domain, service, data) {
    const r = this._hass.callService(domain, service, data);
    if (r && typeof r.catch === "function") r.catch(() => {});
    return r;
  }

  // A websocket command, through hass.callWS (or the connection), resolved with null on error.
  async _ws(msg) {
    const h = this._hass;
    try {
      if (h.callWS) return await h.callWS(msg);
      if (h.connection?.sendMessagePromise) return await h.connection.sendMessagePromise(msg);
    } catch {
      return null;
    }
    return null;
  }

  _update() {
    if (!this._hass || !this._config) return;
    // Held back under a press (see the constructor): drawn once released.
    if (this._pressing) {
      this._dirty = true;
      return;
    }
    this._dirty = false;
    let html = this._render();
    if (this._dialog) {
      html = html.replace(/<ha-card(\s[^>]*)?>([\s\S]*)<\/ha-card>\s*$/, (_, attrs = "", inner) => {
        const a = attrs.includes('class="') ? attrs.replace('class="', 'class="dialog-open ') : `${attrs} class="dialog-open"`;
        return `<ha-card${a}>${inner}<style>${DIALOG_STYLE}</style>${this._dialogHtml()}</ha-card>`;
      });
    }
    if (html !== this._html) {
      const active = this.shadowRoot.activeElement;
      const field = active?.dataset?.keep ? { key: active.dataset.keep, start: active.selectionStart, end: active.selectionEnd } : null;
      const focused = this._dialog && active?.dataset?.action;
      const kept = this._dialog || this._byPointer ? null : this._focusedSpot();
      this._html = html;
      morph(this._drawRoot ? this._drawRoot() : this.shadowRoot, html);
      this._fitPill();
      // Fields get back what was typed, and the caret when one had the focus.
      for (const el of this.shadowRoot.querySelectorAll?.("[data-keep]") || []) {
        const v = this._inputs[el.dataset.keep];
        if (v !== undefined) el.value = v;
      }
      if (field) {
        const el = this.shadowRoot.querySelector(`[data-keep="${field.key}"]`);
        el?.focus?.({ preventScroll: true });
        el?.setSelectionRange?.(field.start, field.end);
      } else if (kept) this._restoreFocus(kept);
      if (this._dialog && !field) {
        const sel = focused ? `.modal [data-action="${focused}"]` : ".modal [data-keep], .modal .primary";
        this.shadowRoot.querySelector(sel)?.focus?.({ preventScroll: true });
      }
    }
    this._afterUpdate?.();
  }



  _focusedSpot() {
    const el = this.shadowRoot.activeElement;
    if (!el?.dataset) return null;
    const key = focusKey(el);
    if (!key) return null;
    const index = this._focusables(key).indexOf(el);
    return index < 0 ? null : { key, index };
  }

  _focusables(key) {
    return [...this.shadowRoot.querySelectorAll(FOCUS_SELECTOR)].filter((n) => focusKey(n) === key);
  }

  _restoreFocus({ key, index }) {
    this._focusables(key)[index]?.focus({ preventScroll: true });
  }

  _onClick(ev) {
    const path = ev.composedPath();
    const el = path.find((n) => n.dataset && (n.dataset.entity || n.dataset.action));
    if (!this._dialog && Date.now() - (this._dialogClosedAt ?? 0) < CONFIRM_GUARD_MS) {
      ev.stopPropagation();
      return;
    }
    if (this._dialog) {
      ev.stopPropagation();
      const action = el?.dataset.action;
      if (action === "dialog_cancel" || (action === "dialog_backdrop" && path[0] === el)) return this._closeDialog();
      if (action) this._dialogAction(action, el);
      return;
    }
    if (!el) return;
    ev.stopPropagation();
    const { action, entity } = el.dataset;
    if (action === "zoom") return this._toggleZoom(ev);
    if (action === "toggle_section") {
      const key = el.dataset.section;
      this._toggled = new Map(this._toggled).set(key, !this._isCollapsed(key));
      return this._update();
    }
    if (action && this._action(action, el, ev)) return;
    if (entity) this._moreInfo(entity);
  }

  _moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  _action() {
    return false;
  }

  _dialogAction() {}

  _dialogHtml() {
    return "";
  }

  _openDialog(d) {
    this._dialog = d;
    window.addEventListener("keydown", this._onKey);
    this._update();
    this.shadowRoot.querySelector(".modal [data-keep], .modal .primary")?.focus?.();
  }

  _closeDialog() {
    this._dialog = null;
    this._dialogClosedAt = Date.now();
    window.removeEventListener("keydown", this._onKey);
    this._update();
  }

  // The popup's frame: a message, the content and its buttons (cancel, then the main action).
  _modal(title, body, okLabel, okIcon, okDisabled = false) {
    return `<div class="backdrop" data-action="dialog_backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="msg">${esc(title)}</div>
        ${body}
        <div class="modal-actions">
          <button class="btn" data-action="dialog_cancel"><span>${esc(this._t("cancel"))}</span></button>
          <button class="btn primary" data-action="dialog_ok"${okDisabled ? " disabled" : ""}>${okIcon ? svgIcon(okIcon) : ""}<span>${esc(okLabel)}</span></button>
        </div>
      </div>
    </div>`;
  }

  _isCollapsed(key) {
    if (this._toggled?.has(key)) return this._toggled.get(key);
    return asList(this._config.collapsed ?? this.constructor.defaultCollapsed ?? []).includes(key);
  }

  _sectionTitle(key, icon, label, count = "") {
    const closed = this._isCollapsed(key);
    return `<div class="section-title toggle" role="button" tabindex="0" data-action="toggle_section" data-section="${key}" aria-expanded="${!closed}">${svgIcon(icon)}<span>${esc(
      label,
    )}</span>${count !== "" ? `<span class="count">${esc(count)}</span>` : ""}${svgIcon(ICONS.chevron_down, "chevron")}</div>`;
  }

  // A folding section: its title, and its body unless folded.
  _section(key, icon, label, count, body) {
    return `<div class="section">${this._sectionTitle(key, icon, label, count)}${this._isCollapsed(key) ? "" : body}</div>`;
  }

  // The model ready to draw, or the error card to draw instead: no registries (Home Assistant too old), or nothing to
  // show (_emptyKey(m) names the message).
  _ready() {
    const m = this._resolve();
    if (!m) return { error: this._errorCard("no_registry") };
    const empty = this._emptyKey(m);
    return empty ? { error: this._errorCard(empty) } : { m };
  }

  _emptyKey() {
    return null;
  }

  _errorCard(key) {
    return `<style>${BASE_STYLE}</style><ha-card><div class="warning">${esc(this._t(key))}</div></ha-card>`;
  }

  // Header: the tinted round icon (its tint follows `cls`), the title and subtitle, the status chip on the title's line.
  _header({ icon, cls = "accent", title, sub, chip, extra = "" }) {
    return `
      <div class="header">
        <div class="type-icon ${cls}">${extra}${svgIcon(icon)}</div>
        <div class="titles">
          <div class="trow"><div class="name">${esc(title)}</div>${
            chip
              ? `<span class="chip ${chip.cls}${chip.entity ? " clickable" : ""}"${moreInfo(chip.entity)} title="${esc(chip.text)}" aria-label="${esc(
                  chip.text,
                )}"><span class="dot"></span><span class="chip-text">${esc(chip.text)}</span></span>`
              : ""
          }</div>
          ${sub ? `<div class="sub" title="${esc(sub)}">${esc(sub)}</div>` : ""}
        </div>
        ${this._zoomButton()}
      </div>`;
  }

  _zoomButton() {
    return "";
  }

  _toggleZoom() {}
}

// The mini card is the full card drawn compact: its detail button (top right, `zoom: false` removes it) switches it
// to the full card's content and back, and a click anywhere else on the page brings the compact view back.
const withMini = (Full) =>
  class extends Full {
    constructor() {
      super();
      this._unzoom = watchOutside(
        (ev) => isOutside(this, ev),
        () => {
          if (this._zoomed && !this._dialog) this._setZoom(false);
        },
      );
    }

    connectedCallback() {
      super.connectedCallback();
      this._unzoom.on();
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._unzoom.off();
      // Back to the compact view once off the screen (see the full card).
      this._zoomed = false;
    }

    getCardSize() {
      return this._zoomed ? super.getCardSize() : 3;
    }

    getGridOptions() {
      return { ...(this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 }), rows: "auto" };
    }

    _zoomButton() {
      if (this._config.zoom === false) return "";
      const z = this._zoomed;
      const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
      return `<button class="zoom" data-action="zoom" title="${label}" aria-label="${label}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
    }

    _setZoom(on) {
      this._zoomed = on;
      this._update();
      this.dispatchEvent(new CustomEvent("iron-resize", { bubbles: true, composed: true }));
    }

    _toggleZoom(ev) {
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
    }

    _render() {
      return this._zoomed ? super._render() : this._renderMini();
    }
  };

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  ["en", "English"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["sr", "Српски"],
  ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["pt", "Português (Portugal)"],
  ["pl", "Polski"],
  ["ro", "Română"],
  ["da", "Dansk"],
  ["sv", "Svenska"],
  ["bg", "Български"],
  ["ru", "Русский"],
  ["uk", "Українська"],
  ["hu", "Magyar"],
  ["sk", "Slovenčina"],
  ["cs", "Čeština"],
  ["sl", "Slovenščina"],
  ["lv", "Latviešu"],
  ["el", "Ελληνικά"],
];

// An editor is a ha-form: `fields` (the card's options), `toggles` ([name, default] booleans), `defaults` (options
// left out of the YAML when at their default), `sections` (the foldable sections, for `collapsed`). Options written
// in YAML that the form does not show are kept.
class EditorBase extends HTMLElement {
  static get toggles() {
    return [];
  }

  static get defaults() {
    return {};
  }

  static get sections() {
    return [];
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _fields() {
    return [];
  }

  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = this.constructor.toggles;
    const sections = this.constructor.sections;
    return [
      { name: "title", selector: { text: {} } },
      ...this._fields(),
      ...(toggles.length ? [{ type: "grid", name: "", schema: toggles.map(([name]) => ({ name, selector: { boolean: {} } })) }] : []),
      ...(sections.length ? [{ name: "collapsed", selector: { select: { multiple: true, mode: "list", options: sections.map((value) => ({ value, label: tr(value) })) } } }] : []),
      { name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } } },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    const toggles = this.constructor.toggles;
    const defaults = { ...Object.fromEntries(toggles), ...this.constructor.defaults };
    if (!this._form) {
      this._form = document.createElement("ha-form");
      // A field's label is its `<name>_field` text when the card also uses `<name>` for something else (a section).
      this._form.computeLabel = (s) => t(this._hass, this._config, STRINGS.en[`${s.name}_field`] ? `${s.name}_field` : s.name);
      this._form.computeHelper = (s) => (STRINGS.en[`${s.name}_helper`] ? t(this._hass, this._config, `${s.name}_helper`) : undefined);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = { ...ev.detail.value };
        for (const [k, v] of Object.entries(config)) {
          // Keep the YAML minimal: no empty values, no options left at their default.
          if (v === "" || v === undefined || v === null || (Array.isArray(v) && !v.length) || (k in defaults && JSON.stringify(v) === JSON.stringify(defaults[k]))) delete config[k];
        }
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      this._form.data = { ...defaults, ...this._config };
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};

const register = (cards, url) => {
  for (const [name, cls] of cards) define(name, cls);
  window.customCards = window.customCards || [];
  for (const [type, , card] of cards) {
    if (card && !window.customCards.some((c) => c.type === type)) window.customCards.push({ type, ...card, preview: true, documentationURL: url });
  }
};

// ---------------------------------------------------------------------------
// Lists and items
// ---------------------------------------------------------------------------

const _cache = new WeakMap();

// The to-do lists of the configuration, else every to-do entity: [{ entity, name, platform }].
const resolve = (hass, config) => {
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
const dueOf = (item, now = Date.now()) => {
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
const keyOf = (it) => it?.uid || it?.summary || "";

// A due date as the value of a date field ("2026-11-17") or of a date and time field ("2026-11-17T08:00").
const dueValue = (due, withTime) => {
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
const dueFields = (value, withTime) => {
  const v = String(value || "").trim();
  if (!v) return { [withTime ? "due_datetime" : "due_date"]: null };
  if (withTime) return { due_datetime: v.includes("T") ? `${v.replace("T", " ")}:00` : `${v} 00:00:00` };
  return { due_date: v.slice(0, 10) };
};

// Items in the order asked: as the list keeps them (manual), by due date (undated last) or by name.
const sortItems = (items, sort) => {
  const list = [...items];
  if (sort === "due") return list.sort((a, b) => (dueOf(a)?.at ?? Number.MAX_SAFE_INTEGER) - (dueOf(b)?.at ?? Number.MAX_SAFE_INTEGER));
  if (sort === "alpha") return list.sort((a, b) => String(a.summary).localeCompare(String(b.summary)));
  return list;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const TODO_STYLE = `
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
const todoArt = (shopping, state = "pending") => {
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
const listState = (sum) => (sum.overdue ? "overdue" : sum.open === 0 ? "done" : "pending");

// Night picture: forced by illustration_theme, else Home Assistant's dark theme alone (a light theme keeps the day
// picture after sunset).
const isNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// The card's list (todoArt) placed in the scene: an inner <svg> cropped to the clipboard.
const placedArt = (shopping, state, x, y, w, h) =>
  todoArt(shopping, state).replace('<svg viewBox="0 0 120 100"', `<svg class="td-list" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${shopping ? "26 5 80 84" : "32 5 72 84"}"`);

// The header's picture, 200 × 80 at the right of the banner, over a 10 px tiled floor strip edge to edge.
// A to-do list: a kitchen, the list stuck on the fridge door (a red note on the freezer when something is late,
// a green tick magnet once all is done). A shopping list: a supermarket aisle, a trolley rolling along the shelves
// (parked and full once all is bought), the list on the floor at the end of the aisle.
// `uid` keeps each card's mask id apart on a page with several cards.
const sceneSvg = (shopping, state, uid) => {
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
const BANNER_STYLE = `
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
const TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

let _uidCount = 0;

class TodoCard extends CardBase {
  constructor() {
    super();
    // Keeps the ids of each card's picture apart on a page with several cards.
    this._uid = ++_uidCount;
  }

  static get defaultCollapsed() {
    return ["completed"];
  }

  static getConfigElement() {
    return document.createElement("todo-card-editor");
  }

  getCardSize() {
    return 6;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return m.lists.map((l) => l.entity);
  }

  _emptyKey(m) {
    return m.lists.length ? null : "no_data";
  }

  _extraDeps() {
    return [this._items, this._tab, this._ticked];
  }

  _configChanged() {
    this._tab = null;
  }

  // The list shown: the tab picked, else `entity`, else the first list.
  _list(m) {
    return m.lists.find((l) => l.entity === this._tab) || m.lists.find((l) => l.entity === this._config.entity) || m.lists[0];
  }

  _afterUpdate() {
    const m = this._resolve();
    const list = m?.lists.length ? this._list(m) : null;
    if (list) this._subscribe(list.entity);
  }

  _onDisconnect() {
    this._unsubscribe();
  }

  // The items of the list shown, live: Home Assistant's to-do subscription (else a one-off read).
  _subscribe(entity) {
    if (this._subEntity === entity || !this._hass) return;
    this._unsubscribe();
    this._subEntity = entity;
    this._items = undefined;
    const conn = this._hass.connection;
    const take = (items) => {
      if (this._subEntity !== entity) return;
      this._items = asList(items);
      this._lastDeps = null;
      this._update();
    };
    if (conn?.subscribeMessage) {
      this._unsub = conn.subscribeMessage((ev) => take(ev?.items), { type: "todo/item/subscribe", entity_id: entity });
      this._unsub?.catch?.(() => {});
    } else {
      this._ws({ type: "todo/item/list", entity_id: entity }).then((res) => take(res?.items));
    }
  }

  _unsubscribe() {
    const u = this._unsub;
    this._unsub = null;
    this._subEntity = null;
    Promise.resolve(u)
      .then((f) => typeof f === "function" && f())
      .catch(() => {});
  }

  _supports(list, feature) {
    return ((this._s(list.entity)?.attributes?.supported_features ?? 0) & FEATURE[feature]) !== 0;
  }

  // The kind of due date the list takes: "datetime" (a date and a time), "date", or null.
  _dueKind(list) {
    if (this._supports(list, "due_datetime")) return "datetime";
    return this._supports(list, "due_date") ? "date" : null;
  }

  _dueField(kind) {
    if (!kind) return "";
    return `<label class="due-field"><span>${esc(this._t("due"))}</span><input class="field" type="${kind === "datetime" ? "datetime-local" : "date"}" data-keep="due" aria-label="${esc(this._t("due"))}"></label>`;
  }

  // The to-do items and the completed ones, with an item just ticked still among the to-do items while it animates.
  _split() {
    const now = Date.now();
    const ticked = this._ticked || new Map();
    const todo = [];
    const done = [];
    for (const it of this._items || []) {
      const t = ticked.get(keyOf(it));
      const live = t && now - t.at < TICK_MS;
      if (live && t.to === "completed") todo.push({ ...it, ticking: true });
      else if (live && t.to === "needs_action") todo.push({ ...it, status: "needs_action" });
      else if (it.status === "completed") done.push(it);
      else todo.push(it);
    }
    return { todo: sortItems(todo, this._config.sort), done };
  }

  _summary(m) {
    const list = this._list(m);
    const { todo, done } = this._split();
    const late = todo.filter((it) => !it.ticking && dueOf(it)?.cls === "crit");
    const dueToday = todo.filter((it) => !it.ticking && dueOf(it)?.cls === "warn");
    const overdue = late.length;
    const count = Number(this._s(list.entity)?.state);
    const open = this._items ? todo.filter((it) => !it.ticking).length : Number.isFinite(count) ? count : null;
    // The pill says how the list stands (late, due today, up to date, all done); the count of items still to do is the
    // hero's big number. Before the items are loaded, the dates are not known: the pill gives the entity's count.
    let chip = null;
    if (overdue) chip = { cls: "crit", text: this._t("overdue_n", { n: overdue }) };
    else if (dueToday.length) chip = { cls: "warn", text: this._t("due_today_n", { n: dueToday.length }) };
    else if (open && this._items === undefined) chip = { cls: "accent", text: this._t("todo_n", { n: open }) };
    else if (open) chip = { cls: "accent", text: this._t("up_to_date") };
    else if (open === 0) chip = { cls: "ok", text: this._t("all_done") };
    return { list, todo, done, open, overdue, late, dueToday, chip };
  }

  _dueText(due) {
    const today = startOfDay(Date.now());
    const day = Math.round((startOfDay(due.at) - today) / DAY_MS);
    const time = due.allDay ? "" : ` ${fmtTime(this._hass, this._config, due.at)}`;
    if (day === 0) return `${this._t("today")}${time}`;
    if (day === 1) return `${this._t("tomorrow")}${time}`;
    if (day === -1) return `${this._t("yesterday")}${time}`;
    const opts = Math.abs(day) < 7 ? { weekday: "short" } : { month: "short", day: "numeric" };
    return `${new Intl.DateTimeFormat(this._locale(), opts).format(new Date(due.at))}${time}`;
  }

  _item(it, canEdit) {
    const key = keyOf(it);
    const done = it.status === "completed" || it.ticking;
    const due = dueOf(it);
    const label = this._t(done ? "mark_todo" : "mark_done", { item: it.summary });
    const dueLine = due ? `<span class="due ${done ? "idle" : due.cls}">${svgIcon(ICONS.calendar)}<span>${esc(this._dueText(due))}</span></span>` : "";
    // A short detail (a quantity: "1 kg", "6") as a pill on the right, a longer one under the item.
    const short = it.description && String(it.description).length <= 14;
    const chip = short ? `<span class="pill" title="${esc(it.description)}">${esc(it.description)}</span>` : "";
    const text = `<span class="s">${esc(it.summary)}</span>${it.description && !short ? `<span class="d">${esc(it.description)}</span>` : ""}${dueLine}`;
    return `<div class="item${done ? " done" : ""}${it.ticking ? " ticking" : ""}">
      ${
        canEdit
          ? `<button class="check" role="checkbox" aria-checked="${done}" data-action="toggle" data-uid="${esc(key)}" title="${esc(label)}" aria-label="${esc(label)}">${TICK}</button>`
          : `<button class="check" role="checkbox" aria-checked="${done}" aria-disabled="true" disabled title="${esc(this._t("read_only"))}" aria-label="${esc(it.summary)}">${TICK}</button>`
      }
      ${canEdit ? `<div class="text clickable" role="button" tabindex="0" data-action="edit" data-uid="${esc(key)}" aria-label="${esc(this._t("edit_item", { item: it.summary }))}">${text}</div>` : `<div class="text">${text}</div>`}
      ${chip}
    </div>`;
  }

  _itemList(items, list, max) {
    if (!items.length) return "";
    const canEdit = this._supports(list, "update");
    const shown = max ? items.slice(0, max) : items;
    const more = items.length - shown.length;
    return `<div class="items">${shown.map((it) => this._item(it, canEdit)).join("")}</div>${more > 0 ? `<div class="more">${esc(this._t("more_n", { n: more }))}</div>` : ""}`;
  }

  _tabs(m, list) {
    if (m.lists.length < 2 || this._config.show_tabs === false) return "";
    return `<div class="tabs" role="tablist">${m.lists
      .map((l) => {
        const n = Number(this._s(l.entity)?.state);
        const on = l.entity === list.entity;
        return `<button class="tab" role="tab" aria-selected="${on}" data-action="tab" data-list="${esc(l.entity)}">${esc(l.name)}${Number.isFinite(n) ? `<span class="n">${n}</span>` : ""}</button>`;
      })
      .join("")}</div>`;
  }

  _adder(list) {
    if (this._config.show_add === false || !this._supports(list, "create")) return "";
    const label = this._t("add_placeholder", { list: list.name });
    const due = this._dueKind(list)
      ? `<button class="btn round" data-action="add_dialog" title="${esc(this._t("add_with_due"))}" aria-label="${esc(this._t("add_with_due"))}">${svgIcon(ICONS.calendar)}</button>`
      : "";
    return `<div class="adder"><input class="field" type="text" data-keep="new" data-submit="add" placeholder="${esc(label)}" aria-label="${esc(label)}" enterkeyhint="done" autocomplete="off">
      ${due}<button class="btn round primary" data-action="add" title="${esc(this._t("add"))}" aria-label="${esc(this._t("add"))}">${svgIcon(ICONS.plus)}</button></div>`;
  }

  // The summary: what is left to do, then what is late, due today and done, beside the illustration.
  _heroLines(sum, max = 3) {
    const lines = [];
    const one = (list, one_, many) => (list.length === 1 ? this._t(one_, { item: list[0].summary }) : this._t(many, { n: list.length }));
    if (sum.late.length) lines.push(["crit", ICONS.alert, one(sum.late, "overdue_item", "overdue_n")]);
    if (sum.dueToday.length) lines.push(["warn", ICONS.calendar, one(sum.dueToday, "due_today_item", "due_today_n")]);
    if (sum.done.length) lines.push(["ok", ICONS.done_all, this._t("done_n", { n: sum.done.length })]);
    if (!sum.todo.length && this._items !== undefined) lines.unshift(["ok", ICONS.done_all, this._t("nothing_to_do")]);
    // A line that says word for word what the header pill says is hidden (.pill-echo); it comes back on a card so
    // narrow that the pill keeps only its dot.
    const pill = sum.chip?.text;
    let shown = 0;
    return lines
      .filter(([, , text]) => text === pill || shown++ < max)
      .map(([cls, icon, text]) => `<div class="line ${cls}${text === pill ? " pill-echo" : ""}">${svgIcon(icon)}<span>${esc(text)}</span></div>`)
      .join("");
  }

  _hero(sum) {
    if (this._config.show_hero === false) return "";
    const loading = sum.open === null || sum.open === undefined;
    const big = loading ? "" : `<div class="big"><b>${sum.open}</b><span>${esc(this._t("to_do"))}</span></div>`;
    // With the illustrated header, the list's picture is in the banner.
    const art = this._config.illustration === false ? `<div class="hero-art">${todoArt(isShopping(sum.list), listState(sum))}</div>` : "";
    return `<div class="hero">${art}<div class="hero-body">
      ${big}${this._heroLines(sum)}</div></div>`;
  }

  // The header: the illustrated banner (`illustration: false`: the classic header). The icon's colour is the list's
  // state: grey while loading, red when something is late, green once all is done, the accent otherwise.
  _head(sum, title, sub) {
    const shopping = isShopping(sum.list);
    const state = listState(sum);
    const loading = sum.open === null || sum.open === undefined;
    const cls = loading && !sum.overdue ? "idle" : { overdue: "crit", done: "ok", pending: "accent" }[state];
    const icon = shopping ? ICONS.cart : ICONS.list;
    if (this._config.illustration === false) return this._header({ icon, cls, title, sub, chip: sum.chip });
    const night = isNight(this._hass, this._config);
    const chip = sum.chip ? `<span class="chip ${sum.chip.cls}" title="${esc(sum.chip.text)}" aria-label="${esc(sum.chip.text)}"><span class="dot"></span><span class="chip-text">${esc(sum.chip.text)}</span></span>` : "";
    const rest = sub && sub !== sum.chip?.text ? `<span class="txt">${esc(sub)}</span>` : "";
    return `<div class="td-banner td-${shopping ? "shop" : "todo"} td-${state}${night ? " night" : ""}">${sceneSvg(shopping, state, this._uid)}
      <div class="td-htext"><div class="type-icon ${cls}">${svgIcon(icon)}</div><div class="titles"><div class="tstack"><div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${
        rest ? `<div class="sub" title="${esc(sub)}">${rest}</div>` : ""
      }</div></div></div>${this._zoomButton()}</div>`;
  }

  // The banner's styles, only when it is shown.
  _bannerStyle() {
    return this._config.illustration === false ? "" : BANNER_STYLE;
  }

  // The date pickers' icon in the dashboard's theme.
  _scheme() {
    // A theme without the dark mode flag: the system's preference.
    const dark = this._hass?.themes?.darkMode ?? window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return dark ? ":host { --td-scheme: dark; }" : "";
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const { list } = sum;
    const parts = [this._hero(sum), this._tabs(m, list), this._adder(list)];
    if (this._items === undefined) parts.push(`<div class="empty">${esc(this._t("loading"))}</div>`);
    else if (!sum.todo.length && c.show_hero === false) parts.push(`<div class="alldone">${svgIcon(ICONS.done_all)}<span>${esc(this._t("nothing_to_do"))}</span></div>`);
    else parts.push(this._itemList(sum.todo, list, Number(c.max_items) || 0));
    if (c.show_completed !== false && sum.done.length) {
      const clear = this._supports(list, "delete")
        ? `<div class="row-end"><button class="btn" data-action="clear">${svgIcon(ICONS.sweep)}<span>${esc(this._t("clear_completed"))}</span></button></div>`
        : "";
      parts.push(this._section("completed", ICONS.done_all, this._t("completed"), sum.done.length, `${this._itemList(sum.done, list, 0)}${clear}`));
    }
    const title = c.title || (m.lists.length > 1 && c.show_tabs !== false ? this._t("lists") : list.name);
    const sub = m.lists.length > 1 && c.show_tabs !== false ? list.name : sum.open && c.show_hero === false ? this._t("todo_n", { n: sum.open }) : "";
    return `<style>${BASE_STYLE}${TODO_STYLE}${this._bannerStyle()}${this._scheme()}</style>
      <ha-card>
        ${this._head(sum, title, sub)}
        <div class="content">${parts.filter(Boolean).join("")}</div>
      </ha-card>`;
  }

  _uidItem(key) {
    return (this._items || []).find((it) => keyOf(it) === key);
  }

  _action(action, el) {
    const m = this._resolve();
    const list = this._list(m);
    if (action === "tab") {
      this._tab = el.dataset.list;
      this._update();
      return true;
    }
    if (action === "add") {
      const text = String(this._inputs.new || "").trim();
      if (text) this._call("todo", "add_item", { entity_id: list.entity, item: text });
      this._inputs.new = "";
      this._update();
      return true;
    }
    if (action === "clear") {
      this._call("todo", "remove_completed_items", { entity_id: list.entity });
      return true;
    }
    if (action === "add_dialog") {
      // The text typed in the add field goes on into the popup, to give it a due date.
      this._inputs.due = "";
      this._openDialog({ add: true, entity: list.entity, name: list.name, due: this._dueKind(list) });
      return true;
    }
    const it = this._uidItem(el.dataset.uid);
    if (!it) return false;
    if (!this._supports(list, "update")) return false;
    if (action === "toggle") {
      const to = it.status === "completed" ? "needs_action" : "completed";
      this._call("todo", "update_item", { entity_id: list.entity, item: keyOf(it), status: to });
      this._ticked = new Map(this._ticked).set(keyOf(it), { to, at: Date.now() });
      // Drawn again once the tick is over (_split then shows the item where the list puts it).
      setTimeout(() => {
        this._lastDeps = null;
        this._update();
      }, TICK_MS + 50);
      this._update();
      return true;
    }
    if (action === "edit") {
      this._inputs.edit_name = it.summary;
      this._inputs.edit_desc = it.description || "";
      const due = this._dueKind(list);
      this._inputs.due = dueValue(it.due, due === "datetime");
      this._openDialog({
        uid: keyOf(it),
        entity: list.entity,
        summary: it.summary,
        description: this._supports(list, "description"),
        remove: this._supports(list, "delete"),
        due,
        dueWas: this._inputs.due,
      });
      return true;
    }
    return false;
  }

  _dialogAction(action) {
    const d = this._dialog;
    if (action === "dialog_ok" && d.add) {
      const text = String(this._inputs.new || "").trim();
      const due = d.due && String(this._inputs.due || "").trim() ? dueFields(this._inputs.due, d.due === "datetime") : {};
      this._closeDialog();
      if (text) this._call("todo", "add_item", { entity_id: d.entity, item: text, ...due });
      this._inputs.new = "";
      this._inputs.due = "";
      this._update();
    } else if (action === "dialog_ok") {
      const name = String(this._inputs.edit_name || "").trim();
      const data = { entity_id: d.entity, item: d.uid };
      if (name && name !== d.summary) data.rename = name;
      if (d.description) data.description = String(this._inputs.edit_desc || "");
      if (d.due && String(this._inputs.due || "") !== d.dueWas) Object.assign(data, dueFields(this._inputs.due, d.due === "datetime"));
      this._closeDialog();
      if (Object.keys(data).length > 2) this._call("todo", "update_item", data);
    } else if (action === "remove") {
      this._closeDialog();
      this._call("todo", "remove_item", { entity_id: d.entity, item: d.uid });
    }
  }

  _dialogHtml() {
    const d = this._dialog;
    if (d.add) {
      const label = this._t("add_placeholder", { list: d.name });
      const body = `<input class="field" type="text" data-keep="new" data-submit="dialog_ok" placeholder="${esc(label)}" aria-label="${esc(label)}" autocomplete="off">${this._dueField(d.due)}`;
      return this._modal(this._t("add_to", { list: d.name }), body, this._t("add"), ICONS.plus);
    }
    const fields = `<input class="field" type="text" data-keep="edit_name" data-submit="dialog_ok" aria-label="${esc(this._t("name"))}" autocomplete="off">${
      d.description ? `<input class="field" type="text" data-keep="edit_desc" data-submit="dialog_ok" placeholder="${esc(this._t("details"))}" aria-label="${esc(this._t("details"))}" autocomplete="off">` : ""
    }${this._dueField(d.due)}${d.remove ? `<div><button class="btn danger" data-action="remove">${svgIcon(ICONS.delete)}<span>${esc(this._t("delete"))}</span></button></div>` : ""}`;
    return this._modal(this._t("edit_item", { item: d.summary }), fields, this._t("save"), ICONS.check);
  }
}

class TodoMiniCard extends withMini(TodoCard) {
  static getConfigElement() {
    return document.createElement("todo-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const { list } = sum;
    // The summary lines, then the first items still to do.
    let body = `<div class="empty">${esc(this._t("loading"))}</div>`;
    if (this._items !== undefined) {
      const named = new Set([...sum.late, ...sum.dueToday].map(keyOf));
      const rest = sum.todo.filter((it) => !it.ticking && !named.has(keyOf(it)));
      const n = Number(c.max_items) || 2;
      const names = rest.slice(0, n).map((it) => it.summary).join(", ");
      const more = rest.length > n ? ` ${this._t("more_n", { n: rest.length - n })}` : "";
      // The pill says how the list stands: the count still to do leads the line of the other items.
      const count = sum.open ? this._t("todo_n", { n: sum.open }) : "";
      const text = [count, names + more].filter(Boolean).join(" · ");
      body = `${this._heroLines(sum, 2)}${text ? `<div class="line">${svgIcon(ICONS.list)}<span>${esc(text)}</span></div>` : ""}`;
    }
    const art = c.show_hero === false || c.illustration !== false ? "" : `<div class="hero-art">${todoArt(isShopping(list), listState(sum))}</div>`;
    const add =
      c.show_add !== false && this._supports(list, "create")
        ? `<div class="controls"><button class="btn round primary" data-action="add_dialog" title="${esc(this._t("add_to", { list: list.name }))}" aria-label="${esc(this._t("add_to", { list: list.name }))}">${svgIcon(ICONS.plus)}</button></div>`
        : "";
    return `<style>${BASE_STYLE}${TODO_STYLE}${MINI_STYLE}${this._bannerStyle()}${this._scheme()}</style>
      <ha-card>
        ${this._head(sum, c.title || list.name, "")}
        <div class="content mini">${art}<div class="info">${body}</div>${add}</div>
      </ha-card>`;
  }
}

// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------

class TodoCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hero", true],
      ["show_tabs", true],
      ["show_add", true],
      ["show_completed", true],
    ];
  }

  static get defaults() {
    return { sort: "manual", collapsed: ["completed"], illustration_theme: "auto" };
  }

  static get sections() {
    return ["completed"];
  }

  _fields() {
    const tr = (k) => t(this._hass, this._config, k);
    return [
      { name: "entities", selector: { entity: { multiple: true, domain: "todo" } } },
      { name: "entity", selector: { entity: { domain: "todo" } } },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "sort", selector: { select: { mode: "dropdown", options: ["manual", "due", "alpha"].map((value) => ({ value, label: tr(`sort_${value}`) })) } } },
          { name: "max_items", selector: { number: { min: 0, max: 100, step: 1, mode: "box" } } },
        ],
      },
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus the detail button.
class TodoMiniCardEditor extends TodoCardEditor {
  static get toggles() {
    return [...TodoCardEditor.toggles, ["zoom", true]];
  }
}

register(
  [
    ["todo-card", TodoCard, { name: "To-do Card", description: "To-do and shopping lists of every to-do integration: tabs, tick off, add, due dates, edit, completed items folded away." }],
    ["todo-mini-card", TodoMiniCard, { name: "To-do Mini Card", description: "Compact to-do list: the first items to tick off and a button to add one." }],
    ["todo-card-editor", TodoCardEditor],
    ["todo-mini-card-editor", TodoMiniCardEditor],
  ],
  "https://github.com/juju35/ha-todo-card",
);

console.info(`%c TODO-CARD %c v${VERSION} `, "color: white; background: #1e88e5; font-weight: 700;", "color: #1e88e5; background: white; font-weight: 700;");

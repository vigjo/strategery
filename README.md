# Strategery

A single-player, menu-only civilization sandbox. Install with `npm ci`, start with `npm run dev`, test with `npm test`, and build with `npm run build`.

Choose a city focus, research Agriculture, unlock buildings, and pursue Astronomy. Food surplus grows the city; a deficit immediately costs one citizen. Production advances only the first queued building; science advances selected research. Unused yields and completion overflow are not banked. Changing research discards its progress, with confirmation. Gold accumulates but has no spending action yet.

The header shows rates, food consumption and gold treasury. Project estimates assume current output; later changes to population and buildings can change them. Queue estimates include preceding projects.

Saves stay in this browser. Export a JSON backup to keep a run elsewhere. Imports validate before replacing a game. Unreadable saves block gameplay/autosave until you import a valid save or explicitly start over; export the original first for recovery. Legacy snapshots migrate on the next save. Last-turn reports are transient and cleared when loading.

`src/engine` contains pure rules and content. `src/ui` owns React, local SVG icons and display styling. `src/persist.ts` validates and stores snapshots. No backend is required.

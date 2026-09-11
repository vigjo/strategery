# Strategery: project audit and next steps

Audit date: September 10, 2026. Scope: current source, content, persistence, UI markup/styles, and local build/test checks. This is a source audit, not a fresh browser usability test or dependency vulnerability scan. No gameplay changes are included.

Verification: `npm test` passed all 12 tests; `npm run build` passed TypeScript checking and the Vite production build. Both initially encountered sandbox filesystem restrictions and succeeded when rerun outside that sandbox. The audit document is the only source-controlled change.

## Assessment

The existing prototype is a useful foundation: a pure TypeScript reducer, content definitions separate from rules, a small React presentation layer, and local saves. Keep that structure. The next milestone should make one complete progression run understandable and satisfying, with a consistent icon system and clearer feedback.

Today there is one city, four buildings, six technologies, four focus options, and an Astronomy victory flag. There are no icon assets, map, opponent, backend, or action log. The earlier proposed action log was not implemented; only the latest state and last-turn events are persisted.

## Findings, in priority order

### 1. High: saves can prevent the app from loading

Evidence: `src/persist.ts:11–14` reads storage outside the try block and casts parsed JSON directly to GameState. Valid JSON such as `{}` passes parsing, then fails when the UI/engine accesses nested fields. Storage reads, writes, and removal can also throw, and the application has no recovery or unsaved-state message.

Plan: validate a versioned save envelope, handle storage errors, preserve invalid saves for export/recovery, and offer an explicit fresh start. Do not silently overwrite a failed load. Test malformed JSON, malformed state, unsupported versions, and failed writes.

### 2. High for game feel: displayed resources do not represent available resources

Evidence: `src/engine/reduce.ts:88–114` adds every yield to stockpiles, but food consumption uses only this turn's food. Construction and research similarly use this turn's yield without spending their displayed totals. Gold has no spending action. The UI presents all four as stockpiles.

Concrete example: after ten food-focused turns the initial city reaches population 3 and displays 40 food. Switching to science produces 2 food against 3 consumption, immediately losing a citizen despite that displayed total.

This behavior is implemented deliberately in comments, so treat it as a design/communication problem rather than an accidental arithmetic bug. Recommended first revision: show food income, consumption, net growth and the growth bin; production and science as rates plus project progress; gold as a treasury. Remove the misleading lifetime totals from the main HUD. Actual food reserves can be a later mechanic if desired.

### 3. Medium: changing plans has hidden costs

Evidence: `src/engine/reduce.ts:197–201` resets research progress on a different selection, while TechPanel offers a normal Research button with no explanation. Construction and research overflow are discarded on completion; the queue has no cancel or reorder action.

Plan: retain progress per technology when switching. Explicitly define overflow behavior before changing it; recommend carrying production to the next queued project and preserving science overflow for the next selected technology. Add queue cancellation/reordering with documented progress rules only after the resource model is settled.

### 4. Medium: progression rewards are uneven

Evidence: the Market produces gold with no spending route. Astronomy needs Writing and Crafting but no buildings, so buildings are optional investments. A science-focused population-2 city produces 3 science per turn and can complete Agriculture, Pottery, Crafting, Writing, and Astronomy in 70 end-turn actions without constructing anything (7 + 10 + 12 + 14 + 27, derived from current costs/rates). This is a baseline, not proof of the optimal strategy.

Plan: use that baseline to compare growth/building strategies. Give gold one useful sink, such as a limited construction-rush action, rather than expanding the tech tree immediately. Pick a target run length after playing the clearer UI; measure first unlock, first building, decision frequency, and victory turn. Avoid adding several new resource systems at once.

### 5. Medium: the UI communicates state mostly through text

Evidence: App, CityPanel and TechPanel use textual resource totals, numeric progress and badges. There are no icons, progress bars, completion highlights, growth forecasts, or starvation previews. Focus selection is styled but has no `aria-pressed`. Repeated Queue and Research buttons have generic accessible names. New game immediately replaces the save.

Plan: add consistent icons with labels, progress bars, forecasts, explicit selected states, and a clear next-turn summary. Put New game in a secondary menu with confirmation or recoverable reset. Keep the menu-only scope.

### 6. Medium: coverage misses the most fragile behavior

Evidence: 12 tests in one engine test file. The test named “rejects duplicate queue and already-built” only checks an already-built building through the helper; it never queues a duplicate. There are no persistence/UI tests, no starvation regression, no research-switch regression, no overflow assertions, and no whole-run test. Completion tests use broad turn bounds rather than exact boundaries.

Plan: add targeted cases for those behaviors, reducer immutability, exact completion thresholds, and a complete deterministic run. Add a small browser smoke path for selecting research, ending turns, completing a building, reloading, and resetting. Do not chase a coverage percentage.

### 7. Low now: architecture and maintenance gaps

UI panels duplicate availability logic already present in the engine. Invalid runtime IDs can crash content lookups even though TypeScript guards normal authored calls. No README or CI configuration is present in the checked-out project.

Plan: expose shared selectors returning availability and reasons; keep presentation metadata outside engine content. Add README and test/build CI. Validate imported saves now and network commands when multiplayer is introduced. Keep React and the current build tooling; no rewrite or package split is needed for this milestone.

## Icon and visual direction

Suggested direction: a restrained civilization ledger with a dark neutral background, readable type, outlined SVG symbols, and resource accents. This is a proposed art direction, not a locked decision. Use icons to identify objects and communicate progress, not merely decorate headings.

First icon set:

- Food: wheat; production: hammer; gold: coin; science: flask.
- Population: people; growth: sprout; turn: hourglass; end turn: forward arrow.
- Granary: grain store; workshop: anvil; market: stall; library: open book.
- Agriculture: seedling; pottery: vessel; crafting: tools; currency: coins; writing: quill; astronomy: telescope.
- Locked: padlock; complete: check; deficit: warning triangle; victory: star.

Implementation proposal:

- Add `src/ui/icons/GameIcon.tsx` with a typed semantic name and a small local SVG registry. Start with resources and status symbols, then extend to buildings and technologies. Use a consistent 24-unit viewBox and stroke weight.
- Add `src/ui/presentation.ts` to map resource/building/technology IDs to symbols and display metadata. Keep SVG/React imports out of the engine and saves.
- Use 16–20px icons beside text and 28–32px symbols in building/research rows. Define sizing and resource colors as CSS variables.
- Always retain visible resource/action labels. Hide decorative SVGs from assistive technology; label any icon-only controls. Pair status color with text and shape.
- Add `ResourceStat`, `ProgressMeter`, and `StatusBadge` components. Show turns remaining with “at current output”; queue estimates must include preceding projects. Show an explicit deficit instead of a growth ETA when food is negative.
- Add brief completion feedback and a readable turn report; honor reduced-motion preferences. Check keyboard focus, mobile wrapping, contrast, and zoom.

Use simple code-native SVGs for this pass. Custom painted building artwork can follow once the theme and progression are stable; it is not needed to make these menus readable.

## Delivery plan

### Milestone 1 — Make the existing game readable

Priority: first implementation slice. Scope: UI icons and presentation, plus engine selectors where needed. Preserve current rules initially so balance changes can be evaluated separately.

- [ ] Add semantic icon registry, resource styling tokens, and the first resource/status icons.
- [ ] Replace misleading HUD totals with food income/consumption/net growth, production rate, science rate, and gold treasury; identify gold as not yet spendable until milestone 3.
- [ ] Add building/technology symbols, progress bars, output-based estimates, and clearly named prerequisite labels.
- [ ] Add next-turn deficit and idle-research/build warnings without blocking End turn.
- [ ] Add selected-state semantics, specific accessible button names, keyboard focus, and safe New game handling.

Acceptance: a player can explain what each number means and predict the next turn; icons remain legible on a narrow viewport; all actions work by keyboard; starvation and lost progress are visible before committing. Until research retention ships, explicitly disclose the reset when switching.

### Milestone 2 — Protect saves and establish regression checks

Can run alongside milestone 1; complete before wider playtesting.

- [ ] Add validated, versioned saves and deliberate recovery behavior, including migration of the current raw snapshot format.
- [ ] Add storage failure feedback and export/import support with the same validation boundary.
- [ ] Add the missing engine and persistence regressions identified above.
- [ ] Add a browser smoke test, README with rules/run commands, and CI for tests and production build.

Acceptance: current valid saves still load; corrupt or inaccessible storage does not crash the game or silently erase the previous save; tests cover the actual duplicate-queue path and exact completion thresholds.

### Milestone 3 — Improve progression decisions

Depends on clear presentation and reliable saves.

- [ ] Retain per-tech progress on switching; define and implement overflow rules with save migration.
- [ ] Add one gold spending action and expose its cost/effect through the reducer and shared selectors.
- [ ] Add queue cancel/reorder behavior with explicit treatment of invested production.
- [ ] Compare direct science, growth-first, and production-first playthroughs against the 70-turn baseline.
- [ ] Adjust costs/yields based on observed decisions and waiting time, then consider one additional branching choice.

Acceptance: gold changes an outcome, switching research does not silently waste investment, and building investment has a demonstrable payoff in at least one tested route. Set a concrete pacing target from playtests rather than inventing one up front.

### Milestone 4 — Prepare multiplayer after the loop is enjoyable

- [ ] Introduce explicit player IDs and per-player state when a second actor is actually needed.
- [ ] Add server-authoritative command validation, state revisions and duplicate-command handling.
- [ ] Design filtered player views before networking hidden information; never send the complete hidden state to clients.
- [ ] Add versioned action history/snapshots if replays or debugging require them; pin rules/content versions for replay compatibility.
- [ ] Add backend persistence and asynchronous turn delivery, then consider live updates.

Acceptance: two players can resume a game, stale commands cannot alter it, and one player's response contains no opponent secrets. The current pure engine is reusable, but hidden-state client prediction will need a narrower contract.

## Recommended next task

Implement milestone 1 as an icons-and-clarity pass, starting with the resource bar and city progress. Pair it with save validation from milestone 2 before inviting anyone else to play. Keep balance changes in a subsequent slice so feedback can distinguish presentation improvements from new rules.

## Implemented direction: head of state

The active prototype now replaces city management with a 12-turn Belvar energy crisis in Executive and Political modes. Both share decisions, authored events, deterministic resolution, isolated government saves, full turn histories, and descriptive assessments. Political mode adds support and coordination requirements. Earlier city milestones above are historical, not the current product direction.

Next playtest: replay both modes; compare unused slots, blocked requirements, final indicators, and whether coalition/coordination actions create choices or busywork. Defer combat, maps, elections, minister personalities, multiplayer and a final victory rule. Government decisions and scenario effects are content-defined in src/government/engine.ts.

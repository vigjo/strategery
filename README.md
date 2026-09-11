# Strategery — the head-of-state prototype

Install with `npm ci`; run `npm run dev`. Checks: `npm test`, `npm run build`, and `npm run test:browser` (first install Chromium with `npx playwright install chromium`).

Lead fictional Belvar through a 12-turn energy crisis with supplier Veyra. Executive mode executes eligible policy reliably. Political mode uses the same policy effects, with legislative support and cabinet coordination. Draft up to two distinct decisions, reorder or remove them, then submit. Invalid drafts never partially execute. Event responses are optional, limited to one per event, consume a slot, and carry no extra coordination or legislative requirement.

Resolution: validate ordered immediate decisions, execute them, collect 10 revenue/pay 6 baseline expenditure, advance pre-existing commitments, deduct 4 energy, apply shortage/debt approval penalties, apply political support changes, log the turn, and restore coordination for the next turn. The first turn starts at full coordination. Newly created commitments do not charge or advance that turn. Negotiations resolve on the following turn; successful agreements deliver immediately then, followed by two further deliveries. Requirements for legislative approval apply when authorizing negotiations, not again when the supplier responds.

A turn-12 assessment describes welfare, finances, energy and diplomacy without declaring an overall winner. Replay the other mode preserves the prior assessment. Both runs are saved and exported. Drafts are session-local; submitted turns, unused slots and blocked attempts are persisted locally. No remote analytics.

Government saves use `strategery.government.v1`; legacy civilization data is untouched. Version 1 saves are verified by deterministic replay of their full history. Invalid saves block play/autosave until an explicit reset or valid import. Export the original first for recovery. Future rule changes require version migration.

The active rules and persistence live in `src/government`. The old `src/engine` remains only as an archived prototype and for existing icon types; it is not used for government gameplay. The React shell lives in `src/ui`.

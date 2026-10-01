# 灰烬远征 / Emberbound — task plan

## Goal
Deliver a complete, original, visually illustrated single-player deck-building roguelike inspired by the public genre mechanics of Slay the Spire, not a copy of its protected assets. A compact indie game, not a claim of commercial equivalence.

## Phases
1. Requirements, reference and self-authored development prompt — complete.
2. Pure deterministic game engine, content, save validation and tests — complete (98 tests passing).
3. Illustrated responsive UI, animation, sound and tutorial — complete (height-responsive layout fixed).
4. Rules simulations, browser interaction checks, screenshot review, fixes — complete (UI-driven three-act victory, bundle UI and JSON restore verified).
5. Offline packaging, instructions, verification and delivery — complete (single-file build, launch shortcut, README, license, evidence).

## Acceptance gates
- Three distinct heroes; original vector battlefield/characters/card art, not a text-only panel.
- Complete 3-act run: connected branching map, encounters, elites, bosses, rewards, shop, events, rest, upgrades, relics, potions, victory/defeat.
- Energy, deck/hand/discard/exhaust, target selection, visible enemy intents, status tooltips and audiovisual feedback.
- Save/continue, seeded runs, settings, explicit new-run confirmation; no AI/API/token requirement.
- Meaningful deterministic unit tests and full-run simulations, UI click verification, screenshots inspected.
- No copying of Slay the Spire code, card texts, characters, art, music or names; no auto GitHub publishing.

## Decisions
- Browser-based Canvas/SVG/HTML game: zero installs, original vector art, fast reproducible tests. Unity is available but does not itself solve illustration quality.
- Files under outputs/emberbound only; removed Last Lantern remains untouched.
- Standard Node library server and test runner, no external dependencies/CDN/network in game.

## Errors
- First unit run: rogue combo test expected total poison 2, but starting Fang relic already applies 2. Corrected test to assert increment +2 (not changed gameplay).
- Browser test locator no longer matched because active visible user run moved ahead. Re-observed UI and isolated testing on port 8788; kept user run intact.
- Direct file:// bundle test was rejected by browser URL policy. No bypass. Test compiled bundle on a standard localhost page; document that literal file opening is not UI-verified.
- Browser download event did not fire for Blob export (10-second timeout). Added visible JSON backup plus paste-import workflow; file download remains optional with honest request-only feedback. Verify export/import through visible UI.

## Final status
All compact-v1 acceptance gates verified within documented limitations. Desktop and narrow-screen UI checked; literal file:// QA is tool-blocked, not claimed. No GitHub push, paid API, copy of original game assets, or old-project mutations.

## v1.1 user-requested correction (2026-10-02)
Publishing authorization (2026-10-02): user now requests GitHub upload; previous no-publish restriction was for pre-authorization development only. Create public azaz2288/emberbound, push scoped source/tests/docs, upload playable Windows ZIP and HTML as v1.1.0 release, verify remote SHA/assets/CI. Do not put node_modules/embedded runtime/archive into Git history; no unrelated repository changes.
Publishing status: repository/source/assets complete, hashes match; fixing CI Windows CRLF/CSP issue before final handoff. Ubuntu tests already passed.
0. Complete card encyclopedia, searchable/filterable all 56 cards and upgrades; genuine draw/discard/exhaust/reshuffle pile motion — complete.
1. Real Windows desktop distribution with embedded runtime, secure offline window, no browser/Node installation — complete (actual packaged EXE self-test passed).
2. Clearly visible combat VFX, action locking, layered sound effects and actual music, test-sound control — complete (signal output verified; no human-listening claim).
3. Individually composed original illustrations for every card, enlarged inspection — complete (56 scene coverage + render decode checks).
4. Upgrade comparison modal; preview, changes, cancel and explicit confirmation — complete (no mutation until confirm verified).
5. Regression, actual UI checks on isolated storage, desktop self-test/build evidence and documentation — complete (158 Node tests, 42 development + 42 packaged assertions, screenshots reviewed).

Acceptance: preserve user's 8787 run; do not publish GitHub; do not restore deleted Unity prototype. EXE must run standalone, not a browser shortcut. All 56 images must have individually authored scenes. Preview/cancel must leave serialized run unchanged. Desktop save/restore and bundled resource loading must be tested. Do not claim human auditory verification when only signal/graph tests were available.

v1.1 errors: apply_patch rejected a delete/add on the same path, then a partial long-line context; corrected patch construction without touching files outside scope. First desktop harness used HTMLElement.click on SVG map groups; changed to bubbled MouseEvent, matching application listener.

Interrupted-run audit: 154/155 Node tests passed (arbitrary SVG character-count assertion needs semantic correction); desktop integration failed its VFX-lock assertion, investigate runtime rather than claim success. No packaged EXE has yet been built.

Integration fixes: fixtures now return to menu before replacing storage, avoiding beforeunload overwriting them. Timed VFX assertions now observe in-page during the action and use MutationObserver for short-lived shuffle nodes (capture latency can otherwise miss them). Hidden-window captures were stale; test window now paints visibly, frame-sync capture added. Card scene character-length assertion replaced with authored-scene inclusion/uniqueness checks. Packager download ECONNRESET; use already-installed official Electron ZIP via supported electronZipDir option, no different binaries or security bypass.

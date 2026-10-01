# Progress

## GitHub publication — 2026-10-02
- User explicitly authorized uploading finished game; prior preference is public for showcase.
- Scoped GitHub authentication verified as azaz2288; emberbound name available. Prepare source-only Git history and playable assets as Release attachments, not large Git files.
- Added Ubuntu rule verification and Windows desktop tests/build CI, screenshot README and release download link. Credential stays in process memory and is not stored or logged.
- Published public repository and v1.1.0 assets; remote main fbbffd3d2e95103dbefe81ae1e2f5ece0cb63867 verified. Both release asset SHA256 digests match local files exactly.
- First CI: Ubuntu all tests passed; Windows rules passed, desktop initial title missing. Windows checkout CRLF changes inline CSP hash input, while HTML parser normalizes line endings. Canonicalize served HTML to LF, enforce source LF via .gitattributes; shipped local-LF binary unaffected. Re-verify desktop and remote workflow after fix.
- Fix commit 96f8fc6532d3accf731cd1181ab52f3e7fb3fcb1 pushed and matched remote. GitHub run 36942094227: Ubuntu rules successful, Windows 158 tests successful, desktop 42 assertions successful, desktop packaging successful. Both release assets uploaded and digest-verified. Public repo https://github.com/azaz2288/emberbound ; release https://github.com/azaz2288/emberbound/releases/tag/v1.1.0 .
- Final documentation/evidence commit only: updated local desktop checks after line-ending fix, no gameplay changes. Skips redundant CI for screenshot/report-only evidence; code tested by run 36942094227. Player release ZIP retains the exact previously packaged/tested SHA256, not replaced silently.

## v1.1 corrections
- Read plans and inspected current artwork/audio/upgrade flow. Implementation not yet verified. User session at 8787 remains untouched.
- Added 56 unique original vector scenes, full searchable/filterable card encyclopedia, upgraded display toggle, enlarged card inspection and confirmed upgrade comparison.
- Added draw/discard/exhaust/reshuffle flights, visible VFX, guarded action sequencing and reduced-motion handling. Regression covers a draw card recycling itself into hand.
- Added original local layered sound effects and composed melody/chord/bass music; settings show context state and sound test button.
- 158 Node tests passing; 54 regression runs, 270 balance runs, 120 performance runs. 42 desktop integration checks passing in isolated profile, screenshot review completed for encyclopedia, upgrade modal and 720p combat.
- Built Windows x64 standalone Electron distribution using locally cached official runtime after remote packager download reset. Packaged binary self-test running; no GitHub publish, no user web-profile mutation.
- Final actual EXE report: packaged=true, 42 passed assertions, zero renderer errors. Copied report into verification/v1.1/packaged-report.json. Windows ZIP created (148,707,666 bytes ≈142 MiB), 89 entries; EXE, ASAR and Chinese launch instructions present.
- ZIP SHA256: 71605023F8C3FD22E3374FAB17FB20BC8F4E05C9058C694553040D90F9848830. EXE SHA256: A03915B27E27681156D51729654CB62349D60C3B4457BB6BF17709D47E565E79. Final distribution is unsigned Windows x64 only. User should send whole ZIP, not EXE alone. No claim of independent friend-machine testing.

## 2026-10-02
- Read planning-with-files skill and templates.
- Inspected workspace and tools; started a separate original game, not recovery of deleted prototype.
- Created acceptance gates before implementation.
- Read official Steam feature description, authored development_prompt.md.
- Implemented 56 original cards (54 playable + 2 curses), 16 relics, 4 potions, 12 enemy types, 5 events, three heroes, three acts and deterministic engine.
- Original procedural vector character illustrations, landscapes, card illustrations; responsive Chinese UI and synthesized audio implemented.
- Static syntax checks pass; dynamic tests and browser QA pending.

## Final verification
- 98 automated tests passing, 54 regression runs, 270 balance simulations; results in verification/.
- Actual UI-driven three-act victory: knight/UI-CHECK/story, 251 recorded clicks, 11 battles, 121 card plays, 7 relics, HP 53/94. Boss and victory screenshots individually inspected.
- Final packed version checks: new game, continue, keyboard deck modal, JSON backup and restore, corrupt JSON rejection, no 1280×720 overflow, no broken art or console errors. 390×844 narrow-screen verified and viewport reset.
- Added genuine attack motion, status-dependent damage and original synthesized sounds; reduced-motion option.
- Literal file opening blocked by testing URL policy; tested same standalone bundle on standard localhost. No bypass attempted. Blob download not observable; robust visible JSON/paste alternative added and verified.
- Self-authored prompt, README, MIT license, standalone HTML and explicit launcher included. No GitHub publication or old automation resumption.
- User's active 8787 origin/play session preserved. QA browser tabs cleaned up.

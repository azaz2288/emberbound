# Findings

## v1.1 correction audit
- Publication audit: no Git repository initialized here and no gh CLI on PATH. Git Credential Manager already configured; use authorized scoped GitHub credential in memory through a non-logged helper. Repository emberbound not found by git ls-remote. Windows archive is >100 MB and must be a Release asset, not a Git object.
- Current deck viewer is only owned cards, not a full encyclopedia. Add separate always-available all-card index with class/type/rarity/name/effect filters and upgrade inspection.
- Existing draw-hand CSS isn't a real pile-to-hand transfer; no end-turn discard animation. Compute presentation-only pile transitions from validated before/after state, keep rule resolution single-shot, lock inputs until sequence finishes.
- Inspected real renderer upgrade screenshot: two large illustrated faces, 6→9 damage summary and visible cancel/confirm correctly render. Integration fixture initially overwritten by beforeunload autosave; fixture now switches to menu before replacement. SVG intrinsic size is browser-default rather than viewBox dimensions; image QA checks actual decode/nonzero width instead of assuming 360px.
- Frame-synced screenshot review confirms the actual encyclopedia (56/56 with visible filters, distinct knight illustrations) and 1280×720 combat with larger card art and all three pile controls. 158 Node tests and 42 Electron integration checks pass; full shuffle/discard/exhaust motions observed, audio PCM finite/non-silent and context running. No human listening quality claim.
- User rejects browser-only delivery, subtle feedback and repeated symbol artwork. Existing v1 tests are not evidence these requested improvements are complete.
- Audio was quiet short oscillators; music default off was only a low drone. Replace with layered transients and composed looping score, expose audio status and test control.
- Upgrade clicked directly into chooseCard; tooltip alone insufficient. Add visually explicit comparison and confirmation without mutation on preview.
- Reuse deterministic engine with Electron embedded Chromium for a genuine offline Windows app. No Unity-rewrite or installation needed for player; Node integration disabled and navigation locked.

## Requirements
User disliked the previous prototype's lack of real visuals; asks for a finished Slay-the-Spire-style game, a self-generated implementation prompt, implementation and self-testing. Graphics and moment-to-moment usability are mandatory, not deferred.

## Initial findings
- Unity 6000.3.23f1 and Node 24.12.0 installed. No downloads required for chosen zero-dependency browser build.
- No active project-specific AGENTS.md found in workspace; preserve existing projects.
- Avoid misleading 'full Slay the Spire clone' claim. Scope is a complete compact original game with the same genre loop.
- Game must work without AI calls, account login or recurring token expense.

## Resources / reference
Read official Steam description: https://store.steampowered.com/app/646570/Slay_the_Spire/
It explicitly describes dynamic deck building, changing routes, enemies, cards, relic interactions and bosses. Original has 350+ cards, 200+ items, 50+ encounters/events. This project will NOT claim equivalent breadth; uses the loop as design reference only.

## Visual review
- First real browser screenshot (858×764): original illustrated knight/mage/rogue, forest/mountain/moon cover render correctly. English subtitle wraps an orphan letter; fixed by using a normal unspaced word plus CSS letter spacing.
- Browser has no initial application exception; hero selection reached by an actual click.
- Actual UI verification on isolated origin: knight gains 7 block (5+2), shield-hit reduces wolf 21→9, energy 3→2→1, target selection prompts correctly. Original illustrated enemies and readable card faces confirmed. Full fight was too tall for a 720–800 px window; added height-based compact layout before continuing QA.
- While testing, visible tab progressed to a mage reward in hard mode without our intervening commands (user interaction). Do not alter that active user run; isolated QA moves to separate localhost port 8788 (separate storage origin), hidden tab.
- 270 heuristic simulations terminate without invariant failures. Story wins: knight 28/30, mage 27/30, rogue 23/30. Standard: 10/30, 21/30, 13/30. Hard: 0/30, 6/30, 1/30. This reveals mage advantage and hard knight challenge; not proof of human balance.
- Actual UI controls completed all three acts and defeated final boss: knight, seed UI-CHECK, story mode, 11 victories, 121 cards played, 7 relics, ending HP 53/94. 251 recorded automated locator clicks plus manual setup/check actions. Screenshots saved for boss and final ending; this is actual UI-driven testing, not human enjoyment feedback.
- 1280×720 viewport showed 9 px vertical overflow from compact combat; reduced battlefield 12 px for final build.
- Compiled standalone bundle rendered successfully via localhost 8789 with hash-restricted inline script CSP. Literal file:// visit not permitted by testing browser; no policy bypass attempted.
- Final packaged UI: D opens deck, Esc closes; export reveals a valid 3365-character JSON backup; invalid paste rejected; valid paste prompts confirmation and restores identical turn-1 mage battle. Blob download event not observed, so added browser-independent visible JSON/paste option and no longer claims file download success without evidence.
- Responsive check 390×844: all character art loaded, no document horizontal overflow, hand is horizontally scrollable. Narrow-screen end-turn button wrapped too much; removed desktop-only shortcut hint on mobile and prevented label wrapping. Viewport override will be reset.
- Final desktop combat at 1280×720: scrollHeight=720, scrollY=0, all images loaded, no warning/error console entries.

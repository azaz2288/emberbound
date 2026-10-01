# v1.1 verification

2026-10-02 (client date, Asia/Shanghai). Host clock JSON timestamps are recorded verbatim and may differ from client time.

- 158 Node tests (rule, original asset coverage, encyclopedia filtering, immutable upgrades, pile transition plans, recycled draw-card identity, server and bundle).
- 54 full-run regressions, 270 balance simulations, 120 rules-only performance samples: verification/report.json and rules-tests.txt.
- 42 Electron renderer integration assertions, both development and actual packaged Windows EXE. Packaged report has packaged=true. No renderer console errors.
- Fixtures are deliberate developer test states; not claimed as human organic gameplay. The v1 full UI playthrough remains prior-version evidence, not a claim of new v1.1 manual playthrough.
- Actual DOM paths exercised: opening draw (five flights), end-turn ten discards, empty-draw reshuffle then five flights, played exhaust-card flight, double-click + keyboard lock, upgrade compare/cancel/confirm, desktop reload, deck inspect, full catalog, search/filter, upgraded toggle, reduced motion.
- Individual scene count and composition uniqueness: 56/56. All decoded in renderer; screenshot review confirms actual gallery, upgrades, and 1280×720 combat.
- Nine sound types and a 32-beat score rendered through OfflineAudioContext: finite, non-silent, peaks below clipping; live AudioContext running. WAV samples included. These are signal/graph verification, not a claim of human listening or speaker volume.
- No player's localhost:8787 storage touched; isolated temporary desktop profile; old projects and automations unchanged; no GitHub publication.

Distribution: embedded Electron 38.8.6 / Chromium 140.0.7339.249, Windows x64 only. Offline custom protocol, Node integration disabled, sandbox/contextIsolation enabled, strict CSP, external navigation/network/new windows blocked. Unsigned; no installer or system settings mutations.

Final ZIP: 148,707,666 bytes, 89 entries with EXE/ASAR/instructions verified. SHA256 71605023F8C3FD22E3374FAB17FB20BC8F4E05C9058C694553040D90F9848830.
EXE SHA256 A03915B27E27681156D51729654CB62349D60C3B4457BB6BF17709D47E565E79.
No independent second-machine execution claim; portable package tested on this Windows host.

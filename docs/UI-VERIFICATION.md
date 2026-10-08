# Interface verification — 8 October 2026

## Scope

UI redesign after `ee17d50`. World geometry, movement, collision rules, audio assets, destination data and original résumé files are unchanged. The new interface is documented in [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md).

## Checks performed

- Production TypeScript/Vite build and the 33 existing behavior tests pass. Vite continues to report the existing upstream `use client` notices and large renderer/application chunks.
- Browser review at 1440×900, 1280×720 and 390×844 (plus a 320×640 navigation/contact check): navigation; all six portfolio panels; map; settings; both arcade games; orbit experiment; simple portfolio mode.
- At 390px, all six panels had equal content client/scroll widths: no horizontal content overflow. The outer dialog was 370px wide with 10px viewport margins.
- Manrope reported loaded via `document.fonts.check('16px Manrope')`. Computed typography across headings, body copy, buttons, links, keyboard hints, outputs and SVG labels uses `Manrope, Inter, sans-serif`.
- Snake: start, steer, pause, restart and exit. Snakes & Ladders: start and roll; landing/transition status updates. Existing game-rule tests also pass.
- Map: hemisphere switch, destination selection, route beacon/cancel, and opening a selected destination's content.
- Keyboard volume adjustment updates the displayed value; the original value was restored after verification.
- Browser confirmed primary anchor CTAs render white on `rgb(36, 36, 42)`. Touch movement controls measure 44×44px after the specificity correction.
- The visible soundscape credit links to `elevenlabs.io`. Original downloadable résumé paths are preserved.

## Review and corrections

An independent read-only code review examined `ee17d50..e36b56e` and independently ran all 33 tests. It found no critical issues and identified four corrections, all applied: anchor button text contrast, preservation of the existing ElevenLabs attribution, accessible names that match visible game labels, and touch-control sizing.

Browser QA additionally found that opening a destination from a scrolled map carried the map's scroll position into the next panel. Panel bodies now remount per destination and focus moves to the new heading. Browser re-testing confirmed scroll position 0, focus on the new H2, and Escape returning focus to the map launcher. The persistent dialog shell keeps the close/return actions reachable while content scrolls.

Screenshots in `docs/images/` are actual browser captures of the local production build. These checks are not a claim of exhaustive accessibility certification or testing on every physical browser/device.

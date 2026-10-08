# A small moon with six worthwhile stops

The six-stop experience is implemented. The globe map and direct navigation expose every portfolio panel without requiring driving; the far-side lookout is a bonus discovery rather than a seventh primary stop.

| Stop | Content | Physical landmark |
| --- | --- | --- |
| Project Hangar | Lunar Toybox, the existing real project; an honest empty state for further case studies | Existing mint hangar near spawn |
| Mission Control | Nikhil Raj, editable biography, empty experience and field-notes shelves | Warm-window observatory and telescope near the name monument |
| Résumé Pod | Original supplied backend résumé PDF, readable image preview, open and download links | A compact pale blue kiosk in the near hemisphere |
| Lunar Arcade | Playable Snake and solo Snakes & Ladders | Coral dome with illuminated portholes |
| Experiment Lab | Interactive orbit and breathing-orbit sketches, plus the existing UFO signal | Charging station on the far hemisphere |
| Signal Tower | Verified GitHub; empty email, LinkedIn and availability | Slim antenna above the horizon |

## Find a stop

Press **M** or select **Map**. The map labels all six stops, the bonus lookout and your current rover position. Hollow markers show destinations on the other hemisphere; a button changes the hemisphere shown. The same accessible stop buttons work with keyboard, mouse and touch.

Choose **Open content** to read a panel immediately. This does not award a stamp. **Quick travel** places the rover on a validated approach outside all landmark footprints and the existing name monument, faces it toward the stop, clears held movement and updates the camera. Teleporting does not increase the driven-distance counter. **Set route beacon** adds a physical beam and displays the remaining great-circle distance; the guide can be cancelled. Route progress compares current distance with the distance when the route was chosen. On reaching a stop, the guide shows an arrival message.

Drive within a stop’s interaction distance for **E / Enter**, or use the visible touch action. Dialogs clear and pause rover movement. Closing them restores useful focus. The settings panel offers a simple portfolio; `?flat=1` loads it without creating a 3D renderer. All six panels and both games work there. Travel and postcard capture require the rendered moon.

## Arcade controls and rules

**Snake:** Select the game, then Start. Arrow keys or WASD steer; the on-screen buttons provide the same directions on touch. Space pauses while the board has focus. The snake cannot reverse, and only one turn is accepted per simulation tick. Eat gold squares, avoid walls and your body, and fill the board to win. Pause, Restart and Exit game are explicit buttons. The score and device-local best remain visible.

**Snakes & Ladders:** Solo play, starting off the board at zero. Start, then Roll dice; each roll uses the browser’s ordinary random source and produces 1–6. Squares follow a serpentine path, from 1 at bottom left to 100 at top left. Landing on a ladder climbs it; landing on a snake slides down. Marked endpoints, colored paths, an intermediate landing token and an announced destination show each transition. A finish requires an exact roll; overshoots stay put. The objective is the lowest roll count. Pause, Reset and Exit game are explicit controls. All routes are also listed as text below the board.

Snake’s simulation interval and the board transition timeout are cleaned up when their game unmounts. Blur or hiding the tab pauses the game. A committed dice result settles if its visual transition is interrupted, so a roll is never silently discarded. Game keyboard events stay inside the dialog and the rover remains paused.

## Lunar passport and scores

Approaching or quick-travelling to a primary stop adds an optional stamp. Opening its panel from navigation or the map does not. Stamps never restrict content. The bonus lookout does not count toward the six-stamp passport.

- `lunar-toybox.visited.v1`: unique validated primary stop IDs.
- `lunar-toybox.best.snake`: highest Snake score.
- `lunar-toybox.best.ladders`: lowest completed roll count.

Corrupt or blocked storage does not stop the experience. Settings → Reset stamps clears only the stamp key, keeping audio preferences and game records. After reset, leave and approach a stop again to stamp it anew.

## Far-side postcard

At the lookout, open photo mode with **E** or its touch action; the map can also open it directly. Photo mode places the rover at the lookout approach, freezes movement and hides the regular HUD. Drag to orbit and scroll or pinch to zoom. **Export PNG** captures an actual rendered frame, with a Nikhil Raj / Lunar Toybox footer, and downloads a PNG. The photo controls are HTML overlays and do not enter the exported frame. The Exit photo mode button restores the regular world. Export errors appear beside the button.

## Edit real content

Edit `src/content.ts` for the confirmed identity, biography and contact fields. Email and LinkedIn are initially empty; the panel omits unset or unsafe links. The only configured public profile is `https://github.com/nikhiilraj`. Keep experience, projects and field notes empty until real information is supplied; their panel markup lives in `src/lunar-app.tsx`.

The supplied user-owned backend résumé is served unchanged at `/resume/nikhil-raj-backend.pdf`. Its generated readable preview is `/resume/nikhil-raj-backend-preview.png`. The PDF was supplied separately by the controller, and its claims have not been copied into the portfolio biography. Replace both files together when providing a new résumé. The original has a clipped education date near the right edge; the preview preserves that source limitation rather than inventing a correction.

`src/destinations.ts` is the central typed stop manifest: names, actions, colors, sphere normals, interaction ranges and collision radii. The world, map, proximity logic, travel and passport all use it. `navigationObstacles()` also includes the existing name monument. `approachFor()` searches a collision-free ring around the stop. Animated interaction rings and route beacons are excluded from static batching.

## Verification boundary

Pure tests cover Snake turning, growth, collisions, tail movement and full-board completion; dice bounds, ladder/snake transitions, exact finishes and board layout; all seven approach points against the actual shared footprint set; teleport heading, stopped momentum and preserved driven distance; and tolerant stamp persistence. Existing movement, visitors, audio and account guard tests remain intact. A production build type-checks the complete experience.

Browser rendering, 390px layouts, keyboard/touch interaction and actual PNG content require visual acceptance in addition to those tests. Publishing remains a separate controller action.

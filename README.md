<div align="center">

# Lunar Toybox

**Nikhil Raj’s little corner of the cosmos.**

A playable 3D portfolio on a tiny moon. Drive a curious robot, explore the entire sphere, and follow a few ideas into space.

[Explore the moon](https://nikhil-lunar-toybox.nikhil-063.workers.dev) · [Run locally](#run-locally) · [Controls](#controls) · [Next destinations](docs/MOON-STOPS.md)

![Three.js](https://img.shields.io/badge/Three.js-3D_world-111111?logo=threedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)

</div>

[![Lunar Toybox — Nikhil’s robot, workshop, cratered moon and distant Earth](docs/images/desktop-explore.png)](https://nikhil-lunar-toybox.nikhil-063.workers.dev)

## A small world, open to explore

There is no “enter” button. Your first movement wakes the robot and eases the camera out to reveal the moon. Every side is reachable, including the poles and the far side.

- **A real 3D world.** Procedural lunar terrain, dimensional Manrope lettering, a mint workshop, a coral charging station, wheel trails and a portrait-inspired robot.
- **A camera you control.** Orbit freely, zoom in for details, or pull back to see the globe with Earth in the distance.
- **A little company.** Friendly UFOs arrive at random intervals and from different directions, pause with a playful message, then head back into space.
- **A responsive soundscape.** Motor startup, idle, acceleration and rolling sounds; quiet space ambience; stereo UFO passes; an optional musical ambient loop.
- **Content without a driving test.** Work, Lab and About are always available in navigation. Dialogs pause movement; a simple portfolio view is also available.
- **Considerate defaults.** Music starts off. Audio unlocks with an interaction. Sound preferences persist, hidden tabs pause playback, and motion follows the device preference.

The world is playable today. Additional case studies, a fuller biography, résumé and arcade are still in progress.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | WASD or arrow keys | Hold the direction pad |
| Boost | Shift while moving | — |
| Orbit | Drag the scene | Drag the scene |
| Zoom | Scroll | Pinch |
| Open a nearby stop | E or Enter | Tap the nearby action |
| Return home | R or the reset icon | Reset icon |
| Mute all audio | Speaker icon | Speaker icon |
| Toggle background music | Music-note icon | Music-note icon |

Open settings for individual music, robot/visitor and ambience levels. To invite a visitor immediately, open **Lab → Send a signal**.

## Run locally

Use **Node.js 22.12+** and npm. No API key or environment file is required to run the portfolio.

```bash
git clone https://github.com/nikhiilraj/lunar-toybox.git
cd lunar-toybox
npm ci
npm run dev
```

```bash
npm test          # Movement, collisions, audio lifecycle, visitor paths and account guard
npm run build     # Strict TypeScript check and production output
npm run preview   # Serve the production build locally
```

## Built with

| Layer | Tools |
| --- | --- |
| World and renderer | Three.js, WebGPU with WebGL 2 fallback |
| Interface | React, TypeScript, Vite, Tailwind CSS |
| Components | shadcn/ui and Radix, Magic UI, Aceternity UI |
| Motion and icons | Motion, Lucide |
| Typography | Self-hosted Manrope with Inter fallback |
| Sound | Howler, locally served ElevenLabs-generated assets |
| Hosting | Cloudflare Workers Static Assets |

The scene is generated from editable geometry, not a screenshot or a pre-rendered video. No model-generation service, database, analytics service or API connection runs in the browser.

## Make it your own

```text
src/
  lunar-world.ts       Terrain, landmarks, lighting assets and scenery
  assets.ts            Robot geometry and reusable materials
  lunar-motion.ts      Sphere movement, collision clearance and visitor timing
  lunar-game.ts        Render loop, camera, input and interactions
  visitor-flight.ts    Randomized spacecraft paths
  audio-mix.ts         Sound states, gains and transitions
  audio.ts             Playback, gesture unlock and saved preferences
  lunar-app.tsx        Portfolio panels and controls
  lunar.css            Theme, typography and responsive layout
  content.ts           Identity, bio and contact links
  components/          UI building blocks
public/assets/         Textures, fonts, sound files and optional robot GLB
scripts/               Model export and guarded deployment
tests/                 Focused behavior checks
```

Edit `src/content.ts` for identity and contact details, and `src/lunar-app.tsx` for project cards. Unconfigured contact links are intentionally omitted. The optional `nikhil-bot.glb` is an interchange export; regenerate it with `npm run export:robot`.

Diagnostic routes: `?debug=1` exposes read-only world/audio data, `?renderer=webgl` selects the fallback renderer, `?quality=low` lowers rendering cost, and `?flat=1` opens the simple portfolio.

## Deploy

```bash
npx wrangler login
npm run deploy
```

Deployment is deliberately pinned to **Nikhil’s Cloudflare account** in `wrangler.jsonc`. The deployment script rejects a conflicting account ID, including one supplied through the environment. It does not select the first account returned by Cloudflare.

A ready-to-enable [GitHub Actions workflow](docs/ci/validate.yml) runs tests and a production build on pushes and pull requests. It is stored as a template because the publishing credential does not have GitHub’s `workflow` scope. Local verification passes all 21 tests and the production build. Deployments are explicit; no Cloudflare credential is stored in this repository. See [deployment notes](docs/DEPLOYMENT.md).

## Sound and attribution

The soundscape uses nine assets generated with **[elevenlabs.io](https://elevenlabs.io/)**: engine start, rev, idle, driving, space ambience, music, and UFO approach, hover and departure. Files are served locally in Ogg/Opus with MP3 alternatives.

The background bed was generated through Sound Effects; the dedicated Music API was unavailable on the generation account. Generated audio remains subject to ElevenLabs’ terms, including the free-tier attribution and non-commercial restrictions. It is not offered under a separate open-source audio license. See [audio details](docs/AUDIO.md) and [asset credits](THIRD_PARTY.md).

## What comes next

A Project Hangar, Mission Control for the story and experience timeline, a Résumé Pod, a Lunar Arcade, an Experiment Lab, and a Signal Tower for contact. A globe map and destination beacons will connect them. These are planned features, not hidden functionality in the current build.

Read the [six-stop plan](docs/MOON-STOPS.md).

---

Made for **[Nikhil Raj](https://github.com/nikhiilraj)**. Personal branding and original assets remain their owner’s work; upstream libraries and components retain their respective licenses. Public source availability does not grant a blanket license to the complete portfolio.

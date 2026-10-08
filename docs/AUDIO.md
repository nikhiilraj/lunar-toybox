# Soundscape · elevenlabs.io

Nine sounds were generated using ElevenLabs Sound Effects v2 for the lunar portfolio. The site serves the results locally through Howler; it makes no generation requests and contains no API credential.

| Asset | Behavior |
| --- | --- |
| `engine-start` | One ignition/rev on the first movement |
| `engine-rev` | Subsequent acceleration after a stop, with a cooldown |
| `engine-idle` | Quiet motor loop while exploring |
| `engine-drive` | Rolling motor layer with speed-dependent rate and gain |
| `void-ambience` | Continuous stereo space texture |
| `moon-music` | Optional tonal musical ambience, independently switchable |
| `ufo-approach` | Arrival cue, panned with the spacecraft |
| `ufo-hover` | Steady hover during the visitor’s message |
| `ufo-depart` | Departure cue as the spacecraft leaves |

Loops use 120 ms circular crossfades. Files have measured loudness normalization and Ogg/Opus plus MP3 encodings. Audio validation records are in `AUDIO-VALIDATION.json`.

The dedicated Music API was unavailable for the generation account; `moon-music` is a Sound Effects generation rather than a full Music API composition. Generated audio is subject to ElevenLabs’ terms. The account reported a free plan, whose generated content requires **elevenlabs.io** attribution and is restricted to non-commercial use. A later subscription does not automatically relicense previously generated content; use suitably licensed assets for commercial reuse.

Movement or an audio-control gesture unlocks playback. Music defaults off, effects and ambience default on, and an explicit master mute is preserved through movement and reloads. Hidden tabs pause all sounds. Menus pause vehicle/visitor cues and duck the background layers. Tests cover transitions, corrupted saved preferences, loop reuse, visibility lifecycle and mute persistence.

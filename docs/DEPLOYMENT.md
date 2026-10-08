# Deployment

- Repository: https://github.com/nikhiilraj/lunar-toybox
- Production: https://nikhil-lunar-toybox.nikhil-063.workers.dev
- Worker: `nikhil-lunar-toybox`
- Owner: Nikhil’s Cloudflare account, explicitly configured in `wrangler.jsonc`.

## Publish a change

Use Node 22.12+, run `npm ci`, then `npm test`. Authenticate with `npx wrangler login`, verify access with `npx wrangler whoami`, and run `npm run deploy`. The command builds first and deploys static output from `dist/`.

`scripts/deploy.mjs` always sets the configured Nikhil account ID and rejects conflicting environment settings through `scripts/deployment-account.mjs`. Do not remove the guard or change the account casually. There is no first-account selection and no shared-company deployment target.

## CI and credentials

The ready-to-enable GitHub Actions template at `docs/ci/validate.yml` tests and builds the site with read-only repository permissions and no Cloudflare secrets. It is not active: the publishing credential lacks GitHub’s `workflow` scope. To enable it later with an appropriately authorized credential, copy it to `.github/workflows/ci.yml` and commit that file. The initial publication uses local Wrangler OAuth. Automated production deployment is not configured; a future workflow should use an explicitly scoped credential for Nikhil’s account.

`dist/`, `.wrangler/`, environment files, developer logs and dependency directories are ignored. The account ID is an identifier, not a credential. No ElevenLabs API key is needed in production because all audio is generated beforehand.

The `sharp` dependency used by Wrangler/Miniflare is pinned through an override to 0.35.5, addressing the upstream librsvg advisory in the CLI toolchain. It is not shipped to the browser.

## Initial publication verification

Published 8 October 2026 to `nikhil-lunar-toybox.nikhil-063.workers.dev` in Nikhil’s account. Cloudflare version: `88bd5d3f-406b-4971-886d-57d9570ef3f3`.

- 21 automated tests passed and the production TypeScript/Vite build completed.
- Dependency installation/audit reported zero vulnerabilities after the development-tool override.
- A deployment dry run passed before publication.
- The live index, dimensional font, moon texture, Earth texture, startup sound, music and favicon matched the local build byte-for-byte.
- The live 3D world, first-key movement, music toggle and audio settings were checked in a browser; no runtime errors were reported. Desktop and phone viewports were inspected. This is not a physical-device performance certification.
- README images were captured from the deployed site.

The repository history is a current-date initial import grouped by subsystem, followed by publication documentation. It does not fabricate earlier development dates. Generated build output and local credentials are excluded from Git.

## Six-stop release verification

Published 8 October 2026 to the same Nikhil-owned Worker. Cloudflare version: `3d280f9b-c091-4d00-9cd6-e44e4635e637`.

- 33 automated tests pass; the TypeScript/Vite production build passes. Existing library directive/sourcemap and chunk-size warnings remain.
- All six destinations and the bonus lookout were reached through the map, with proximity prompts and correct arrival orientation. Route distance changes with driving and cancellation works.
- Stamps and the Snake best score survive reload; resetting stamps preserves game scores. All content and games remain accessible in simple mode, and route guidance clears when switching to it.
- Snake scoring, wall collision, restart, pause, touch steering and rover input isolation were checked. Snakes & Ladders dice movement and pause were checked; exact finish, overshoot and transition rules have automated coverage.
- Desktop and 390px-wide mobile layouts were inspected. Orbit sliders have named keyboard-accessible controls.
- Actual PNG downloads were opened and visually checked from the default renderer and forced WebGL fallback. Photo mode permits camera orbit while rover coordinates remain unchanged. This is not exhaustive GPU/device certification.
- Live first-key movement, the map, arcade travel and game UI were checked without reported runtime errors. The live index, script, style, original résumé PDF and preview match the local build byte-for-byte.
- README overview/map screenshots were refreshed from production. The postcard image is a real local production-preview export.

The résumé is the user-authorized original `Nikhil-Raj-Backend -Resume.pdf`; it remains unchanged. Other personal sections remain empty for later editing.

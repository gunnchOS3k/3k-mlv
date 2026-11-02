# 3k MLV full V1 automated-readiness record

Generated 2026-10-05 for `world/spatial-commons-neighborhood-v1`.

## Outcome

The declared software/digital V1 scope has one shipping world runtime, `WorldRuntime`, and a validated 55-scene graph. All 55 declared scenes are reachable and have valid targets. Automated behavior covers Commons, every Home room, the Gallery lobby and five wings, Transit, and the arrival, orientation, learning, research, culture, community, and return flow for all seven campuses.

This is an automated-readiness result, not owner acceptance. Human, Pixel/device, hosted Supabase, performance-human, local-identity, visual-quality, usability, and merge-authorization gates remain false.

## Automated scope matrix

| Area | Declared scope | Automated result |
| --- | ---: | --- |
| Commons | 1 scene | Pass: traversal, collision/props, interactions, Home/Gallery/Transit routes, return context |
| Home | 5 scenes | Pass: yard, living, media, office, bedroom, private work, app launch, sign-out action, reciprocal returns |
| Gallery | 6 scenes | Pass: lobby, five wings, sourced rotation, private/public actions, publish/unpublish contracts |
| Transit | 1 scene | Pass: reciprocal connections to all seven campuses and Commons |
| Campuses | 42 scenes | Pass: seven campuses × arrival, orientation, learning, research, culture, and community |
| WAIKE | Seven learning handoffs | Pass: validated internal handoff plans and exact-scene return contracts |
| Research | Seven research handoffs | Pass: validated internal handoff plans and exact-scene return contracts |
| Persistence | World, return, workspace | Pass: full state restore, corrupt-data fallback, cross-world protection, local test-session reload recovery |
| Input/accessibility | Keyboard, pointer, touch contract, gamepad, direct navigation | Pass: shared action path, edge/deadzone behavior, accessible destination list |
| Privacy/share/publish | Local behavior | Pass: private/public metadata, revocation metadata, validated share tokens, no raw token or file bytes in snapshots |

Germany is the canonical graph slug for the Ruhr presentation; it does not create an eighth campus. Gaza and Graham Land retain their explicit truth constraints and do not claim sensitive coordinates, a permanent conventional campus, or a WAIKE-owned station where evidence does not support those claims.

## Real-application browser evidence

Before the app crash, the built application was traversed through all 55 declared scene routes. Every route resolved to the expected scene, rendered exactly one authoritative runtime, exposed a nonempty heading and truth copy, and provided the accessible LIST/direct-navigation control. There were no route failures.

The built application also passed reload/local-test-identity recovery on a fresh local origin. Accessible direct navigation was exercised from Commons to Home Yard and then Home Living using actual controls.

The browser-control plugin disappeared from the installed plugin cache after the app crash. The approved browser session therefore could not complete these checks, and no standalone Playwright substitute was used:

- WAIKE clickthrough and return;
- research clickthrough and return;
- privacy/share/publish browser interactions;
- mobile viewport and touch interaction.

Their automated contracts pass, but their browser gates remain false.

## Validation record

| Command | Result |
| --- | --- |
| `pnpm type-check` | Pass |
| `pnpm test` | Pass, 94/94 after evidence integration |
| `pnpm build` | Pass; 1,714,435-byte distribution, largest JS chunk 718,489 bytes; chunk-size warning retained |
| `pnpm test:rls` | Pass, 14/14 against local PGlite PostgreSQL; not hosted acceptance |
| `pnpm validate:hosting` | Pass |
| `pnpm assert:no-node-modules` | Pass |
| `pnpm scan:secrets` | Pass |
| `pnpm campus:architecture` | Pass for technical/static gates; Pixel and human gates remain false |
| `git diff --check` | Pass |

The static 7GC module-budget gate is not a performance claim. The build retains a large-chunk warning, so `PIXEL_7GC_PERFORMANCE_BUDGET_PASS` and `PERFORMANCE_HUMAN_PASS` remain false pending real-device measurement and human review.

## Recovery and external blockers

The saved Cursor recovery patch remains at `/Users/gunnchos/Downloads/3k-mlv-sceneGraph-pre-codex-full-v1.patch` with SHA-256 `0afa9f4de473bc9b584dfc86191ec503dfff1db7a9870017c201cf40ca9ab36a`.

Remaining blockers are external or human: hosted Supabase credentials/project access; physical Pixel/device and peripheral access; human performance, identity, visual-quality, and usability review; restoration of the approved browser-control plugin for the unfinished browser interactions; and explicit owner authorization to merge PR #9. No release is published and no merge is authorized by this record.

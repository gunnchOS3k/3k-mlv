# 3k MLV current-state audit

**Audited SHA (accepted main):** `3d5c3b03c2cf1ad7359f97174d85dd5e9e39eac1`  
**Audit date:** 2026-09-24  
**Worktree:** `revival/gunnchos-world-workspace-v1`  
**Owner checkout:** `/Users/gunnchos/Downloads/3k-mlv` left untouched (dirty local edits exist there; they were not copied blindly).

This audit records prototype reality. It does **not** claim a working private world, production auth, or gunnchOS integration.

---

## 1. What exists

| Area | Reality |
|---|---|
| Stack | React + TypeScript + Vite, Three.js / React Three Fiber, in-world phone UI, gamepad helper |
| Package layout | `apps/mlv-web`, `apps/anime-aggressors` (vendored game tree), `packages/shared`, `infra/supabase.sql` |
| Shared Supabase package | Present at `packages/shared/src/supabase.ts` with GitHub OAuth, profile/project/house helpers, realtime presence/chat |
| SQL | Single file `infra/supabase.sql`: `profiles`, `avatar_config`, `projects`, `house_layouts` |
| PWA / Pages | `vite-plugin-pwa` + `.github/workflows/pages.yml` |
| Name / metaphor | "My Little Vicinity", cozy neighborhood, project gallery, visiting homes |

---

## 2. Verified prototype gaps (do not overstate)

### Auth is stubbed on accepted main

`apps/mlv-web/src/App.tsx` at the accepted SHA comments out `@3k-mlv/shared` and defines local fakes:

- `useAuth` returns no-op GitHub sign-in
- `useProjects` always returns `[]`
- `supabase.auth.getSession` always returns `session: null`

The owner’s dirty checkout has started wiring the real package **plus mock project fallback**. That work is **not** on accepted main and was **not** treated as source of truth.

### World is hard-coded

`apps/mlv-web/src/three/World.tsx` renders eight sample houses (`gunnchOS3k`, `friend1`…`friend7`) and three sample players (`You`, `Friend1`, `Friend2`). No database, no player instance, no placements.

### No general file / folder / creation model

There is no `mlv_nodes`, no visibility enum, no share-link table, no world-placement table, no player-instance table. Projects are portfolio cards (`title`, `demo_url`, `repo_url`), not files.

### SQL is public-by-default

`infra/supabase.sql` uses broad `USING (true)` select policies on:

- `profiles` (acceptable for public identity)
- `avatar_config`
- `projects` (workspace content — **not acceptable** for private-by-default)
- `house_layouts` (workspace content — **not acceptable**)

There is no RLS coverage for private files, share tokens, or placements.

### `node_modules` is tracked

Accepted main tracks **19,025** `node_modules/` paths. There is **no** `.gitignore` on accepted main. This must be removed from version control in the revival PR. Do not `git clean -fdx`.

### No gunnchOS bridge

This repository has no launcher contract, no `gunnchos://mlv/...` parser, no artifact-intent consumer, and no app-registry registration. Those belong in `gunnchos-device-os`.

### Tests / CI

- No unit tests, no RLS harness, no type-check script that covers privacy
- CI is Pages deploy only (`pages.yml`)
- README claims a live GitHub Pages demo; that is a static prototype, not an authenticated private workspace

### Secrets

No committed service-role key was found in source files. `packages/shared/src/supabase.ts` falls back to placeholder URL/anon key (`https://your-project.supabase.co`, `your-anon-key`) when env is missing — that is a stub, not a credential, but it must never ship as a “configured” client.

---

## 3. Owner dirty checkout (informational only)

`/Users/gunnchos/Downloads/3k-mlv` is on `main` at the same SHA with uncommitted edits: real `@3k-mlv/shared` import restored, untracked `.env.example` / setup guides, and still-hard-coded `World.tsx`. Those files were **not** merged into this worktree. Revival work starts from the accepted SHA.

---

## 4. Honest claim state after this audit

**Allowed:** prototype world workspace, React/R3F neighborhood shell, intended Supabase + GitHub OAuth direction.

**Not claimed:** working private-by-default storage, production auth, E2EE, multiplayer, malware-free uploads, gunnchOS launcher integration (until the device-os worktree lands).

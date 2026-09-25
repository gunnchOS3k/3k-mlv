# PR #1 diff review guide

`revival/gunnchos-world-workspace-v1` vs accepted main `3d5c3b03c2cf1ad7359f97174d85dd5e9e39eac1`.

The GitHub files tab is dominated by **removing previously tracked `node_modules`**. Review the product and security changes below; do not re-add those dependency trees.

---

## Hygiene numbers (measured on `1910dba2` ancestry)

| Metric | Count |
|---|---|
| Deleted paths under `node_modules/` | **5005** |
| Tracked `node_modules` on this branch | **0** |
| Meaningful non-dependency files added/changed | **51 files**, +8316 / −359 (excluding `node_modules`) |

`.gitignore` now contains `node_modules/` and `**/node_modules/`.
CI asserts `git ls-files` has zero `node_modules` paths.

## Accidental-removal audit

Deleted `node_modules` paths were third-party package contents (accepted main had tracked installs, including vendored `apps/anime-aggressors` dependencies).

First-party source that remains tracked:

- `apps/mlv-web/src/**`
- `packages/shared/src/**`
- `infra/migrations/**`
- `scripts/**` (except dependency trees)
- `tests/privacy/**`
- `docs/**`

No first-party `.ts` / `.tsx` / `.sql` / `.mjs` under `apps/mlv-web/src` or `packages/shared/src` was deleted by the untrack commit. `apps/anime-aggressors` first-party sources were not removed; only its previously tracked `node_modules` left the index.

---

## What to review (in this order)

### 1. Security contract

- `infra/migrations/0001_mlv_world_workspace.sql`
- `infra/migrations/0002_tighten_legacy_public_reads.sql`
- `infra/migrations/0003_force_row_level_security.sql`
- `docs/security/PRIVACY_AND_RLS_MODEL.md`
- `docs/security/SHARING_MODEL.md`

Look for: default `private`, hash-only share rows, `mlv_open_share`, no `USING (true)` on file metadata.

### 2. Proofs (local vs hosted vs physical)

| Proof | Path | Status |
|---|---|---|
| In-memory Alice/Bob | `tests/privacy/two_user_privacy.test.mjs` | local / CI |
| PGlite PostgreSQL RLS | `scripts/run-local-postgres-rls.mjs` | local / CI — **not hosted** |
| Hosted acceptance harness | `scripts/run-hosted-supabase-acceptance.mjs` | **unexecuted** without owner env |
| Hosted owner runbook | `docs/security/HOSTED_SUPABASE_OWNER_RUNBOOK.md` | owner gate |
| Pixel journey | `docs/playtest/MLV_WORLD_WORKSPACE_PIXEL_ACCEPTANCE.md` | owner gate |

### 3. Product UI

- `apps/mlv-web/src/App.tsx` — real `@3k-mlv/shared` auth, not fake stubs
- `apps/mlv-web/src/three/World.tsx` — data-backed world, no hard-coded friend houses
- `apps/mlv-web/src/ui/ListWorkspace.tsx`, `FileViewer.tsx`, `PrivacyBadge.tsx`
- `apps/mlv-web/src/workspace/browserStore.ts`

### 4. Reproducibility / CI

- `.github/workflows/ci.yml` — frozen lockfile, PGlite job, Node 20, pnpm 9.15.9
- `pnpm-lock.yaml`
- `package.json` `packageManager` + `engines`
- `.nvmrc`

### 5. Ignore the giant red blob

GitHub will show thousands of deleted files under `node_modules/`. That is intentional. Collapse those hunks.

---

## Fresh-install expectation

```bash
pnpm install --frozen-lockfile
pnpm type-check
pnpm build
node --test tests/privacy/two_user_privacy.test.mjs
node scripts/run-local-postgres-rls.mjs
```

Do not run `pnpm install` without `--frozen-lockfile` in CI.

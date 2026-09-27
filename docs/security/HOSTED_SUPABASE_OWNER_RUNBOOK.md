# Hosted Supabase owner runbook

Zero-to-hero procedure for **owner-authorized** hosted validation of 3k MLV.
This document does not create a project. Do not run these steps until the owner
explicitly authorizes a hosted Supabase project.

**Claim boundary:** completing this runbook can prove hosted RLS for test
fixtures. It does not make 3k MLV a production secure OS, E2EE product, or
enterprise cloud.

---

## 0. Stop conditions

Do **not** proceed if any of these are true:

- no explicit owner authorization to create or mutate a hosted project
- you are about to paste dashboard admin keys, OAuth app secrets, or JWT signing keys into Git
- you are about to use the dashboard admin key in a browser client
- you are about to test against production user data

---

## 1. Create or select a project (owner only)

1. In the Supabase dashboard, create a dedicated **validation** project or select an authorized existing one.
2. Record locally (never commit):
   - project URL (`VITE_SUPABASE_URL`)
   - publishable / anon key (`VITE_SUPABASE_ANON_KEY`)
3. Leave dashboard admin keys in the dashboard only.

Suggested local file: `.env.local` copied from `hosted-acceptance.env.example`.

---

## 2. Apply migrations in exact order

From the 3k MLV worktree, apply SQL in this order against the hosted project SQL editor or CLI:

1. `infra/migrations/0001_mlv_world_workspace.sql`
2. `infra/migrations/0002_tighten_legacy_public_reads.sql`
3. `infra/migrations/0003_force_row_level_security.sql`

Do not skip 0003. Do not apply owner dirty-checkout `infra/supabase.sql` instead of these files.

---

## 3. Verify schema, functions, policies, buckets

Confirm all of the following exist:

| Object | Expect |
|---|---|
| `mlv_nodes`, `mlv_share_links`, `mlv_world_placements`, `mlv_player_instances` | present, RLS enabled |
| `mlv_open_share(text)` | executable by `anon` and `authenticated` |
| `mlv_hash_share_token(text)` | present; raw tokens not stored |
| storage bucket `mlv-private` | not public |
| storage bucket `mlv-public` | public-read only for PUBLIC objects |
| legacy `projects` / `house_layouts` | no `USING (true)` public-read policies |

Keep screenshots of the policy list and bucket settings as owner evidence.

---

## 4. Redirect URLs

In Authentication → URL configuration, add only the intended callbacks, for example:

- local Vite preview origin + `/auth/callback`
- any authorized PWA origin + `/auth/callback`

Do not add wildcard production domains you do not own.

---

## 5. GitHub OAuth (dashboard only)

1. Create or reuse a GitHub OAuth app in the GitHub developer settings.
2. Put the client ID in the Supabase Auth GitHub provider fields if the dashboard requires it.
3. Put the OAuth app secret **only** in the Supabase / GitHub dashboards.
4. Never put that secret in `.env.local`, the browser client, or Git.

OAuth remaining false until the owner completes this dashboard step and a human sign-in works.

---

## 6. Alice / Bob test identities

Preferred for the automated harness: two dedicated email/password users
(`MLV_TEST_ALICE_*`, `MLV_TEST_BOB_*`) created in the hosted Auth panel.

If the project is OAuth-only and password users are inappropriate:

1. Do **not** bypass auth.
2. Sign in as Alice in one browser profile and Bob in another.
3. Follow `docs/playtest/MLV_WORLD_WORKSPACE_PIXEL_ACCEPTANCE.md` manually.
4. Leave `MLV_HOSTED_TWO_USER_PRIVACY_PASS=false` until those cases are recorded.

---

## 7. Run the hosted acceptance harness

```bash
set -a
source .env.local   # owner local file; not committed
set +a
node scripts/run-hosted-supabase-acceptance.mjs
```

The script refuses to run if required env values are missing or placeholders.
It uses only the anon/publishable key and password auth.
It creates uniquely prefixed fixtures and deletes/soft-deletes only those rows.

Expected machine-readable output:

`artifacts/security/HOSTED_SUPABASE_ACCEPTANCE.json`

---

## 8. Capture sanitized results

Retain:

- the JSON report (already redacts tokens / URLs down to host prefix)
- Auth user list showing Alice/Bob test accounts (no passwords)
- SQL policy / bucket screenshots
- GitHub OAuth provider enabled screenshot (no secret visible)

Do not retain or paste access tokens, refresh tokens, share tokens, or dashboard admin keys.

---

## 9. Cleanup

The harness cleans its own `run_id` fixtures. If a crash interrupts cleanup:

```sql
-- review only rows whose metadata.run_id starts with mlv-hosted-
select id, name, metadata
from mlv_nodes
where metadata->>'run_id' like 'mlv-hosted-%';
```

Delete or soft-delete only those fixture IDs.

---

## 10. Never do this

- Use a dashboard admin key in `apps/mlv-web` or any browser client.
- Commit `.env.local`.
- Turn `MLV_PRODUCTION_SECURITY_CLAIM` true from a single staging project.
- Merge PR #1 solely because local PGlite passed.

---

## 11. Rollback

1. Disable the GitHub provider in Supabase Auth.
2. Rotate the anon key if it leaked.
3. Drop only validation-project data, not unrelated production.
4. Leave both draft PRs unmerged if hosted cases fail.

---

## Unexecuted owner steps (this prompt)

These were **not** performed by the agent:

1. Create/select hosted Supabase project
2. Apply 0001 → 0002 → 0003 on a live project
3. Configure redirect URLs
4. Configure GitHub OAuth
5. Create Alice/Bob identities
6. Run `scripts/run-hosted-supabase-acceptance.mjs` with real env
7. Capture hosted evidence
8. Merge either PR

# Revival status (A–Z)

Branch: `revival/gunnchos-world-workspace-v1`  
Base SHA: `3d5c3b03c2cf1ad7359f97174d85dd5e9e39eac1`  
Date: 2026-09-25

| Key | Item | Status |
|---|---|---|
| A | 3k MLV current-state audit | green — `docs/revival/CURRENT_STATE_AUDIT.md` |
| B | gunnchOS audit | green — `product/MLV_GUNNCHOS_AUDIT.md` in device-os worktree |
| C | branches / draft PRs | green — draft PR #1 open; not merged |
| D | repo hygiene | green — `.gitignore`, untrack `node_modules`, `pnpm-lock.yaml` |
| E | auth restoration | yellow — real `@3k-mlv/shared` import restored; hosted GitHub OAuth still owner-gated |
| F | migration model | green — `0001` + `0002` + `0003_force_row_level_security.sql` |
| G | storage model | yellow — SQL buckets/policies proven locally on stub storage; hosted buckets not applied |
| H | PRIVATE RLS | green locally via PGlite Postgres; **not** hosted Supabase |
| I | SHARED flow | green locally — hashed token RPC, UUID-alone denied |
| J | PUBLIC flow | green locally — anonymous read + unpublish |
| K | revoke / unpublish | green locally |
| L | player instance | yellow — table + RPC + local ensure; hosted RPC not live |
| M | world placements | yellow — data-backed World; private placement does not leak in RLS proof |
| N | upload / file browser | yellow — list/grid uploader, default PRIVATE, smoked locally |
| O | file viewer | yellow — controls present in smoke; MIME-safe viewer code present |
| P | gunnchOS registry | green — `mlv_world_workspace` / My Little Vicinity |
| Q | MLV bridge | green — 14 focused pytest including journey engine |
| R | deep links | green parser/tests; live launcher open not proven |
| S | artifact intent | green — schema + tests; `default_visibility` const private |
| T | offline behavior | yellow — honest status string only |
| U | accessibility fallback | yellow — list/grid is the primary file UI and was smoked |
| V | Alice/Bob/anonymous evidence | green in-memory 16/16 **and** local Postgres RLS 14/14; hosted false |
| W | builds / tests | green — pnpm frozen lockfile, typecheck, privacy 16/16, Vite/PWA build |
| X | CI | yellow/green — exact-head must include PGlite + frozen lockfile; prior head failed on self-hitting secret scan |
| Y | remaining blockers | hosted Supabase, GitHub OAuth dashboard, Pixel/mobile, owner PR review |
| Z | next action | `NEXT_3K_MLV_ACTION=OWNER_REVIEW_EXACT_HEAD_CI_THEN_AUTHORIZE_HOSTED_SUPABASE_ACCEPTANCE` |

**Honest claim:** prototype World Workspace + private-by-default model + local PGlite PostgreSQL RLS. Not a production secure OS. Not hosted/production security. Not E2EE.

**MERGE_ORDER:**
1. 3k MLV revival
2. gunnchOS MLV integration

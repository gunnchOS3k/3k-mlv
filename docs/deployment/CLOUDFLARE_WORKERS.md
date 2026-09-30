# Cloudflare Workers deployment — 3k MLV

One buildable world, two hosting paths.

| Host | Base path | How it is built |
|---|---|---|
| Cloudflare Workers production and previews | `/` | `pnpm run build` with `VITE_BASE_PATH=/` (also the default) |
| GitHub Pages | `/3k-mlv/` | `.github/workflows/pages.yml` sets `VITE_BASE_PATH=/3k-mlv/` |
| Local `pnpm dev` | `/` | no env required |

GitHub Pages stays at `https://gunnchOS3k.github.io/3k-mlv/`. This change does not edit DNS and does not deploy production.

## Dashboard values

Set these in Cloudflare Workers Builds for `gunnchOS3k/3k-mlv`. The dashboard may still show `npx wrangler ...`. Use the project-pinned Wrangler instead.

```text
Repository:
gunnchOS3k/3k-mlv

Project name:
3k-mlv

Production branch:
main

Build command:
pnpm run build

Deploy command:
pnpm exec wrangler deploy

Preview command:
pnpm exec wrangler preview

Preview builds:
ENABLED

Root directory:
/

Node.js version:
22

Production build variable:
VITE_BASE_PATH=/
```

Non-production build variables, if the form has a separate preview variable list, should also set `VITE_BASE_PATH=/`.

Wrangler is an exact devDependency (`wrangler@4.145.0`, newer than the Worker Previews minimum `4.135.0`). Do not rely on a global Wrangler. Worker Previews use `wrangler preview`, not `wrangler versions upload`.

Node 20 cannot run this Wrangler. Every published Wrangler from `4.128.0` through `4.145.0` declares `engines.node: >=22`. `.nvmrc`, `.node-version`, CI, and the Pages workflow therefore pin Node 22. pnpm stays `9.15.9`.

Root config is `wrangler.jsonc`: static assets from `apps/mlv-web/dist`, `not_found_handling: single-page-application`, `workers_dev: true`, `preview_urls: true`, and an empty `previews` block. There is no Worker script. Deep links, including `/auth/callback`, are served by the SPA fallback.

## Local commands

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run cloudflare:build    # production base /
pnpm run cloudflare:check    # build, output checks, wrangler deploy --dry-run
pnpm exec wrangler --version
pnpm exec wrangler preview --help
```

`cloudflare:deploy` and `cloudflare:preview` build at `/` and then run Wrangler. They are for the owner and for Cloudflare Builds. This repository change does not run them against production.

`cloudflare:check` never publishes. It runs `wrangler deploy --dry-run` only.

## Owner checklist after this PR is merged

1. Confirm the merge commit is on `main`.
2. Open the existing Cloudflare Workers Builds project for `gunnchOS3k/3k-mlv`.
3. Replace the deploy and preview commands with `pnpm exec wrangler deploy` and `pnpm exec wrangler preview`.
4. Keep the build command as `pnpm run build`, root directory `/`, production branch `main`, and Node.js version `22`.
5. Set the production build variable `VITE_BASE_PATH=/`.
6. Enable preview builds.
7. Leave GitHub Pages as-is. The Pages workflow now installs with `pnpm install --frozen-lockfile` from the repository root and builds with `VITE_BASE_PATH=/3k-mlv/`.
8. Click Deploy in Cloudflare. Cursor does not do that step.
9. Copy the resulting `*.workers.dev` hostname.
10. Only after that hostname works, attach `mlv.gunnchos.com` from the Cloudflare dashboard. Do not hand-edit DNS in this change.

## Supabase build variables

The browser client reads only:

| Variable | Role |
|---|---|
| `VITE_SUPABASE_URL` | public project URL |
| `VITE_SUPABASE_ANON_KEY` | public anon / publishable key |

`packages/shared/src/supabase.ts` treats placeholders as unconfigured (`isSupabaseConfigured === false`). `apps/mlv-web/src/App.tsx` still renders the sign-in shell, warns that GitHub OAuth will not complete, and offers **Enter local test identity**. That path uses the in-browser private store. Online auth, player-instance RPC, and hosted presence need the two public variables present at build time.

Do not put any of these in `VITE_*` or in Git:

- Supabase service-role / dashboard admin key
- JWT signing secret
- OAuth client secret
- database password
- Cloudflare API token or GitHub token

No values are invented here. Cloudflare Git integration owns deploy credentials. `.env.local` and `.dev.vars` are gitignored.

## OAuth callback allow-list

The client redirects to `` `${window.location.origin}/auth/callback` ``. This playbook does not edit Supabase or GitHub OAuth settings.

When the owner later enables hosted auth, allow-list only the origins that should accept a real sign-in:

| Origin | Callback to add |
|---|---|
| Future custom domain | `https://mlv.gunnchos.com/auth/callback` |
| Worker production hostname | `https://<assigned-workers-dev-host>/auth/callback` |
| A specific Preview the owner wants to sign in from | `https://<that-preview-host>/auth/callback` |

The workers.dev host is assigned at first deploy. Do not guess the account subdomain. Preview hosts are per branch and also assigned by Cloudflare.

Do not add a wildcard `*.workers.dev` callback. Previews can keep the limited local-identity mode without OAuth. The existing rule in `docs/security/HOSTED_SUPABASE_OWNER_RUNBOOK.md` still applies: do not add wildcard production domains you do not own.

On Cloudflare the app is served at `/`, so origin + `/auth/callback` matches the SPA. GitHub Pages still hosts the built files under `/3k-mlv/`, but this client continues to send OAuth at the origin root `/auth/callback`. That redirect was not changed.

## What this does not do

- No production `wrangler deploy`
- No DNS change and no custom-domain route in `wrangler.jsonc`
- No product redesign
- No edits to other gunnchOS repositories
- Root `package-lock.json` is left in place. Cloudflare and Pages install with pnpm.

## Asset audit

Measured from the Cloudflare root build (`VITE_BASE_PATH=/`) on this branch. Re-run `pnpm run cloudflare:build` and `node scripts/validate-hosting-outputs.mjs --base /` after asset changes. Do not optimize assets unless a Cloudflare per-file limit (25 MiB) is actually exceeded.

Root build on this branch, `VITE_BASE_PATH=/`:

| Measure | Result |
|---|---|
| Total `apps/mlv-web/dist` | 1,614,603 bytes (1.54 MiB) |
| Largest GLB/GLTF | none in this build |
| Largest JS chunk | `assets/three-aUmQp_Et.js` — 718,489 bytes (701.6 KiB) |
| Files over the 25 MiB Workers asset limit | none |

Largest files:

| Size | File |
|---|---|
| 701.6 KiB | `assets/three-aUmQp_Et.js` |
| 347.2 KiB | `assets/vendor-O71xd7Ui.js` |
| 212.3 KiB | `assets/supabase-CznBku2g.js` |
| 165.6 KiB | `assets/react-three-BfDTvbn1.js` |
| 93.8 KiB | `assets/campus-BnQLMc81.js` |
| 27.1 KiB | `assets/index-CLQjMP4K.js` |
| 20.9 KiB | `workbox-dcde9eb3.js` |
| 1.9 KiB | `sw.js` |
| 1.9 KiB | `assets/index-dH_XKFLJ.css` |
| 1.5 KiB | `vite.svg` |
| 1.5 KiB | `assets/campus-A19g4XQw.css` |
| 1.0 KiB | `index.html` |
| 158 B | `manifest.webmanifest` |
| 134 B | `registerSW.js` |

The root manifest scope and start URL are `/`. Vite still warns that the three chunk is over 500 KiB. That is under the Cloudflare per-file limit, so this change does not split or redesign assets.

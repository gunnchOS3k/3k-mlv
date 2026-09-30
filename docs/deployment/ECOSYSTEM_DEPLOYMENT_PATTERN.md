# Ecosystem deployment pattern

Reusable hosting path for gunnchOS web apps. This document records the pattern. Only `gunnchOS3k/3k-mlv` is implemented here. Do not treat the other rows as deployed.

```text
source repo
→ build
→ Wrangler static assets
→ Worker Preview
→ production Worker
→ gunnchos.com custom subdomain
```

## Rules

1. Pin Wrangler in the repo (`4.135.0` or newer for Worker Previews). Call it with `pnpm exec wrangler` or the repo's package manager. Do not depend on a global binary.
2. Build a static `dist` and point `wrangler.jsonc` `assets.directory` at that output.
3. Use `not_found_handling: single-page-application` for client-routed apps.
4. Keep production at the Worker `/` base unless that app already has a required subpath.
5. Use `wrangler preview` for branch previews and `wrangler deploy` for production. Preview builds stay enabled in Workers Builds.
6. Put public browser config in `VITE_*` only when it is already safe to ship in the client. Never put service-role keys, OAuth client secrets, database passwords, or API tokens in frontend env.
7. Attach the custom subdomain only after the `workers.dev` host is up. DNS stays an owner dashboard step.
8. Leave any existing GitHub Pages (or other) host in place until the owner explicitly retires it. If that host needs a subpath, pass it with an explicit build variable such as `VITE_BASE_PATH`.

## Intended mappings

| Repository | Custom host |
|---|---|
| `3k-mlv` | `mlv.gunnchos.com` |
| `gunnchos-waike-learning-platform` | `campus.gunnchos.com` |
| `anime-aggressors` | `anime.gunnchos.com` |
| `pedestrian-pursuit` | `pursuit.gunnchos.com` |
| `archive-of-life-artifact-world` | `archive.gunnchos.com` |
| `beatlink-party` | `beatlink.gunnchos.com` |
| `gunnchos-research-portal` | `research.gunnchos.com` |

`3k-mlv` is the first instance: Cloudflare at `/`, existing GitHub Pages kept at `/3k-mlv/`. The other repositories are not modified by this change.

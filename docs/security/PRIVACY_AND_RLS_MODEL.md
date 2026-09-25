# Privacy and RLS model

**Security boundary:** PostgreSQL RLS + Storage policies + share-token RPCs.  
**Not the security boundary:** React, Three.js, CSS hiding, “locked” placeholders.

## Default

All new `mlv_nodes` rows are `visibility = private`.  
No app may request PUBLIC as the default (`GunnchOSArtifactIntent.default_visibility` is const `private`).

## Invariants

```text
User A cannot SELECT User B PRIVATE metadata.
User A cannot obtain User B PRIVATE bytes.
Anonymous cannot read PRIVATE metadata.
Anonymous cannot read SHARED by guessing UUID.
Valid SHARED token exposes only the intended node.
Revoked / expired token stops working.
Anonymous may read PUBLIC.
Only the owner may mutate nodes / placements / viewers’ share links.
PRIVATE placement never becomes public.
```

## Table policy summary

| Table | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `mlv_nodes` | owner; or `public` and not deleted; SHARED **only** via `mlv_open_share(token)` RPC | owner only |
| `mlv_share_links` | owner only (hash visible to owner; raw token never stored) | owner only |
| `mlv_world_placements` | same visibility as the joined node | owner only |
| `mlv_player_instances` | owner only | owner only |

Legacy `projects` and `house_layouts` lose their `USING (true)` select policies in `0002_tighten_legacy_public_reads.sql`. Profiles remain publicly readable as **identity**, not as file metadata.

## Share tokens

1. Client generates a cryptographically random bearer token.
2. Server stores `sha256(token)` only.
3. `mlv_open_share(p_token)` hashes the presented token, checks `revoked_at` / `expires_at`, and returns **that node only**.
4. Guessing a node UUID must not reveal SHARED metadata.

## Storage

- `mlv-private`: authenticated owner **or** successful share RPC → short-lived signed URL
- `mlv-public`: PUBLIC nodes only
- Changing PRIVATE → PUBLIC requires explicit confirmation in the UI
- Changing PUBLIC → PRIVATE removes public discoverability and the public storage path as far as the platform allows

## Leakage ban

Do not expose private filename, hierarchy, file count, unpublished placements, recent private activity, local paths, or storage keys via views, joins, presence, counts, thumbnails, or realtime.

## What this prototype does **not** claim

End-to-end encryption, production malware scanning, perfect offline encrypted sync, enterprise DLP.

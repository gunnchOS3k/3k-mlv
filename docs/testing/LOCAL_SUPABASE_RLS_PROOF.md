# Local PostgreSQL RLS proof

Proven: **YES (local PGlite Postgres)**

Local PostgreSQL RLS isolation proven via PGlite. Not hosted/production security.

## Host availability

- Docker: unavailable
- Supabase CLI: unavailable
- Homebrew PostgreSQL: unavailable
- Fallback engine: PGlite (real PostgreSQL, in-process)

This is **not** hosted Supabase validation. Owner still must authorize a hosted project, apply migrations, and configure GitHub OAuth.

## Cases

- PASS `alice_reads_private_node` — pass
- PASS `bob_cannot_select_private_node` — pass
- PASS `anonymous_cannot_select_private_node` — pass
- PASS `bob_cannot_infer_private_filename_or_count` — pass
- PASS `shared_uuid_alone_does_not_grant_access` — pass
- PASS `valid_share_token_opens_only_intended_node` — pass
- PASS `revoked_token_fails` — pass
- PASS `expired_token_fails` — pass
- PASS `anonymous_reads_public_node` — pass
- PASS `unpublish_removes_public_access` — pass
- PASS `bob_cannot_update_or_delete_alice_node` — pass
- PASS `private_placement_does_not_leak` — pass
- PASS `alice_can_read_own_private_storage_object` — pass
- PASS `bob_cannot_read_alice_private_storage_object` — pass


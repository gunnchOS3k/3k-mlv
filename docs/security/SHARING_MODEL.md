# Sharing model

## Three visibilities

| Badge | Meaning | Discoverable | Who can view | Who can edit |
|---|---|---|---|---|
| Keep Private | Owner player instance only | No | Owner | Owner |
| Share Link | Unlisted portal | No | Anyone with a valid token | Owner |
| Publish | Public gallery | Yes | Anyone, including anonymous | Owner |

v1: owner remains the only editor.

## Share link flow

1. Owner chooses **Share Link**.
2. Client generates a high-entropy random token (not a UUID of the node).
3. Server stores `token_hash` + permission (`view` \| `download`) + optional `expires_at`.
4. Owner copies `gunnchos://mlv/share/<token>` or the https equivalent.
5. Recipient presents the raw token once; server hashes and authorizes.
6. Owner may revoke. Revoked and expired tokens fail closed.

Raw tokens are never written to SQL, logs, analytics, or presence.

## Publish / unpublish

- **Publish** requires an explicit confirmation (“this will be discoverable”).
- Published nodes may appear in public neighborhood / gallery queries.
- **Make Private** sets `visibility = private`, drops public discovery, and revokes the public storage path as far as the platform supports.
- Existing share links are independent: making a node private should also revoke active share links unless the owner keeps a specific link (v1 revokes them).

## Discovery rules

- SHARED links are excluded from public search, counts, and neighborhood listing.
- Visitors of a home see PUBLIC nodes only, plus the exact SHARED node of a valid share context.
- PRIVATE nodes are omitted entirely.

## Tests

See `docs/testing/TWO_USER_PRIVACY_TEST.md` and `tests/privacy/two_user_privacy.test.mjs`.

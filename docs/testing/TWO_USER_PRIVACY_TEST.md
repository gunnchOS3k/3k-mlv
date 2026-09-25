# Two-user privacy test (Alice / Bob / anonymous)

Deterministic harness. Fail the PR if any isolation assertion fails.

## Actors

- **Alice** — authenticated owner
- **Bob** — authenticated other user
- **Anonymous** — no session

## Scenario

1. Alice signs in.
2. Alice uploads `private-notes.md`.
3. It defaults PRIVATE.
4. Alice can read it.
5. Bob visits Alice and cannot query or see the private node (absent, not locked).
6. Alice SHARES an image (unlisted token).
7. Anonymous with the valid token can view **that** image only.
8. The shared image does **not** appear in public discovery.
9. Alice PUBLISHES a PDF (explicit confirmation).
10. Anonymous discovers and views the PDF.
11. Alice makes the PDF private.
12. Anonymous loses public access.
13. Alice revokes the image share.
14. The revoked token fails.
15. `gunnchos://mlv/home` and `gunnchos://mlv/node/<uuid>` parse to the MLV home/node routes.

Also required:

- anonymous cannot read SHARED by UUID
- expired token fails
- non-owner cannot mutate
- placement cannot expose PRIVATE

## How to run

```bash
node --test tests/privacy/two_user_privacy.test.mjs
```

This harness is an in-memory RLS/share-token simulator. It does **not** replace a live Supabase RLS run against a real project. Live evidence is still required before any production-security claim.

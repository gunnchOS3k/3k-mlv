# Cross-repo Anime return contract (MLV → Anime)

Package: `com.gunnchos.animeaggressors`

MLV persists:
```json
{
  "world": "HOME",
  "zone": "MEDIA_ROOM",
  "anchor": "DOCK_CHAIR",
  "avatarPosition": [2.0, 0, -3.6],
  "avatarFacing": 3.14,
  "session": "mlv-..."
}
```
Storage keys: `mlv.v4_2.return_context` (localStorage + sessionStorage).

Anime-side optional companion (same PR #118 when safe): on resume/deep-link `mlv_return=1`, bring user back to browser/PWA. Not required for MLV persistence proof.

PHYSICAL_EDGE_IO_RINGS_VALIDATION_PENDING=true

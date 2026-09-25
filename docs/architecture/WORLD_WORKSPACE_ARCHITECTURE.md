# 3k MLV × gunnchOS — World Workspace Architecture v1

## Product statement

3k MLV (My Little Vicinity) is an optional **World Workspace** for gunnchOS: a game-like spatial shell where a user's creations, projects, and files live as objects inside their personal player instance.

The world is the interface, not the security boundary. gunnchOS remains responsible for identity, app launch, privacy policy, offline policy, accessibility, and file capabilities.

## Privacy model

Every node belongs to one owner.

```text
PRIVATE = only in my player instance          (default)
SHARED  = anyone I give the portal/link to may view
PUBLIC  = anyone may discover and view
```

- PRIVATE items are **absent** to visitors, not locked placeholders.
- SHARED links are unlisted and excluded from discovery.
- PUBLIC read never grants edit/delete.
- Placement never overrides node visibility.

## Player instance

A player instance is a logical private workspace namespace.

```text
Vicinity
└── Player Instance
    ├── Home
    │   ├── Desk
    │   ├── Shelves
    │   ├── Gallery Wall
    │   ├── Arcade / Games
    │   └── Project Portals
    ├── Backpack / Recent Files
    ├── Studio
    ├── Lab
    └── Private Storage
```

## Data model

See `infra/migrations/0001_mlv_world_workspace.sql`.

- `mlv_nodes` — files, folders, projects, shortcuts, creations
- `mlv_share_links` — hashed tokens only; never raw bearer tokens
- `mlv_world_placements` — spatial presentation of an already-authorized node
- `mlv_player_instances` — home theme, spawn, world_config

## Storage

```text
mlv-private  -> PRIVATE + SHARED bytes (signed URL after authorization)
mlv-public   -> intentionally PUBLIC bytes
```

Do not place private content in GitHub Pages, Vite `/public`, or a public CDN.  
Do not claim end-to-end encryption. This prototype is **not** E2EE.

## World-object metaphor

| Content | Spatial object |
|---|---|
| PDF/book | book / reading stand |
| image | framed wall art |
| video | screen |
| audio | record/player |
| code/repo | terminal/workbench |
| game build | arcade cabinet |
| GLB/3D | pedestal/hologram |
| WAIKE work | notebook / lesson station |
| research data | lab console |
| folder/project | chest / shelf / portal |
| generic file | parcel / file card |

Opening an object launches a safe viewer or a gunnchOS app intent.

## gunnchOS integration

MLV consumes identity; it does not own it.

```text
gunnchOS identity → 3k MLV → WAIKE → Anime Aggressors → Pedestrian Pursuit → creator/research apps
```

Deep links: `gunnchos://mlv/home`, `/node/<uuid>`, `/public/<uuid>`, `/share/<token>`.

Bridge contract lives in `gunnchos-device-os`: `src/gunnchos_launcher/mlv_bridge.py`.

## Offline (honest minimum)

- Shell / world layout can load
- Own recent metadata may cache
- Explicitly pinned files may load if present
- Local changes may queue
- Public / social features degrade

Not claimed: production conflict resolution or encrypted sync.

## Accessibility

Spatial 3D is optional presentation. A list/grid file view must provide every critical action (upload, rename, move, delete, share, publish, make private, open) without requiring 3D navigation.

## Claim boundary

Prototype World Workspace. Not a production secure OS, not E2EE, not enterprise cloud, not production MDM, not malware-free uploads, not production multiplayer.

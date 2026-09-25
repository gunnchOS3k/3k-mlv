# gunnchOS integration

3k MLV is a **consumer** of gunnchOS identity, launcher policy, journey presets, offline policy, and accessibility. It is not the identity authority.

## App registration

Register as **My Little Vicinity** (`mlv_world_workspace`) in `gunnchos-device-os`.

## Bridge contract

Implemented in `gunnchos-device-os` as `src/gunnchos_launcher/mlv_bridge.py`:

```text
open_home()
open_node(node_id)
open_public_node(node_id)
open_share(token)
launch_app_for_node(node)
get_recent_nodes()
```

## Deep links

```text
gunnchos://mlv/home
gunnchos://mlv/node/<uuid>
gunnchos://mlv/public/<uuid>
gunnchos://mlv/share/<token>
```

The web app also accepts the same path on `https://…/#/mlv/...` for browser/PWA smoke.

## Journey presets

| Preset | MLV posture |
|---|---|
| Studio, Arcade, Workshop | recommended |
| Car, Laboratory, Spaceship | available |
| Offline | cached owner subset only |
| Library | public browsing / ephemeral guest only |
| Classroom, Guardian | policy-controlled — not auto-enabled |
| Scooter, Bicycle | not the default 3D path |

Do not weaken existing youth / library / guardian rules.

## Artifact intent

WAIKE (or any app) emits `GunnchOSArtifactIntent` with `default_visibility: "private"`.  
MLV creates a PRIVATE node and places it on the owner’s desk. Share/Publish is an explicit owner action.

Schema: `gunnchos-device-os/shared_contracts/mlv_artifact_intent.schema.json`.

## Identity

```text
gunnchOS identity → MLV → WAIKE → Anime Aggressors → Pedestrian Pursuit → creator/research apps
```

GitHub OAuth is provider v1. Ownership IDs stay stable if SSO later replaces the provider.

# Pixel / PWA physical acceptance — My Little Vicinity

Physical review of the **real user journey**, not a page-render smoke.
Owner / device gates stay unanswered until a human records them on a Pixel
(or equivalent Android device) against an exact reviewed build.

```text
MLV_PIXEL_PHYSICAL_PASS=false
```

---

## Build under review

Record these before starting. Do not accept a journey against an unknown SHA.

| Field | Value |
|---|---|
| 3k MLV git SHA | |
| gunnchOS git SHA | |
| PR | `gunnchOS3k/3k-mlv#1` (must stay draft until accepted) |
| Build Info / version shown in UI | |
| Device | Pixel (model) |
| Android / Chrome versions | |
| Network | Wi-Fi / offline |
| Date | |

---

## Required journey

```text
gunnchOS
→ My Little Vicinity
→ private home/world
→ create/upload artifact
→ open artifact
→ confirm PRIVATE
→ share unlisted
→ open valid share as intended
→ revoke
→ publish explicit PUBLIC
→ unpublish
→ return/deep-link into gunnchOS
```

---

## Checklist

Mark each item only after a human performs it. Default is unanswered.

### Launch and identity

| # | Check | Pass? | Notes |
|---|---|---|---|
| 1 | gunnchOS launcher shows **My Little Vicinity** | | |
| 2 | Opening MLV lands in a **private home/world** (no fake/sample friend houses) | | |
| 3 | Sign-in / identity is real (GitHub OAuth or authorized test user), not a stub | | |
| 4 | Build Info / SHA is visible enough to prove this exact build | | |

### Private artifact

| # | Check | Pass? | Notes |
|---|---|---|---|
| 5 | Create/upload an artifact | | |
| 6 | New file is **PRIVATE** without extra confirmation | | |
| 7 | Owner can open it | | |
| 8 | File viewer does **not** execute arbitrary HTML/JS | | |
| 9 | Private file never appears in public/discovery views | | |

### Unlisted share

| # | Check | Pass? | Notes |
|---|---|---|---|
| 10 | Share unlisted creates a link | | |
| 11 | Share token is **not** shown in logs or debug UI | | |
| 12 | Intended recipient can open the valid share | | |
| 13 | Second account cannot discover the file via normal listing | | |
| 14 | Revoke immediately blocks the old link | | |

### Explicit public

| # | Check | Pass? | Notes |
|---|---|---|---|
| 15 | Publish requires an explicit PUBLIC action | | |
| 16 | Anonymous/public open works after publish | | |
| 17 | Unpublish removes public access and discovery | | |

### Device / PWA ergonomics

| # | Check | Pass? | Notes |
|---|---|---|---|
| 18 | Touch targets are usable with a thumb | | |
| 19 | Portrait is usable; landscape does not clip primary actions (if supported) | | |
| 20 | Android back returns to the previous MLV surface, then gunnchOS | | |
| 21 | PWA install/open works if in scope for this build | | |
| 22 | Offline / error states are honest (no fake success) | | |
| 23 | Deep link `gunnchos://mlv/...` or documented https equivalent returns into gunnchOS without echoing a share token | | |

---

## Evidence to retain

- Screenshot of private home with Build Info / SHA
- Screenshot of PRIVATE badge on the uploaded file
- Screenshot of share/revoke and publish/unpublish (no raw token visible)
- Short screen recording of the full journey if possible
- `adb logcat` excerpt proving no share token was printed (sanitize before sharing)

---

## Honest fail conditions

Fail the packet if any of these happen:

- sample/fake friend houses appear in the production path
- a new upload is PUBLIC or SHARED without an explicit action
- HTML/JS from a user file executes in the viewer
- a share token is visible in UI, logs, or a deep-link debug string
- the build SHA cannot be identified

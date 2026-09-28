# Pixel review — 7GC campus digital twins

Owner visits all seven digital campuses and checks that each has a distinct
spatial/program identity and correct WAIKE access. Human visual gates stay
false until that review happens on an exact reviewed build.

```text
PIXEL_7GC_CAMPUS_PASS=false
HUMAN_7GC_SPATIAL_FIDELITY_PASS=false
HUMAN_LOCAL_IDENTITY_PASS=false
HUMAN_CAMPUS_USABILITY_PASS=false
HOSTED_MULTIUSER_PASS=false
MERGE_AUTHORIZED=false
NEXT_3K_MLV_ACTION=OWNER_REVIEW_SEVEN_DIGITAL_CAMPUSES_AND_SOURCE_FIDELITY
```

## Build under review

| Field | Value |
|---|---|
| 3k MLV git SHA | |
| Parent PR | `gunnchOS3k/3k-mlv#1` |
| Child PR | stacked draft on `#1` |
| Device | Pixel (model) |
| Date | |

## Required journey

```text
Home (PRIVATE)
→ Campus landing
→ 7GC Atlas
→ each of 7 digital campuses (list + map)
→ phase selector
→ specialist rooms + WAIKE contract surfaces
→ evidence panel
→ Gaza recovery node (no coordinates)
→ Graham Land twin (no fake station claim)
→ Library / Study Rooms / Lecture Hall / Media Center
→ Gallery (PUBLIC only)
→ return Home without leaking PRIVATE files
```

## Checklist

| # | Check | Pass? | Notes |
|---|---|---|---|
| 1 | Campus landing shows My WAIKE / Academic Center / Library / Study Rooms / Lecture Hall / Media Center / 7GC Atlas | | |
| 2 | Atlas shows 7 cards with name, planning model, phase, local focus, truth state, Enter Digital Campus | | |
| 3 | Gary is civic/workforce, not a palette swap | | |
| 4 | Ghana is Ghana-led, not foreign-branch styling | | |
| 5 | Guyana shows climate/GIS and river/climate awareness | | |
| 6 | Geelong is industrial but welcoming, design/build present | | |
| 7 | Germany is precise, worker-respecting, Industry 4.0 / docs present | | |
| 8 | Gaza is recovery/offline-first; no sensitive locations or disaster branding | | |
| 9 | Graham Land is a remote polar twin, not a fake Antarctic campus | | |
| 10 | Phase selector changes the available program | | |
| 11 | Every major function works in list/map without 3D walking | | |
| 12 | WAIKE Today / Continue / Courses / Assignments / Grades / Calendar / Study / Ask gunnchAI do not invent LMS rows | | |
| 13 | Study room ACL is explicit; friend does not auto-enter | | |
| 14 | Gallery shows PUBLIC only; edit creates a private working copy | | |
| 15 | Home PRIVATE files never appear on Campus or Gallery | | |

## List-mode captures

See `artifacts/campus/captures/` and `artifacts/campus/CAPTURE_INDEX.json`.
These are authored HTML planning-twin captures, not a human Pixel pass.

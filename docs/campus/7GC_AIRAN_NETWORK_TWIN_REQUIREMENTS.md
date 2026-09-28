# 7GC AI-RAN Network Twin requirements

This layer is **separate** from the canonical 473 Campus V2 urban-planning/source requirements.

Campus V2 remains the authoritative campus/program graph. Network Twin is an additive planning projection.

## Identity

Every Network Twin zone must keep:

- `campus_slug`
- `phase`
- `campus_requirement_id`
- `digital_object`
- `digital_route`
- `geometry_fidelity` = `AUTHORED_PLANNING_LAYOUT`
- `source_manifest_sha256` = current Campus V2 source-version identifier

Representative IDs:

- `GARY.FULL.HARDWARE_REPAIR_LAB`
- `GHANA.FULL.MENTOR_WORKSPACE`
- `GUYANA.FULL.CLIMATE_GIS_STUDIO`
- `GEELONG.FULL.DESIGN_BUILD_STUDIO`
- `GERMANY.FULL.INDUSTRY40_TWIN_LAB`
- `GAZA.RECOVERY.OFFLINE_LEARNING_STUDIO`
- `GRAHAM.FULL.NTN_LAB`

Do not create a second room catalog.

## Requirements

1. Network Twin Lab lives inside existing Campus navigation. Default layer is Campus.
2. MLV produces `gunnchos.campus_design_bundle` and consumes `gunnchos.campus_optimization_result`. It does not reimplement SpectrumX.
3. Candidate infrastructure is PLANNING ONLY. Allowed action: `Apply to Digital Proposal`.
4. Service-intent templates are planning assumptions, not measured traffic and not WAIKE learner records.
5. Predicted vs measured must say `MEASURED DATA: NOT AVAILABLE` until authentic physical evidence exists. Phase-1 fixtures render as `OFFLINE DEMO / SYNTHETIC`.
6. RIC UI may show SIMULATION ONLY / READ ONLY / RECOMMENDATION ONLY / SHADOW. AUTHORIZED TESTBED and PRODUCTION stay disabled.
7. No browser RAN credentials and no direct browser E2 / srsRAN / OAI / O-RAN SC actuation.
8. WAIKE Academic Center consumes PR #25 `GET /api/v1/mlv/consumer-summary` and `waike://` deep links. Unbound mode uses a labeled fixture. Do not claim 18/18 fully learner-ready.
9. Gaza stays abstract/redacted. Graham stays remote-first with no fake station claim.
10. Human, Pixel, hosted, physical, and merge gates remain false until independently proven.

## Geometry

Existing Campus V2 geometry is `AUTHORED_PLANNING_LAYOUT`. Do not label it surveyed, as-built, BIM-derived, or field-validated.

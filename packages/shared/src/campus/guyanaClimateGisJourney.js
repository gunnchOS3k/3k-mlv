/**
 * Guyana climate/GIS specialty: flood/drainage uncertainty → map → logistics note → portfolio → Home.
 * Synthetic public-planning scenario only; never includes sensitive community data.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';

export const GUYANA_CLIMATE_JOURNEY_ID = 'guyana.climate_gis.flood_to_portfolio';

export const GUYANA_CLIMATE_STEPS = Object.freeze([
  {
    id: 'flood_scenario',
    room_key: 'CLIMATE_GIS_WORKSTATION',
    phase_hint: 'pilot',
    title: 'Frame flood / drainage uncertainty',
    produces: 'scenario_brief',
    min_chars: 16,
  },
  {
    id: 'drainage_map',
    room_key: 'CLIMATE_GIS_DATA_STUDIO',
    phase_hint: 'semi',
    title: 'Draft drainage / flood literacy map',
    produces: 'map_export',
    min_chars: 16,
  },
  {
    id: 'energy_logistics',
    room_key: 'ENERGY_LOGISTICS_STUDIO',
    phase_hint: 'semi',
    title: 'Link energy / logistics resilience note',
    produces: 'logistics_note',
    min_chars: 12,
  },
  {
    id: 'portfolio_artifact',
    room_key: 'CAREER_PORTFOLIO_STUDIO',
    phase_hint: 'semi',
    title: 'Private offline portfolio package',
    produces: 'portfolio_item',
    min_chars: 16,
  },
  {
    id: 'save_and_return',
    room_key: 'PRESENTATION_WALL',
    phase_hint: 'pilot',
    title: 'Save and return Home',
    produces: 'home_return_receipt',
    min_chars: 2,
  },
]);

export function createGuyanaClimateGisJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GUYANA_CLIMATE_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'guyana',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.guyana',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      active_room_key: null,
      active_phase_hint: 'pilot',
      saved: false,
      returned_home: false,
      data_status: 'synthetic',
      uncertainty: 'Public planning scenario only; not field-validated impact.',
      waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.CLIMATE_GIS_STUDIO),
    },
  };
}

export function advanceGuyanaClimateGisJourney(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  if (!journey || journey.journey_id !== GUYANA_CLIMATE_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  const step = GUYANA_CLIMATE_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const expected = GUYANA_CLIMATE_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  const text = String(learnerInput || '').trim();
  if (text.length < step.min_chars) return { ok: false, reason: 'insufficient_learner_work', required_chars: step.min_chars };

  if (stepId === 'flood_scenario' && !/uncertain|synthetic|planning|not field/i.test(text)) {
    return { ok: false, reason: 'uncertainty_honesty_required' };
  }

  const next = {
    ...journey,
    updated_at: now,
    completed_step_ids: [...journey.completed_step_ids, stepId],
    active_room_key: step.room_key,
    active_phase_hint: step.phase_hint,
    artifacts: {
      ...journey.artifacts,
      [step.produces]: {
        step_id: stepId,
        room_key: step.room_key,
        created_at: now,
        body: text,
        visibility: stepId === 'portfolio_artifact' ? VISIBILITY.PRIVATE : 'learner_private',
        includes_sensitive_community_data: false,
      },
    },
  };

  let privateNode = null;
  if (stepId === 'portfolio_artifact') {
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Guyana climate/GIS portfolio',
      mimeType: 'application/json',
      extra: {
        id: `guyana-climate-portfolio-${now}`,
        campus_slug: 'guyana',
        journey_id: journey.journey_id,
        room_key: step.room_key,
        representation_state: 'planning_concept',
        body: text,
        scenario: {
          topic: 'drainage_flood_literacy',
          uncertainty: journey.uncertainty,
          data_status: journey.data_status,
          map_export: { format: 'offline_portfolio_json', includes_sensitive_community_data: false },
        },
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
      },
    });
    next.artifacts.portfolio_item.private_node_id = privateNode.id;
    next.artifacts.portfolio_item.visibility = VISIBILITY.PRIVATE;
  }

  if (stepId === 'save_and_return') {
    if (!next.artifacts.portfolio_item) return { ok: false, reason: 'portfolio_required_before_save' };
    next.saved = true;
    next.returned_home = true;
  }

  const complete = next.completed_step_ids.length === GUYANA_CLIMATE_STEPS.length;
  return {
    ok: true,
    journey: next,
    step,
    complete,
    private_node: privateNode,
    active_room_key: step.room_key,
    active_phase_hint: step.phase_hint,
    nav_only: false,
  };
}

export function guyanaClimateGisProgress(journey) {
  const total = GUYANA_CLIMATE_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GUYANA_CLIMATE_STEPS[done] || null,
    complete: done === total,
    active_room_key: journey?.active_room_key || null,
    representation_state: 'planning_concept',
  };
}

export function runGuyanaClimateGisPlayable({ learnerId = 'learner-gy', now = '2026-10-30T16:10:00.000Z' } = {}) {
  const created = createGuyanaClimateGisJourney({ learnerId, now });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    flood_scenario: 'Planning scenario with uncertainty: synthetic drainage overlays; not field-validated impact.',
    drainage_map: 'Offline map package: river-spine flood literacy layers, no household identifiers.',
    energy_logistics: 'Energy/logistics note: raised spine access during flood drill (planning concept).',
    portfolio_artifact: 'Portfolio: scenario brief + drainage map + logistics note as offline JSON (private).',
    save_and_return: 'OK',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GUYANA_CLIMATE_STEPS) {
    const result = advanceGuyanaClimateGisJourney(journey, step.id, {
      learnerInput: inputs[step.id],
      now,
      actorId: learnerId,
    });
    if (!result.ok) return { ok: false, reason: result.reason, at: step.id, transcript };
    journey = result.journey;
    if (result.private_node) privateNode = result.private_node;
    transcript.push({
      step_id: step.id,
      room_key: step.room_key,
      phase_hint: step.phase_hint,
    });
  }
  return {
    ok: true,
    journey,
    transcript,
    private_node: privateNode,
    private_visibility: privateNode?.visibility === VISIBILITY.PRIVATE,
    rooms_include_climate_gis: transcript.some(
      (t) => t.room_key === 'CLIMATE_GIS_WORKSTATION' || t.room_key === 'CLIMATE_GIS_DATA_STUDIO',
    ),
    scenario: {
      topic: 'drainage_flood_literacy',
      uncertainty: journey.uncertainty,
      data_status: journey.data_status,
      map_export: { format: 'offline_portfolio_json', includes_sensitive_community_data: false },
    },
    returned_home: journey.returned_home === true,
    location_id: 'loc.campus.guyana',
    representation_state: 'planning_concept',
    schematic_planning_twin_only: true,
    PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    nav_only: false,
  };
}

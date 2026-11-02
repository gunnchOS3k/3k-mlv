/**
 * Playable Home/Campus/Gallery learner experiences.
 * Not a nav prototype: each step binds a room, produces private artifacts,
 * links WAIKE surfaces, and supports offline save/resume with conflict checks.
 */

import { createPrivateNode, VISIBILITY } from '../privacyPolicy.js';
import {
  GARY_PILOT_STEPS,
  advanceGaryPilotJourney,
  createGaryPilotJourney,
  garyPilotJourneyProgress,
  resumeGaryPilotJourney,
} from './garyPilotJourney.js';
import { loadLocationRecord, sceneStateLabel } from './locationRecords.js';
import { specialistWaikeDeepLink } from './waikeContract.js';
import { runGeelongDesignBuildPlayable } from './geelongDesignBuildJourney.js';
import { runGermanyApprenticeshipPlayable } from './germanyApprenticeshipJourney.js';
import { runGuyanaClimateGisPlayable } from './guyanaClimateGisJourney.js';
import { runGrahamPolarTwinPlayable } from './grahamPolarTwinJourney.js';
import { runGhanaOfflineRoomPlayable } from './ghanaOfflineRoomJourney.js';
import { runGazaRecoveryRoomPlayable } from './gazaRecoveryRoomJourney.js';

export const PLAYABLE_ACCEPTANCE_NOTE =
  'Learner acceptance requires completed specialty tasks, private artifacts, and Home return — not navigation alone.';

const GARY_TASK_PROMPTS = Object.freeze({
  welcome_device_help: {
    prompt: 'Describe the device issue you need help with (civic/device help desk).',
    field: 'device_issue',
    waike_surface: 'study',
    min_chars: 8,
  },
  classroom_lab: {
    prompt: 'Complete the hardware-cart lab: note what you built/tested.',
    field: 'lab_notes',
    waike_surface: 'courses',
    min_chars: 8,
    specialist_track: 'IT_SUPPORT_HARDWARE',
  },
  portfolio_artifact: {
    prompt: 'Document a private portfolio artifact from the lab (stays private until publish).',
    field: 'portfolio_body',
    waike_surface: 'grades',
    min_chars: 12,
  },
  feedback_showcase: {
    prompt: 'Prepare community showcase talking points (still private until explicit publish).',
    field: 'showcase_notes',
    waike_surface: 'calendar',
    min_chars: 8,
  },
  repair_lab_peek: {
    prompt:
      'Note what you observed in the visible repair lab (schematic planning twin only — not an as-built physical lab claim).',
    field: 'repair_notes',
    waike_surface: 'courses',
    min_chars: 8,
    specialist_track: 'IT_SUPPORT_HARDWARE',
  },
  gallery_walk: {
    prompt: 'Describe one demo gallery station you walked (planning twin — not Pixel).',
    field: 'gallery_notes',
    waike_surface: 'calendar',
    min_chars: 8,
  },
  save_progress: {
    prompt: 'Confirm save of offline-capable journey state.',
    field: 'save_confirm',
    waike_surface: 'continue',
    min_chars: 2,
  },
  resume_and_home: {
    prompt: 'Resume and return Home without exposing private drafts.',
    field: 'home_confirm',
    waike_surface: 'today',
    min_chars: 2,
  },
});

export function garyTaskPrompt(stepId) {
  return GARY_TASK_PROMPTS[stepId] || null;
}

/** Run one Gary step with required learner content; mint private Home node on portfolio. */
export function playGaryPilotStep(journey, stepId, { learnerInput = '', now = new Date().toISOString(), actorId } = {}) {
  const prompt = GARY_TASK_PROMPTS[stepId];
  if (!prompt) return { ok: false, reason: 'unknown_step' };
  const text = String(learnerInput || '').trim();
  if (text.length < prompt.min_chars) {
    return { ok: false, reason: 'insufficient_learner_work', required_chars: prompt.min_chars };
  }
  // Repair lab is a schematic planning twin — refuse as-built / physical facility claims.
  if (
    stepId === 'repair_lab_peek' &&
    !/planning(\s|-)?twin|schematic|not (an? )?(as-built|physical)|twin only|not a (real|physical) (lab|facility)/i.test(
      text,
    )
  ) {
    return { ok: false, reason: 'repair_lab_planning_twin_honesty_required' };
  }
  const payload = {
    [prompt.field]: text,
    waike_surface: prompt.waike_surface,
    waike_deep_link: `#/mlv/academic/${prompt.waike_surface}`,
    specialist_deep_link: prompt.specialist_track
      ? specialistWaikeDeepLink(prompt.specialist_track)
      : null,
    room_bound: true,
    playable: true,
    ...(stepId === 'repair_lab_peek'
      ? { repair_lab_planning_twin_only: true, as_built_facility_claim: false }
      : {}),
  };
  const advanced = advanceGaryPilotJourney(journey, stepId, { payload, now });
  if (!advanced.ok) return advanced;

  let privateNode = null;
  if (stepId === 'portfolio_artifact') {
    privateNode = createPrivateNode({
      ownerId: actorId || journey.learner_id,
      name: 'Gary pilot portfolio artifact',
      mimeType: 'text/plain',
      extra: {
        id: `gary-portfolio-${now}`,
        campus_slug: 'gary',
        journey_id: journey.journey_id,
        room_key: 'QUIET_SUPPORT_AREA',
        representation_state: 'planning_concept',
        body: text,
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
      },
    });
    advanced.journey.artifacts.portfolio_item.private_node_id = privateNode.id;
    advanced.journey.artifacts.portfolio_item.visibility = VISIBILITY.PRIVATE;
  }

  const location = loadLocationRecord('loc.campus.gary');
  return {
    ok: true,
    journey: advanced.journey,
    step: advanced.step,
    complete: advanced.complete,
    progress: garyPilotJourneyProgress(advanced.journey),
    active_room_key: advanced.step.room_key,
    scene_label: sceneStateLabel(location),
    private_node: privateNode,
    waike_surface: prompt.waike_surface,
    acceptance: PLAYABLE_ACCEPTANCE_NOTE,
    PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    HUMAN: false,
    RC2: false,
    V1: false,
  };
}

/** Full Gary playable path with distinct learner inputs — proves not nav-only. */
export function runGaryPlayableAcceptance({ learnerId = 'learner-a', nowBase = '2026-10-30T12:00:00.000Z' } = {}) {
  const created = createGaryPilotJourney({ learnerId, now: nowBase });
  if (!created.ok) return created;
  let journey = created.journey;
  const inputs = {
    welcome_device_help: 'Phone will not join civic Wi-Fi; need help updating settings.',
    classroom_lab: 'Assembled network drop cable on mobile hardware cart and verified link light.',
    portfolio_artifact: 'Portfolio: documented cable build steps and civic device-help checklist.',
    feedback_showcase: 'Showcase: three slides on device help + lab outcome for community night.',
    repair_lab_peek:
      'Repair lab (schematic planning twin only): traced open bench workflow and labeled tool wall — not an as-built physical lab claim.',
    gallery_walk: 'Gallery: noted demo kiosk layout for community night without claiming Pixel fidelity.',
    save_progress: 'OK',
    resume_and_home: 'OK',
  };
  const transcript = [];
  let privateNode = null;
  for (const step of GARY_PILOT_STEPS) {
    const result = playGaryPilotStep(journey, step.id, {
      learnerInput: inputs[step.id],
      now: nowBase,
      actorId: learnerId,
    });
    if (!result.ok) return { ok: false, reason: result.reason, at: step.id, transcript };
    journey = result.journey;
    if (result.private_node) privateNode = result.private_node;
    transcript.push({
      step_id: step.id,
      room_key: step.room_key,
      waike_surface: result.waike_surface,
      artifact_keys: Object.keys(journey.artifacts),
    });
  }
  const resumed = resumeGaryPilotJourney(journey, { now: nowBase });
  const repairNote = resumed.journey.artifacts?.repair_lab_note;
  return {
    ok: true,
    journey: resumed.journey,
    transcript,
    private_node: privateNode,
    private_visibility: privateNode?.visibility === VISIBILITY.PRIVATE,
    returned_home: resumed.journey.returned_home === true,
    nav_only: false,
    rooms_bound: transcript.every((t) => Boolean(t.room_key)),
    waike_linked: transcript.every((t) => Boolean(t.waike_surface)),
    repair_lab_planning_twin_only: repairNote?.payload?.repair_lab_planning_twin_only === true,
    as_built_facility_claim: repairNote?.payload?.as_built_facility_claim === true,
    acceptance: PLAYABLE_ACCEPTANCE_NOTE,
    PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    HUMAN: false,
    RC2: false,
    V1: false,
  };
}

/** Nubuke heritage playable slice with matched source/model viewpoints. */
export function runNubukePlayableAcceptance({ learnerId = 'learner-a', observation, now = new Date().toISOString() } = {}) {
  const text = String(observation || '').trim();
  if (text.length < 20) return { ok: false, reason: 'insufficient_observation' };
  const record = loadLocationRecord('loc.heritage.nubuke');
  const label = sceneStateLabel(record);
  const matched_views = [
    { id: 'approach', title: 'Approach / orientation', source_ids: record.source_ids, model_status: 'qualitative_topology' },
    { id: 'garden_gallery', title: 'Garden / gallery relationship', source_ids: ['S-NUBUKE-ARCHITECT', 'S-NUBUKE-FOUNDATION'], model_status: 'qualitative_topology' },
    { id: 'bungalow', title: 'Bungalow / outdoor gathering', source_ids: ['S-NUBUKE-FOUNDATION'], model_status: 'qualitative_topology' },
  ];
  const privateNode = createPrivateNode({
    ownerId: learnerId,
    name: 'Nubuke learning observation',
    mimeType: 'text/plain',
    extra: {
      id: `nubuke-obs-${now}`,
      location_id: record.location_id,
      representation_state: label.representation_state,
      observation: text,
      gallery_zone: 'my_gallery',
      gallery_file: true,
      published: false,
      accessible_equivalent: true,
    },
  });
  return {
    ok: true,
    location_id: record.location_id,
    scene_label: label,
    matched_views,
    evidence_drawer: {
      unknowns_retained: record.claims.filter((c) => c.evidence_class === 'unknown').map((c) => c.claim_id),
      conflicts: record.claims.flatMap((c) => c.known_conflicts || []),
      omissions: record.known_omissions,
    },
    private_node: privateNode,
    private_visibility: privateNode.visibility === VISIBILITY.PRIVATE,
    not_waike_campus: true,
    metric_accuracy_status: label.metric_accuracy_status,
    nav_only: false,
    acceptance: PLAYABLE_ACCEPTANCE_NOTE,
  };
}

export function runGhanaOfflinePlayable({ learnerId = 'learner-gh' } = {}) {
  return runGhanaOfflineRoomPlayable({ learnerId });
}

export function runGazaPlayable({ learnerId = 'learner-gz' } = {}) {
  return runGazaRecoveryRoomPlayable({ learnerId });
}

/** Germany: build → document → test → improve → present (room-bound apprenticeship). */
export function runGermanySpecialtyPlayable({ learnerId = 'learner-de' } = {}) {
  const full = runGermanyApprenticeshipPlayable({ learnerId });
  if (!full.ok) return full;
  return {
    ...full,
    artifact: {
      id: `de-${learnerId}`,
      steps_completed: full.steps_completed || [],
      sop: {
        title: 'Mechatronics quality checklist (planning concept)',
        industrial_cyber_note: full.journey?.industrial_cyber_note,
        waike_deep_link: full.journey?.waike_deep_link,
      },
      visibility: VISIBILITY.PRIVATE,
    },
  };
}

/** Guyana: flood/drainage uncertainty → map/report → offline portfolio (room-bound). */
export function runGuyanaSpecialtyPlayable({ learnerId = 'learner-gy' } = {}) {
  return runGuyanaClimateGisPlayable({ learnerId });
}

/** Graham Land: low-bandwidth climate/network exercise with explicit assumptions (room-bound). */
export function runGrahamSpecialtyPlayable({ learnerId = 'learner-gl' } = {}) {
  return runGrahamPolarTwinPlayable({ learnerId });
}

/** Ghana: offline cache → resume → portfolio → regional exchange (room-bound). */
export function runGhanaSpecialtyPlayable({ learnerId = 'learner-gh' } = {}) {
  return runGhanaOfflineRoomPlayable({ learnerId });
}

/** Gaza: shared-device → offline kit → recover → withdraw → Home (no coordinates). */
export function runGazaSpecialtyPlayable({ learnerId = 'learner-gz' } = {}) {
  return runGazaRecoveryRoomPlayable({ learnerId });
}

/** Geelong: design critique → revise prototype → portfolio (room-bound DESIGN_BUILD_STUDIO). */
export function runGeelongSpecialtyPlayable({ learnerId = 'learner-au' } = {}) {
  const full = runGeelongDesignBuildPlayable({ learnerId });
  if (!full.ok) return full;
  return {
    ...full,
    representation_states: full.layer_states,
  };
}

export function offlineSaveConflict({ localRevision, remoteRevision, prefer = 'local_with_notice' } = {}) {
  if (localRevision === remoteRevision) {
    return { ok: true, conflict: false, resolution: 'noop', revision: localRevision };
  }
  if (prefer === 'local_with_notice') {
    return {
      ok: true,
      conflict: true,
      resolution: 'kept_local_explained',
      revision: localRevision,
      notice: 'Offline save conflict: local revision retained; remote not silently overwritten.',
    };
  }
  return { ok: false, reason: 'unresolved_conflict', localRevision, remoteRevision };
}

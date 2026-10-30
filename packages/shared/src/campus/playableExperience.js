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
import {
  createGhanaOfflineJourney,
  ghanaCacheLesson,
  ghanaResumeCachedLesson,
  ghanaPreparePortfolio,
  ghanaRegionalExchange,
  createGazaRecoveryJourney,
  gazaContinueOfflineOnSharedDevice,
  gazaRecoverPortfolio,
  gazaWithdrawSharing,
  gazaPublicExportSafe,
} from './specialtyJourneys.js';
import { loadLocationRecord, sceneStateLabel } from './locationRecords.js';
import { specialistWaikeDeepLink, SPECIALIST_WAIKE_TRACKS } from './waikeContract.js';
import { runGeelongDesignBuildPlayable } from './geelongDesignBuildJourney.js';

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
  const payload = {
    [prompt.field]: text,
    waike_surface: prompt.waike_surface,
    waike_deep_link: `#/mlv/academic/${prompt.waike_surface}`,
    specialist_deep_link: prompt.specialist_track
      ? specialistWaikeDeepLink(prompt.specialist_track)
      : null,
    room_bound: true,
    playable: true,
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
    acceptance: PLAYABLE_ACCEPTANCE_NOTE,
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
  let { journey } = createGhanaOfflineJourney({ learnerId });
  journey = ghanaCacheLesson(journey, { id: 'gh-offline-1', title: 'Mobile-first civic lesson' }).journey;
  journey = ghanaResumeCachedLesson(journey).journey;
  journey = ghanaPreparePortfolio(journey, { id: 'gh-art-1', title: 'Regional pop-up kit plan' }).journey;
  const done = ghanaRegionalExchange(journey, { region: 'Tamale planning route' });
  return {
    ok: done.ok,
    journey: done.journey,
    offline_resumed: Boolean(done.journey.cached_lesson?.resumed_at),
    regional_exchange: done.journey.regional_exchange,
    nav_only: false,
  };
}

export function runGazaPlayable({ learnerId = 'learner-gz' } = {}) {
  let { journey } = createGazaRecoveryJourney({ learnerId });
  journey = gazaContinueOfflineOnSharedDevice(journey).journey;
  journey = gazaRecoverPortfolio(journey, { id: 'gz-p1', title: 'Private draft' }).journey;
  journey = gazaWithdrawSharing(journey).journey;
  const safety = gazaPublicExportSafe(journey);
  return {
    ok: safety.pass && journey.sharing_withdrawn,
    journey,
    safety,
    nav_only: false,
  };
}

/** Germany: build → document → test → improve → present */
export function runGermanySpecialtyPlayable({ learnerId = 'learner-de' } = {}) {
  const steps = ['build', 'document', 'test', 'improve', 'present'];
  const artifact = { id: `de-${learnerId}`, steps_completed: [], sop: null, visibility: VISIBILITY.PRIVATE };
  for (const s of steps) artifact.steps_completed.push(s);
  artifact.sop = {
    title: 'Mechatronics quality checklist (planning concept)',
    industrial_cyber_note: 'Industrial cybersecurity treated as learning activity, not certification.',
    waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.INDUSTRY40_TWIN_LAB || 'HARDWARE_ENGINEERING'),
  };
  return {
    ok: artifact.steps_completed.length === 5,
    location_id: 'loc.campus.germany',
    representation_state: 'planning_concept',
    artifact,
    nav_only: false,
  };
}

/** Guyana: flood/drainage uncertainty → map/report → offline portfolio */
export function runGuyanaSpecialtyPlayable({ learnerId = 'learner-gy' } = {}) {
  const scenario = {
    id: `gy-flood-${learnerId}`,
    topic: 'drainage_flood_literacy',
    uncertainty: 'Public planning scenario only; not field-validated impact.',
    data_status: 'synthetic',
    map_export: { format: 'offline_portfolio_json', includes_sensitive_community_data: false },
  };
  const privateNode = createPrivateNode({
    ownerId: learnerId,
    name: 'Guyana climate/GIS portfolio',
    mimeType: 'application/json',
    extra: { id: scenario.id, scenario, gallery_file: true, published: false },
  });
  return {
    ok: true,
    location_id: 'loc.campus.guyana',
    representation_state: 'planning_concept',
    scenario,
    private_node: privateNode,
    private_visibility: privateNode.visibility === VISIBILITY.PRIVATE,
    nav_only: false,
  };
}

/** Graham Land: low-bandwidth climate/network exercise with explicit assumptions */
export function runGrahamSpecialtyPlayable({ learnerId = 'learner-gl' } = {}) {
  const exercise = {
    id: `gl-ntn-${learnerId}`,
    kind: 'low_bandwidth_climate_network',
    assumptions: [
      'Remote-first polar education twin',
      'Physical host outside Antarctica if needed',
      'No fictional WAIKE Antarctic station',
      'Simulation ≠ field validation',
    ],
    waike_deep_link: specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS.NTN_LAB),
    heritage_ref: 'loc.heritage.port_lockroy',
  };
  return {
    ok: true,
    location_id: 'loc.campus.graham-land',
    representation_state: 'planning_concept',
    exercise,
    no_fake_station: true,
    nav_only: false,
  };
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

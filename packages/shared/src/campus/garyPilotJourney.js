/**
 * Gary pilot campus learner journey — functional specialty actions.
 * Planning-concept campus; not a physical facility claim.
 */

export const GARY_PILOT_JOURNEY_ID = 'gary.pilot.civic_help_to_showcase';

export const GARY_PILOT_STEPS = Object.freeze([
  {
    id: 'welcome_device_help',
    room_key: 'DEVICE_HELP_DESK_TABLE',
    title: 'Welcome / device help',
    action: 'complete_device_help',
    produces: 'device_help_ticket',
  },
  {
    id: 'classroom_lab',
    room_key: 'MOBILE_HARDWARE_CART',
    title: 'Classroom / lab',
    action: 'complete_lab_task',
    produces: 'lab_artifact_draft',
  },
  {
    id: 'portfolio_artifact',
    room_key: 'QUIET_SUPPORT_AREA',
    title: 'Portfolio artifact',
    action: 'document_portfolio_item',
    produces: 'portfolio_item',
  },
  {
    id: 'feedback_showcase',
    room_key: 'PRESENTATION_WALL',
    title: 'Feedback / showcase prep',
    action: 'prepare_community_showcase',
    produces: 'showcase_ready_item',
  },
  {
    id: 'save_progress',
    room_key: 'STAFF_PLANNING_TABLE',
    title: 'Save',
    action: 'save_journey',
    produces: 'saved_journey_state',
  },
  {
    id: 'resume_and_home',
    room_key: 'FLEXIBLE_CLASSROOM',
    title: 'Resume / return Home',
    action: 'resume_and_return_home',
    produces: 'home_return_receipt',
  },
]);

export function createGaryPilotJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GARY_PILOT_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'gary',
      phase: 'PILOT',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.gary',
      created_at: now,
      updated_at: now,
      completed_step_ids: [],
      artifacts: {},
      saved: false,
      resumed: false,
      returned_home: false,
      offline_capable: true,
    },
  };
}

export function advanceGaryPilotJourney(journey, stepId, { payload = {}, now = new Date().toISOString() } = {}) {
  if (!journey || journey.journey_id !== GARY_PILOT_JOURNEY_ID) {
    return { ok: false, reason: 'invalid_journey' };
  }
  const step = GARY_PILOT_STEPS.find((s) => s.id === stepId);
  if (!step) return { ok: false, reason: 'unknown_step' };
  const idx = GARY_PILOT_STEPS.findIndex((s) => s.id === stepId);
  const expected = GARY_PILOT_STEPS[journey.completed_step_ids.length];
  if (!expected || expected.id !== stepId) {
    return { ok: false, reason: 'out_of_order', expected: expected?.id || null };
  }
  const next = {
    ...journey,
    updated_at: now,
    completed_step_ids: [...journey.completed_step_ids, stepId],
    artifacts: {
      ...journey.artifacts,
      [step.produces]: {
        step_id: stepId,
        room_key: step.room_key,
        created_at: now,
        payload,
        visibility: stepId === 'portfolio_artifact' || stepId === 'feedback_showcase' ? 'private_until_publish' : 'learner_private',
      },
    },
  };
  if (stepId === 'save_progress') next.saved = true;
  if (stepId === 'resume_and_home') {
    if (!journey.saved) return { ok: false, reason: 'must_save_before_resume_home' };
    next.resumed = true;
    next.returned_home = true;
  }
  const complete = next.completed_step_ids.length === GARY_PILOT_STEPS.length;
  return { ok: true, journey: next, step, complete };
}

export function resumeGaryPilotJourney(savedJourney, { now = new Date().toISOString() } = {}) {
  if (!savedJourney?.saved) return { ok: false, reason: 'not_saved' };
  return {
    ok: true,
    journey: {
      ...savedJourney,
      resumed: true,
      updated_at: now,
    },
  };
}

export function garyPilotJourneyProgress(journey) {
  const total = GARY_PILOT_STEPS.length;
  const done = journey?.completed_step_ids?.length || 0;
  return {
    done,
    total,
    next_step: GARY_PILOT_STEPS[done] || null,
    complete: done === total,
    representation_state: 'planning_concept',
  };
}

/** Specialty learning actions for non-Gary campuses (planning concepts). */

export const GHANA_OFFLINE_JOURNEY_ID = 'ghana.pilot.offline_resume_exchange';

export function createGhanaOfflineJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GHANA_OFFLINE_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'ghana',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.ghana',
      created_at: now,
      updated_at: now,
      cached_lesson: null,
      portfolio_item: null,
      regional_exchange: null,
      offline: true,
    },
  };
}

export function ghanaCacheLesson(journey, lesson, { now = new Date().toISOString() } = {}) {
  if (!journey || journey.journey_id !== GHANA_OFFLINE_JOURNEY_ID) return { ok: false, reason: 'invalid_journey' };
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      cached_lesson: { ...lesson, cached_at: now, resume_token: `offline:${journey.learner_id}:${lesson.id}` },
    },
  };
}

export function ghanaResumeCachedLesson(journey, { now = new Date().toISOString() } = {}) {
  if (!journey?.cached_lesson) return { ok: false, reason: 'no_cached_lesson' };
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      cached_lesson: { ...journey.cached_lesson, resumed_at: now },
    },
  };
}

export function ghanaPreparePortfolio(journey, artifact, { now = new Date().toISOString() } = {}) {
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      portfolio_item: { ...artifact, visibility: 'private_until_publish', created_at: now },
    },
  };
}

export function ghanaRegionalExchange(journey, credit, { now = new Date().toISOString() } = {}) {
  if (!journey?.portfolio_item) return { ok: false, reason: 'portfolio_required' };
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      regional_exchange: {
        credited_project_id: journey.portfolio_item.id || 'portfolio',
        credit,
        created_at: now,
        pop_up_route: 'planning_layer_only',
      },
    },
  };
}

export const GAZA_RECOVERY_JOURNEY_ID = 'gaza.pilot.offline_portfolio_withdraw';

export function createGazaRecoveryJourney({ learnerId, now = new Date().toISOString() } = {}) {
  if (!learnerId) return { ok: false, reason: 'learner_required' };
  return {
    ok: true,
    journey: {
      journey_id: GAZA_RECOVERY_JOURNEY_ID,
      learner_id: learnerId,
      campus_slug: 'gaza',
      representation_state: 'planning_concept',
      location_id: 'loc.campus.gaza',
      created_at: now,
      updated_at: now,
      shared_device_session: null,
      offline_lesson: null,
      portfolio: null,
      sharing_withdrawn: false,
      public_export_fields: [],
    },
  };
}

export function gazaContinueOfflineOnSharedDevice(journey, { device_id = 'shared-kiosk', now = new Date().toISOString() } = {}) {
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      shared_device_session: { device_id, started_at: now, sign_out_required: true },
      offline_lesson: { status: 'in_progress', started_at: now },
      public_export_fields: ['representation_state', 'journey_id'],
    },
  };
}

export function gazaRecoverPortfolio(journey, item, { now = new Date().toISOString() } = {}) {
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      portfolio: { ...item, visibility: 'private', recovered_at: now },
    },
  };
}

export function gazaWithdrawSharing(journey, { now = new Date().toISOString() } = {}) {
  return {
    ok: true,
    journey: {
      ...journey,
      updated_at: now,
      sharing_withdrawn: true,
      portfolio: journey.portfolio ? { ...journey.portfolio, visibility: 'private', shared: false } : null,
      public_export_fields: ['representation_state', 'journey_id', 'sharing_withdrawn'],
    },
  };
}

export function gazaPublicExportSafe(journey) {
  const forbiddenKeys = ['lat', 'lon', 'lng', 'latitude', 'longitude', 'gps', 'shelter', 'shelter_coordinates', 'coordinates'];
  const found = [];
  const walk = (value, path = '') => {
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        const next = path ? `${path}.${k}` : k;
        if (forbiddenKeys.includes(String(k).toLowerCase())) found.push(next);
        walk(v, next);
      }
    }
  };
  walk(journey);
  // Decimal degree pairs only (not ISO timestamps like 45.123Z)
  const blob = JSON.stringify(journey);
  const degreePair = /(-?\d{1,2}\.\d{4,})\s*,\s*(-?\d{1,3}\.\d{4,})/.test(blob);
  return {
    pass: found.length === 0 && !degreePair,
    hasCoords: degreePair,
    forbidden_paths: found,
    public_export_fields: journey.public_export_fields || [],
  };
}

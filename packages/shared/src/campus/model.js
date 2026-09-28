import {
  CAMPUS_CATALOG,
  CAMPUS_LANDING,
  EXAMPLE_REQUIREMENT_IDS,
  SHARED_PROGRAM,
  SOURCE_DOC,
  TOP_LEVEL_SITES,
  WAIKE_CONTRACT_SURFACES,
} from './catalog.js';

export function requirementId(campusId, phaseToken, key) {
  return `${campusId}.${phaseToken}.${key}`;
}

export function digitalRoute(campus, phaseToken, key) {
  const slug = campus.slug;
  return `#/mlv/campus/${slug}/${phaseToken.toLowerCase()}/${key.toLowerCase().replace(/_/g, '-')}`;
}

export function digitalObject(campus, phaseToken, key) {
  return `${campus.slug}.${phaseToken.toLowerCase()}.${key.toLowerCase()}`;
}

function expandRoom(campus, phase, room, sourceSection) {
  const id = requirementId(campus.id, phase.token, room.key);
  return {
    id,
    campus_id: campus.id,
    campus_slug: campus.slug,
    campus_name: campus.name,
    source_brief: campus.name,
    source_section: sourceSection,
    source_doc: SOURCE_DOC,
    phase: phase.id,
    phase_token: phase.token,
    key: room.key,
    name: room.name,
    kind: room.kind,
    function: room.function,
    specialist: room.specialist === true,
    digital_route: digitalRoute(campus, phase.token, room.key),
    digital_object: digitalObject(campus, phase.token, room.key),
    waike_links: room.waike || [],
    coverage: room.coverage,
    evidence_status: room.evidence,
    geometry_fidelity: room.geometry || 'AUTHORED_PLANNING_LAYOUT',
    suppress_coordinates: campus.suppress_coordinates === true,
    no_fake_station_claim: campus.no_fake_station_claim === true,
  };
}

export function expandCampusRequirements(campus) {
  const out = [];
  for (const phase of campus.phases) {
    const rooms = campus.rooms[phase.token] || [];
    for (const room of rooms) {
      out.push(expandRoom(campus, phase, room, phase.label));
    }
    for (const shared of SHARED_PROGRAM) {
      out.push(expandRoom(campus, phase, shared, 'Shared campus requirements'));
    }
  }
  const lastPhase = campus.phases[campus.phases.length - 1];
  for (const extra of campus.extra_shared || []) {
    out.push(expandRoom(campus, lastPhase, extra, 'Campus operating constraints / identity'));
  }
  for (const layer of campus.twin_layers || []) {
    out.push(expandRoom(campus, lastPhase, layer, 'Digital Graham Land twin model'));
  }
  return out;
}

export function buildSourceManifest() {
  const campuses = CAMPUS_CATALOG.map((campus) => {
    const requirements = expandCampusRequirements(campus);
    return {
      id: campus.id,
      slug: campus.slug,
      name: campus.name,
      atlas_name: campus.atlas_name,
      planning_identity: campus.planning_identity,
      planning_model: campus.planning_model,
      local_focus: campus.local_focus,
      truth_state: campus.truth_state,
      character: campus.character,
      wayfinding: campus.wayfinding,
      avoid: campus.avoid,
      layout: campus.layout,
      suppress_coordinates: campus.suppress_coordinates === true,
      suppress_sensitive_locations: campus.suppress_sensitive_locations === true,
      no_fake_station_claim: campus.no_fake_station_claim === true,
      remote_first: campus.remote_first === true,
      phases: campus.phases,
      fidelity: {
        program_fidelity: '1:1',
        geometry_fidelity: 'AUTHORED_PLANNING_LAYOUT',
        data_fidelity: 'PLANNING_TWIN',
        operational_fidelity: campus.id === 'GRAHAM' ? 'SIMULATION' : 'PROPOSAL',
        source_status: 'URBAN_PLANNING_BRIEF',
      },
      requirement_count: requirements.length,
      requirements,
    };
  });

  const allRequirements = campuses.flatMap((c) => c.requirements);
  return {
    schema_version: '2.0.0',
    source_doc: SOURCE_DOC,
    top_level_sites: [...TOP_LEVEL_SITES],
    campus_landing: [...CAMPUS_LANDING],
    waike_contract_surfaces: [...WAIKE_CONTRACT_SURFACES],
    example_requirement_ids: [...EXAMPLE_REQUIREMENT_IDS],
    node_count: campuses.length,
    requirement_count: allRequirements.length,
    campuses,
    generated_note: 'Authored planning twin. Not surveyed architecture. Not a claim that physical campuses exist.',
  };
}

export function buildTraceability(manifest) {
  const rows = manifest.campuses.flatMap((campus) =>
    campus.requirements.map((req) => ({
      requirement_id: req.id,
      source_brief: req.source_brief,
      source_section: req.source_section,
      source_doc: req.source_doc,
      phase: req.phase,
      digital_route: req.digital_route,
      digital_object: req.digital_object,
      function: req.function,
      coverage: req.coverage,
      evidence_status: req.evidence_status,
    })),
  );
  return {
    schema_version: '2.0.0',
    row_count: rows.length,
    rows,
  };
}

export function coverageForRequirement(req) {
  return req.coverage;
}

export function buildCoverage(manifest) {
  const campuses = manifest.campuses.map((campus) => {
    const requirements = campus.requirements.map((req) => ({
      requirement_id: req.id,
      coverage: coverageForRequirement(req),
      evidence_status: req.evidence_status,
      represented: true,
    }));
    const omitted = requirements.filter((r) => !r.represented);
    const classified = requirements.filter((r) =>
      ['NOT_APPLICABLE', 'BLOCKED_BY_REAL_WORLD_VALIDATION'].includes(r.coverage),
    );
    const implemented = requirements.filter((r) =>
      ['IMPLEMENTED_SPATIALLY', 'IMPLEMENTED_FUNCTIONALLY', 'IMPLEMENTED_BOTH'].includes(r.coverage),
    );
    return {
      campus_id: campus.id,
      campus_slug: campus.slug,
      truth_state: campus.truth_state,
      fidelity: campus.fidelity,
      requirement_count: requirements.length,
      implemented_count: implemented.length,
      classified_count: classified.length,
      omitted_count: omitted.length,
      brief_digital_coverage: omitted.length === 0 ? '100%' : 'INCOMPLETE',
      requirements,
    };
  });

  const omitted_total = campuses.reduce((n, c) => n + c.omitted_count, 0);
  return {
    schema_version: '2.0.0',
    BRIEF_DIGITAL_COVERAGE: omitted_total === 0 ? '100%' : 'INCOMPLETE',
    campuses,
  };
}

export function roomsAvailableAtPhase(campus, phaseId) {
  const idx = campus.phases.findIndex((p) => p.id === phaseId);
  if (idx < 0) return [];
  const seen = new Map();
  campus.phases.slice(0, idx + 1).forEach((phase) => {
    (campus.rooms[phase.token] || []).forEach((room) => {
      seen.set(room.key, { ...room, phase: phase.id, phase_token: phase.token });
    });
  });
  return [...seen.values()];
}

export function campusBySlug(slug) {
  return CAMPUS_CATALOG.find((c) => c.slug === slug) || null;
}

export function campusById(id) {
  return CAMPUS_CATALOG.find((c) => c.id === id) || null;
}

export function roomSetsByCampus() {
  return Object.fromEntries(
    CAMPUS_CATALOG.map((campus) => {
      const keys = new Set();
      for (const phase of campus.phases) {
        for (const room of campus.rooms[phase.token] || []) keys.add(room.key);
      }
      return [campus.id, [...keys].sort()];
    }),
  );
}

export function assertNonGenericRoomsets() {
  const sets = roomSetsByCampus();
  const serialized = Object.entries(sets).map(([id, keys]) => [id, keys.join('|')]);
  for (let i = 0; i < serialized.length; i += 1) {
    for (let j = i + 1; j < serialized.length; j += 1) {
      if (serialized[i][1] === serialized[j][1]) {
        return { pass: false, reason: `${serialized[i][0]} and ${serialized[j][0]} share an identical roomset` };
      }
    }
  }
  return { pass: true, roomsets: sets };
}

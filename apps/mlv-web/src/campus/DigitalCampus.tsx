import { Suspense, lazy, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  SPECIALIST_WAIKE_TRACKS,
  campusBySlug,
  expandCampusRequirements,
  roomsAvailableAtPhase,
  specialistWaikeDeepLink,
} from '@3k-mlv/campus';
import EvidencePanel from './EvidencePanel';
import WaikeCenter from './WaikeCenter';
import GaryPilotJourney from './GaryPilotJourney';
import NubukeHeritageExperience from './NubukeHeritageExperience';
import GeelongTemporalCompare from './GeelongTemporalCompare';
import GeelongDesignBuildJourney from './GeelongDesignBuildJourney';
import RoomBoundSpecialtyJourney from './RoomBoundSpecialtyJourney';
import CampusSpecialtyPanels from './CampusSpecialtyPanels';
import { loadLocationRecord, sceneStateLabel } from '@3k-mlv/campus';

const CampusWorld = lazy(() => import('../three/CampusWorld'));

function phaseIdFromHint(campus: { phases: Array<{ id: string; token: string }> } | null | undefined, hint: string | null | undefined) {
  if (!campus || !hint) return null;
  const h = hint.toUpperCase();
  const aliases: Record<string, string[]> = {
    PILOT: ['PILOT', 'REMOTE', 'RECOVERY'],
    SEMI: ['SEMI', 'TWIN'],
    FULL: ['FULL', 'RECOVERY'],
    REMOTE: ['REMOTE', 'PILOT'],
    TWIN: ['TWIN', 'SEMI'],
  };
  const candidates = aliases[h] || [h];
  for (const token of candidates) {
    const match = campus.phases.find(
      (p) => p.token === token || p.id.toUpperCase().includes(token) || p.token.toUpperCase().includes(token),
    );
    if (match) return match.id;
  }
  return null;
}

export default function DigitalCampus({ slug }: { slug: string }) {
  const campus = campusBySlug(slug);
  const [phaseId, setPhaseId] = useState(campus?.phases[0]?.id || '');
  const [mode, setMode] = useState<'list' | 'map'>('list');
  const [roomKey, setRoomKey] = useState<string | null>(null);

  const rooms = useMemo(
    () => (campus ? roomsAvailableAtPhase(campus, phaseId) : []),
    [campus, phaseId],
  );
  const phase = campus?.phases.find((item) => item.id === phaseId);
  const selected = rooms.find((room) => room.key === roomKey) || rooms[0];
  const requirements = useMemo(
    () => (campus ? expandCampusRequirements(campus) : []),
    [campus],
  );
  const selectedReq = requirements.find(
    (req) => req.key === selected?.key && req.phase_token === phase?.token,
  );
  const campusLocation = useMemo(() => loadLocationRecord(`loc.campus.${slug}`), [slug]);
  const sceneLabel = sceneStateLabel(campusLocation as never);

  if (!campus) {
    return (
      <section className="mlv-campus">
        <h1>Unknown campus</h1>
        <p>Return to the 7GC Atlas.</p>
      </section>
    );
  }

  return (
    <section
      className="mlv-campus"
      aria-label={`${campus.atlas_name} digital campus`}
      data-campus-slug={campus.slug}
      data-representation-state={sceneLabel?.representation_state || campus.truth_state}
    >
      <h1>{campus.name}</h1>
      <p className="mlv-kicker">{campus.planning_identity}</p>
      <p>
        <span className={`mlv-truth mlv-truth--${campus.truth_state}`}>{campus.truth_state}</span>
        {' '}{campus.planning_model} · layout {campus.layout}
      </p>
      {sceneLabel && (
        <p className="mlv-kicker" data-testid="scene-state-label" data-representation-state={sceneLabel.representation_state}>
          {sceneLabel.label} · {sceneLabel.capture} · {sceneLabel.scene_version} · metric {sceneLabel.metric_accuracy_status}
        </p>
      )}
      {campus.suppress_sensitive_locations && (
        <p className="mlv-kicker">Sensitive real-world learner and site locations are not exposed.</p>
      )}
      {campus.no_fake_station_claim && (
        <p className="mlv-kicker">Remote-first polar twin. External station references remain external. No WAIKE-owned Antarctic campus.</p>
      )}
      <WaikeCenter />
      <div className="mlv-toolbar" role="toolbar" aria-label="Phase and view">
        {campus.phases.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mlv-chip"
            aria-pressed={item.id === phaseId}
            onClick={() => setPhaseId(item.id)}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="mlv-chip"
          onClick={() => document.querySelector<HTMLElement>('.mlv-world-canvas')?.focus()}
        >
          Focus WORLD above
        </button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>
          List
        </button>
        <button type="button" className="mlv-chip" aria-pressed={mode === 'map'} onClick={() => setMode('map')}>
          Map
        </button>
        <button
          type="button"
          className="mlv-chip"
          onClick={() => { window.location.hash = `#/mlv/campus/${campus.slug}/network-twin`; }}
        >
          Network Twin Lab
        </button>
      </div>

      {mode === 'map' ? (
        <div className="mlv-campus-map" style={{ height: 'min(62vh, 520px)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }}>
          <Canvas camera={{ position: [0, 12, 14], fov: 50 }} style={{ width: '100%', height: '100%' }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 14, 6]} intensity={1.05} />
            <Suspense fallback={null}>
              <CampusWorld slug={campus.slug} phaseId={phaseId} focusedProgramKey={roomKey} />
            </Suspense>
            <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={28} />
          </Canvas>
          <p className="mlv-kicker">Architectural planning twin. Phase selector changes massing. List mode remains available for direct navigation.</p>
        </div>
      ) : null}

      <ul className="mlv-room-grid">
        {rooms.map((room) => (
          <li key={`${phase?.token}-${room.key}`}>
            <article>
              <h2>{room.name}</h2>
              <p className="mlv-kicker">{room.function}</p>
              {room.specialist && <p>Specialist room</p>}
              <button
                type="button"
                aria-pressed={selected?.key === room.key}
                onClick={() => setRoomKey(room.key)}
              >
                Open {mode === 'map' ? 'on map' : 'in list'}
              </button>
              {selected?.key === room.key && (
                <p className="mlv-kicker" data-testid="active-room">Active room for learning task</p>
              )}
              {room.specialist && SPECIALIST_WAIKE_TRACKS[room.key as keyof typeof SPECIALIST_WAIKE_TRACKS] && (
                <p className="mlv-kicker">
                  WAIKE deep link: {specialistWaikeDeepLink(SPECIALIST_WAIKE_TRACKS[room.key as keyof typeof SPECIALIST_WAIKE_TRACKS])}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
      {campus.twin_layers && (
        <section>
          <h2>Simulation layers</h2>
          <ul className="mlv-room-grid">
            {campus.twin_layers.map((layer) => (
              <li key={layer.key}>
                <article>
                  <h3>{layer.name}</h3>
                  <p className="mlv-kicker">{layer.evidence} · {layer.coverage}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
      {slug === 'gary' && (
        <GaryPilotJourney
          learnerId="local-learner"
          onRoomFocus={(key) => { if (key) setRoomKey(key); }}
        />
      )}
      {slug === 'ghana' && <NubukeHeritageExperience learnerId="local-learner" embed="campus" />}
      {slug === 'geelong' && <GeelongTemporalCompare />}
      {slug === 'geelong' && (
        <GeelongDesignBuildJourney
          learnerId="local-learner"
          onRoomFocus={(key) => { if (key) setRoomKey(key); }}
          onPhaseHint={(hint) => {
            const id = phaseIdFromHint(campus, hint);
            if (id) setPhaseId(id);
          }}
        />
      )}
      {(slug === 'germany' || slug === 'guyana' || slug === 'graham-land' || slug === 'ghana' || slug === 'gaza') && (
        <RoomBoundSpecialtyJourney
          slug={slug}
          learnerId="local-learner"
          onRoomFocus={(key) => { if (key) setRoomKey(key); }}
          onPhaseHint={(hint) => {
            const id = phaseIdFromHint(campus, hint);
            if (id) setPhaseId(id);
          }}
        />
      )}
      <CampusSpecialtyPanels slug={slug} learnerId="local-learner" />
      <EvidencePanel
        source={selectedReq?.id || `${campus.id} ${phase?.id || ''}`}
        implementation={selected?.name || campus.layout}
        phase={phase?.id || ''}
        status={selectedReq?.evidence_status || campus.truth_state}
        limitations="Authored navigable planning twin. Not surveyed architecture. Not a physical-campus claim."
        representationState={sceneLabel?.representation_state}
        representationLabel={sceneLabel?.label}
        sceneVersion={sceneLabel ? `${sceneLabel.scene_version} / ${(campusLocation as { model_version?: string } | null)?.model_version || ''}` : undefined}
        captureNote={sceneLabel?.capture}
        metricAccuracy={sceneLabel?.metric_accuracy_status}
        sourceIds={(campusLocation as { source_ids?: string[] } | null)?.source_ids}
      />
    </section>
  );
}

import { useMemo, useState } from 'react';
import {
  SPECIALIST_WAIKE_TRACKS,
  campusBySlug,
  expandCampusRequirements,
  roomsAvailableAtPhase,
  specialistWaikeDeepLink,
} from '@3k-mlv/campus';
import EvidencePanel from './EvidencePanel';
import WaikeCenter from './WaikeCenter';

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

  if (!campus) {
    return (
      <section className="mlv-campus">
        <h1>Unknown campus</h1>
        <p>Return to the 7GC Atlas.</p>
      </section>
    );
  }

  return (
    <section className="mlv-campus" aria-label={`${campus.atlas_name} digital campus`}>
      <h1>{campus.name}</h1>
      <p className="mlv-kicker">{campus.planning_identity}</p>
      <p>
        <span className={`mlv-truth mlv-truth--${campus.truth_state}`}>{campus.truth_state}</span>
        {' '}{campus.planning_model} · layout {campus.layout}
      </p>
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
      <ul className="mlv-room-grid">
        {rooms.map((room) => (
          <li key={`${phase?.token}-${room.key}`}>
            <article>
              <h2>{room.name}</h2>
              <p className="mlv-kicker">{room.function}</p>
              {room.specialist && <p>Specialist room</p>}
              <button type="button" onClick={() => setRoomKey(room.key)}>
                Open {mode === 'map' ? 'on map' : 'in list'}
              </button>
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
      <EvidencePanel
        source={selectedReq?.id || `${campus.id} ${phase?.id || ''}`}
        implementation={selected?.name || campus.layout}
        phase={phase?.id || ''}
        status={selectedReq?.evidence_status || campus.truth_state}
        limitations="Authored navigable planning twin. Not surveyed architecture. Not a physical-campus claim."
      />
    </section>
  );
}

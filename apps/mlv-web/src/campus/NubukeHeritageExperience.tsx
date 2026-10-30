import { useMemo, useState } from 'react';
import { loadLocationRecord, sceneStateLabel } from '@3k-mlv/campus';

export default function NubukeHeritageExperience() {
  const record = useMemo(() => loadLocationRecord('loc.heritage.nubuke'), []);
  const label = sceneStateLabel(record as never);
  const [observation, setObservation] = useState('');
  const [saved, setSaved] = useState(false);

  if (!record || !label) {
    return <p className="mlv-kicker">Nubuke location record unavailable.</p>;
  }

  const areaClaim = (record.claims as Array<Record<string, unknown>>).find((c) => c.claim_id === 'nubuke.area');
  const topo = (record.claims as Array<Record<string, unknown>>).find((c) => c.claim_id === 'nubuke.topology');

  return (
    <section className="mlv-nubuke" aria-label="Nubuke heritage experience" data-representation-state={label.representation_state}>
      <h2>Nubuke Foundation heritage stop</h2>
      <p className="mlv-kicker" data-testid="scene-state-label">{label.label} · {label.capture}</p>
      <p>Not the WAIKE Ghana campus. Metric accuracy: {label.metric_accuracy_status}.</p>
      <h3>Orientation</h3>
      <p>{String(topo?.claim_text || '')}</p>
      <h3>Evidence / uncertainty drawer</h3>
      <details open>
        <summary>Source conflicts and unknowns</summary>
        <p>{String(areaClaim?.claim_text || '')}</p>
        <ul>
          {((areaClaim?.known_conflicts as Array<{ topic: string; resolution: string }>) || []).map((c) => (
            <li key={c.topic}>{c.topic}: {c.resolution}</li>
          ))}
        </ul>
        <p className="mlv-kicker">Sources: {(record.source_ids as string[]).join(', ')}</p>
        <p className="mlv-kicker">Omissions: {(record.known_omissions as string[]).join('; ')}</p>
      </details>
      <h3>Accessible equivalent</h3>
      <p className="mlv-kicker">
        Non-3D route: list/campus navigation. No invented physical ramp is claimed as part of the real building.
      </p>
      <label>
        Meaningful cultural observation
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={3}
          aria-label="Nubuke cultural observation"
        />
      </label>
      <button
        type="button"
        onClick={() => {
          try {
            localStorage.setItem(
              'mlv.nubuke.learning_artifact.v1',
              JSON.stringify({
                location_id: record.location_id,
                representation_state: label.representation_state,
                observation,
                saved_at: new Date().toISOString(),
              }),
            );
            setSaved(true);
          } catch {
            setSaved(false);
          }
        }}
        disabled={!observation.trim()}
      >
        Save learning artifact
      </button>
      {saved && <p role="status">Saved private learning artifact (local).</p>}
    </section>
  );
}

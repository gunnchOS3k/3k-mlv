import { useMemo, useState } from 'react';
import {
  loadLocationRecord,
  sceneStateLabel,
  runNubukePlayableAcceptance,
  PLAYABLE_ACCEPTANCE_NOTE,
} from '@3k-mlv/campus';

export default function NubukeHeritageExperience({
  learnerId = 'local-learner',
  embed = 'campus',
}: {
  learnerId?: string;
  embed?: 'campus' | 'gallery';
}) {
  const record = useMemo(() => loadLocationRecord('loc.heritage.nubuke'), []);
  const label = sceneStateLabel(record as never);
  const [observation, setObservation] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  if (!record || !label) {
    return <p className="mlv-kicker">Nubuke location record unavailable.</p>;
  }

  const loc = record;
  const scene = label;
  const areaClaim = (loc.claims as Array<Record<string, unknown>>).find((c) => c.claim_id === 'nubuke.area');
  const topo = (loc.claims as Array<Record<string, unknown>>).find((c) => c.claim_id === 'nubuke.topology');

  function savePlayable() {
    const out = runNubukePlayableAcceptance({ learnerId, observation }) as Record<string, unknown>;
    setResult(out);
    if (out.ok) {
      try {
        localStorage.setItem(
          'mlv.nubuke.learning_artifact.v1',
          JSON.stringify({
            location_id: loc.location_id,
            representation_state: scene.representation_state,
            observation,
            private_node_id: (out.private_node as { id?: string } | undefined)?.id,
            saved_at: new Date().toISOString(),
            embed,
          }),
        );
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <section
      className="mlv-nubuke"
      aria-label="Nubuke heritage experience"
      data-representation-state={scene.representation_state}
      data-playable="true"
      data-embed={embed}
    >
      <h2>Nubuke Foundation heritage stop{embed === 'gallery' ? ' (Gallery)' : ''}</h2>
      <p className="mlv-kicker">{PLAYABLE_ACCEPTANCE_NOTE}</p>
      <p className="mlv-kicker" data-testid="scene-state-label">{scene.label} · {scene.capture}</p>
      <p>Not the WAIKE Ghana campus. Metric accuracy: {scene.metric_accuracy_status}.</p>

      <h3>Orientation map (non-3D equivalent)</h3>
      <ol className="mlv-kicker">
        <li>Approach / entry orientation</li>
        <li>Central garden and almond-tree gathering</li>
        <li>Raised gallery / bungalow relationship</li>
        <li>Shaded outdoor programming</li>
      </ol>
      <p>{String(topo?.claim_text || '')}</p>

      <h3>Matched source / model viewpoints</h3>
      <ul className="mlv-room-grid">
        <li><article><h4>Approach</h4><p className="mlv-kicker">qualitative topology · capture date unknown</p></article></li>
        <li><article><h4>Garden / gallery</h4><p className="mlv-kicker">S-NUBUKE-ARCHITECT · S-NUBUKE-FOUNDATION</p></article></li>
        <li><article><h4>Bungalow / outdoor</h4><p className="mlv-kicker">metric unverified · rights unassessed</p></article></li>
      </ul>

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
        Keyboard/list route carries the same orientation, observation task, and evidence drawer. No invented physical ramp is claimed as part of the real building.
      </p>

      <label>
        Meaningful cultural observation
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={3}
          aria-label="Nubuke cultural observation"
          data-testid="nubuke-observation"
        />
      </label>
      <button type="button" onClick={savePlayable} disabled={observation.trim().length < 20}>
        Complete heritage task + save private artifact
      </button>
      {result?.ok === true && (
        <p role="status" data-testid="nubuke-private-artifact">
          Saved private learning artifact {(result.private_node as { id?: string })?.id} (unpublished).
        </p>
      )}
      {result && result.ok === false && (
        <p role="status">{String(result.reason)}</p>
      )}
    </section>
  );
}

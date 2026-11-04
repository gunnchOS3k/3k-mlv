import { useMemo, useState } from 'react';
import {
  GEELONG_DB_STEPS,
  createGeelongDesignBuildJourney,
  advanceGeelongDesignBuildJourney,
  geelongDesignBuildProgress,
  PLAYABLE_ACCEPTANCE_NOTE,
} from '@3k-mlv/campus';

const STORAGE_KEY = 'mlv.geelong.design_build.journey.v1';

export default function GeelongDesignBuildJourney({
  learnerId,
  onRoomFocus,
  onPhaseHint,
}: {
  learnerId: string;
  onRoomFocus?: (roomKey: string | null) => void;
  onPhaseHint?: (phaseToken: 'pilot' | 'semi' | 'full' | null) => void;
}) {
  const [journey, setJourney] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return createGeelongDesignBuildJourney({ learnerId }).journey;
  });
  const [learnerInput, setLearnerInput] = useState('');
  const [message, setMessage] = useState('');
  const progress = useMemo(() => geelongDesignBuildProgress(journey), [journey]);
  const next = progress.next_step as { id: string; title: string; room_key: string; phase_hint: string; min_chars: number } | null;

  function persist(nextJourney: typeof journey) {
    setJourney(nextJourney);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextJourney));
    } catch {
      /* ignore */
    }
  }

  function runNext() {
    if (!next) return;
    const result = advanceGeelongDesignBuildJourney(journey, next.id, {
      learnerInput,
      actorId: learnerId,
    }) as {
      ok: boolean;
      reason?: string;
      journey?: typeof journey;
      complete?: boolean;
      active_room_key?: string;
      active_phase_hint?: 'pilot' | 'semi' | 'full';
    };
    if (!result.ok || !result.journey) {
      setMessage(result.reason || 'step_failed');
      return;
    }
    persist(result.journey);
    onRoomFocus?.(result.active_room_key || next.room_key);
    onPhaseHint?.(result.active_phase_hint || (next.phase_hint as 'pilot' | 'semi' | 'full'));
    setLearnerInput('');
    setMessage(
      result.complete
        ? 'Design/build journey complete. Private portfolio retained. Return Home available.'
        : `Completed ${next.title} @ ${result.active_room_key} (${result.active_phase_hint})`,
    );
  }

  function reset() {
    const created = createGeelongDesignBuildJourney({ learnerId });
    if (created.ok && created.journey) {
      persist(created.journey);
      onRoomFocus?.(null);
      onPhaseHint?.(null);
      setMessage('Geelong design/build journey reset (planning concept).');
    }
  }

  return (
    <section className="mlv-geelong-db" aria-label="Geelong design/build journey" data-playable="true" data-representation-state="planning_concept">
      <h2>Geelong design / build studio journey</h2>
      <p className="mlv-kicker">{PLAYABLE_ACCEPTANCE_NOTE}</p>
      <p className="mlv-kicker">
        Room-bound critique in DESIGN_BUILD_STUDIO (semi+). Pilot uses workshop class / prototype cart / presentation wall. Temporal layers stay separately labeled.
      </p>
      <p>
        Progress {progress.done}/{progress.total}
        {next ? ` · next: ${next.title} @ ${next.room_key} (${next.phase_hint})` : ' · complete'}
      </p>
      <details open>
        <summary>Temporal / proposal layer labels</summary>
        <ul>
          {(journey.layers || []).map((layer: { location_id: string; role: string; representation_state: string; capture: string }) => (
            <li key={layer.location_id}>
              <strong>{layer.role}</strong>: {layer.representation_state} · {layer.capture}
            </li>
          ))}
        </ul>
      </details>
      <ol>
        {GEELONG_DB_STEPS.map((step) => (
          <li key={step.id} data-room-key={step.room_key} data-phase-hint={step.phase_hint}>
            {journey.completed_step_ids?.includes(step.id) ? '✓' : '○'} {step.title}
            <span className="mlv-kicker"> ({step.room_key} · {step.phase_hint})</span>
          </li>
        ))}
      </ol>
      {next && (
        <label>
          Learner work for {next.title}
          <textarea
            value={learnerInput}
            onChange={(e) => setLearnerInput(e.target.value)}
            rows={3}
            aria-label={`Geelong design/build input for ${next.id}`}
            data-testid="geelong-db-input"
          />
        </label>
      )}
      <div className="mlv-toolbar" role="group" aria-label="Geelong design/build actions">
        <button type="button" onClick={runNext} disabled={progress.complete || !next}>
          Complete studio task
        </button>
        <button type="button" onClick={() => { window.location.hash = '#/mlv/academic/assignments'; }}>
          Open WAIKE assignments
        </button>
        <button
          type="button"
          onClick={() => { window.location.hash = '#/mlv/home'; }}
          disabled={!journey.returned_home && !progress.complete}
        >
          Return Home
        </button>
        <button type="button" onClick={reset}>Reset</button>
      </div>
      {message && <p className="mlv-kicker" role="status">{message}</p>}
    </section>
  );
}

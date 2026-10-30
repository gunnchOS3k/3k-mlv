import { useMemo, useState } from 'react';
import {
  GARY_PILOT_STEPS,
  createGaryPilotJourney,
  garyPilotJourneyProgress,
  garyTaskPrompt,
  playGaryPilotStep,
  resumeGaryPilotJourney,
  PLAYABLE_ACCEPTANCE_NOTE,
} from '@3k-mlv/campus';

const STORAGE_KEY = 'mlv.gary.pilot.journey.v1';
const ARTIFACT_KEY = 'mlv.gary.pilot.private_artifact.v1';

export default function GaryPilotJourney({
  learnerId,
  onRoomFocus,
}: {
  learnerId: string;
  onRoomFocus?: (roomKey: string | null) => void;
}) {
  const [journey, setJourney] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return createGaryPilotJourney({ learnerId }).journey;
  });
  const [message, setMessage] = useState('');
  const [learnerInput, setLearnerInput] = useState('');
  const [privateArtifactId, setPrivateArtifactId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ARTIFACT_KEY);
    } catch {
      return null;
    }
  });
  const progress = useMemo(() => garyPilotJourneyProgress(journey), [journey]);
  const next = progress.next_step as { id: string; title: string; room_key: string } | null;
  const prompt = next ? garyTaskPrompt(next.id) : null;

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
    const result = playGaryPilotStep(journey, next.id, {
      learnerInput,
      actorId: learnerId,
    }) as {
      ok: boolean;
      reason?: string;
      journey?: typeof journey;
      complete?: boolean;
      active_room_key?: string;
      private_node?: { id: string; visibility: string };
      waike_surface?: string;
    };
    if (!result.ok || !result.journey) {
      setMessage(result.reason || 'step_failed');
      return;
    }
    persist(result.journey);
    onRoomFocus?.(result.active_room_key || next.room_key);
    if (result.private_node) {
      setPrivateArtifactId(result.private_node.id);
      try {
        localStorage.setItem(ARTIFACT_KEY, result.private_node.id);
      } catch {
        /* ignore */
      }
    }
    setLearnerInput('');
    const waike = result.waike_surface ? ` · WAIKE #/mlv/academic/${result.waike_surface}` : '';
    setMessage(
      result.complete
        ? `Pilot journey complete. Private drafts retained. Return Home available.${waike}`
        : `Completed in room ${result.active_room_key}: ${next.title}${waike}`,
    );
  }

  function resume() {
    const result = resumeGaryPilotJourney(journey);
    if (!result.ok || !result.journey) {
      setMessage(result.reason || 'resume_failed');
      return;
    }
    persist(result.journey);
    setMessage('Resumed saved Gary pilot journey (offline-capable).');
  }

  function reset() {
    const created = createGaryPilotJourney({ learnerId });
    if (created.ok) {
      persist(created.journey);
      setPrivateArtifactId(null);
      onRoomFocus?.(null);
      try {
        localStorage.removeItem(ARTIFACT_KEY);
      } catch {
        /* ignore */
      }
      setMessage('Journey reset (planning concept).');
    }
  }

  return (
    <section className="mlv-gary-journey" aria-label="Gary pilot learner journey" data-representation-state="planning_concept" data-playable="true">
      <h2>Gary pilot journey (playable)</h2>
      <p className="mlv-kicker">{PLAYABLE_ACCEPTANCE_NOTE}</p>
      <p className="mlv-kicker">
        Planning concept — not a physical campus. Device help → lab → private portfolio → showcase → save → resume / Home.
      </p>
      <p>
        Progress {progress.done}/{progress.total}
        {next ? ` · next: ${next.title} @ ${next.room_key}` : ' · complete'}
      </p>
      {privateArtifactId && (
        <p className="mlv-kicker" data-testid="gary-private-artifact">
          Private Home/Gallery artifact id={privateArtifactId} (unpublished)
        </p>
      )}
      <ol>
        {GARY_PILOT_STEPS.map((step) => (
          <li key={step.id} data-room-key={step.room_key} data-complete={journey.completed_step_ids?.includes(step.id) ? 'true' : 'false'}>
            {journey.completed_step_ids?.includes(step.id) ? '✓' : '○'} {step.title}
            <span className="mlv-kicker"> ({step.room_key})</span>
          </li>
        ))}
      </ol>
      {prompt && next && (
        <label>
          {prompt.prompt}
          <textarea
            value={learnerInput}
            onChange={(e) => setLearnerInput(e.target.value)}
            rows={3}
            aria-label={`Gary task input for ${next.id}`}
            data-testid="gary-learner-input"
          />
        </label>
      )}
      <div className="mlv-toolbar" role="group" aria-label="Gary journey actions">
        <button type="button" onClick={runNext} disabled={progress.complete || !prompt}>
          Complete room task
        </button>
        {prompt && (
          <button
            type="button"
            onClick={() => { window.location.hash = `#/mlv/academic/${prompt.waike_surface}`; }}
          >
            Open WAIKE {prompt.waike_surface}
          </button>
        )}
        <button type="button" onClick={resume} disabled={!journey.saved}>
          Resume saved
        </button>
        <button
          type="button"
          onClick={() => { window.location.hash = '#/mlv/home'; }}
          disabled={!journey.returned_home && !progress.complete}
        >
          Return Home
        </button>
        <button type="button" onClick={reset}>
          Reset journey
        </button>
      </div>
      {message && <p className="mlv-kicker" role="status">{message}</p>}
    </section>
  );
}

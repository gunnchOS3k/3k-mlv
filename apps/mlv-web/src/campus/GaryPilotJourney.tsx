import { useMemo, useState } from 'react';
import {
  GARY_PILOT_STEPS,
  advanceGaryPilotJourney,
  createGaryPilotJourney,
  garyPilotJourneyProgress,
  resumeGaryPilotJourney,
} from '@3k-mlv/campus';

const STORAGE_KEY = 'mlv.gary.pilot.journey.v1';

export default function GaryPilotJourney({ learnerId }: { learnerId: string }) {
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
  const progress = useMemo(() => garyPilotJourneyProgress(journey), [journey]);

  function persist(next: typeof journey) {
    setJourney(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }

  function runNext() {
    const step = progress.next_step as { id: string; title: string } | null;
    if (!step) return;
    const result = advanceGaryPilotJourney(journey, step.id, {
      payload: { ui: true, title: step.title },
    });
    if (!result.ok) {
      setMessage(result.reason || 'step_failed');
      return;
    }
    persist(result.journey);
    setMessage(result.complete ? 'Pilot journey complete. Return Home available.' : `Completed: ${step.title}`);
  }

  function resume() {
    const result = resumeGaryPilotJourney(journey);
    if (!result.ok) {
      setMessage(result.reason || 'resume_failed');
      return;
    }
    persist(result.journey);
    setMessage('Resumed saved Gary pilot journey.');
  }

  function reset() {
    const created = createGaryPilotJourney({ learnerId });
    if (created.ok) {
      persist(created.journey);
      setMessage('Journey reset (planning concept).');
    }
  }

  return (
    <section className="mlv-gary-journey" aria-label="Gary pilot learner journey" data-representation-state="planning_concept">
      <h2>Gary pilot journey</h2>
      <p className="mlv-kicker">
        Planning concept — not a physical campus. Device help → lab → portfolio → showcase → save → resume / Home.
      </p>
      <p>
        Progress {progress.done}/{progress.total}
        {progress.next_step ? ` · next: ${(progress.next_step as { title: string }).title}` : ' · complete'}
      </p>
      <ol>
        {GARY_PILOT_STEPS.map((step) => (
          <li key={step.id}>
            {journey.completed_step_ids?.includes(step.id) ? '✓' : '○'} {step.title}
            <span className="mlv-kicker"> ({step.room_key})</span>
          </li>
        ))}
      </ol>
      <div className="mlv-toolbar" role="group" aria-label="Gary journey actions">
        <button type="button" onClick={runNext} disabled={progress.complete}>
          Complete next step
        </button>
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

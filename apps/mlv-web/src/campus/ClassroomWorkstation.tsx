import { useEffect, useState } from 'react';
import { SPECIALIST_WAIKE_TRACKS } from '@3k-mlv/campus';
import { readReturnContext } from '../world/ReturnContext';
import { returnSceneHash } from '../world/handoffRoutes.mjs';

const DRAFT_KEY = 'mlv.classroom.draft.v1';
const TRACKS = [
  { id: 'NETWORKING_INFRA', title: 'Networking and Internet Infrastructure', unit: 2, lesson: 'CIDR as a land survey, not a guessing game' },
  { id: 'CYBER_SOC', title: 'Cybersecurity Foundations and SOC Readiness', unit: 2, lesson: 'Identity lifecycle — Naiya, Omar, and harbor-bot' },
  { id: 'SOFTWARE_BUILDER', title: 'Software Builder Zero-to-Hero', unit: 2, lesson: 'REST for checkout — status codes that mean something' },
  { id: SPECIALIST_WAIKE_TRACKS.OFFLINE_LEARNING_STUDIO, title: 'Digital Confidence to Computer Operator', unit: 1, lesson: 'Week 1 orientation' },
];

type Draft = { trackId: string; unit: number; text: string; savedAt: string };

/**
 * Focused classroom workstation: catalog references + private local draft.
 * Does not invent LMS grades. Does not open learn.gunnchos.com.
 */
export default function ClassroomWorkstation() {
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const track = TRACKS.find((row) => row.id === trackId) || TRACKS[0];
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const returnHref = returnSceneHash(readReturnContext() || { zone: 'gary-learning' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Draft;
      if (parsed?.trackId && typeof parsed.text === 'string') {
        setTrackId(parsed.trackId);
        setText(parsed.text);
        setMessage(`Restored private draft from ${parsed.savedAt}.`);
      }
    } catch {
      setMessage('Saved draft could not be read.');
    }
  }, []);

  function saveDraft() {
    const payload: Draft = {
      trackId: track.id,
      unit: track.unit,
      text: text.slice(0, 20000),
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setMessage('Private classroom draft saved on this device. Nothing was published.');
    } catch {
      setMessage('Browser storage is unavailable.');
    }
  }

  return (
    <section className="mlv-campus" aria-label="Classroom workstation" data-testid="classroom-workstation">
      <h2>Classroom workstation</h2>
      <p className="mlv-kicker">
        Focused learning console inside the Gary studio. Catalog references only — no invented Hub grades.
        Public Campus stays shell-gated. This panel does not open the public learn host.
      </p>
      <label>
        Course
        <select
          data-testid="classroom-track"
          value={track.id}
          onChange={(event) => setTrackId(event.target.value)}
        >
          {TRACKS.map((row) => (
            <option key={row.id} value={row.id}>{row.title}</option>
          ))}
        </select>
      </label>
      <p data-testid="classroom-lesson">Unit {track.unit}: {track.lesson}</p>
      <label>
        Private learner notes
        <textarea
          data-testid="classroom-draft"
          rows={6}
          maxLength={20000}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Save notes on this device. Avoid personal information."
        />
      </label>
      <div className="mlv-toolbar" role="toolbar" aria-label="Classroom actions">
        <button type="button" data-testid="classroom-save" onClick={saveDraft}>
          Save private draft
        </button>
        <a data-testid="classroom-return-world" href={returnHref}>
          Return to the saved classroom location
        </a>
      </div>
      {message ? <p role="status" data-testid="classroom-status">{message}</p> : null}
    </section>
  );
}

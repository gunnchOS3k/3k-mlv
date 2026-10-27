import { useEffect, useState } from 'react';

const DRAFT_KEY = 'mlv.home.office.draft.v1';

type Draft = { text: string; savedAt: string };

/**
 * Focused private desk console inside Home Office.
 * Notes stay on this device. Does not publish or invent Hub grades.
 */
export default function HomePrivateWorkbench({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Draft;
      if (typeof parsed?.text === 'string') {
        setText(parsed.text);
        setMessage(`Restored private desk notes from ${parsed.savedAt}.`);
      }
    } catch {
      setMessage('Saved desk notes could not be read.');
    }
  }, []);

  function save() {
    const payload: Draft = { text: text.slice(0, 20000), savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setMessage('Private desk notes saved on this device.');
    } catch {
      setMessage('Browser storage is unavailable.');
    }
  }

  return (
    <section className="mlv-campus" aria-label="Home private workbench" data-testid="home-private-workbench">
      <h2>Home office workbench</h2>
      <p className="mlv-kicker">
        Private desk console. Files and notes stay on this device until you explicitly share or publish.
      </p>
      <label>
        Private desk notes
        <textarea
          data-testid="home-workbench-draft"
          rows={6}
          maxLength={20000}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Work notes stay private on this browser."
        />
      </label>
      <div className="mlv-toolbar" role="toolbar" aria-label="Workbench actions">
        <button type="button" data-testid="home-workbench-save" onClick={save}>
          Save private notes
        </button>
        <button type="button" data-testid="home-workbench-close" onClick={onClose}>
          Return to the desk
        </button>
      </div>
      {message ? <p role="status" data-testid="home-workbench-status">{message}</p> : null}
    </section>
  );
}

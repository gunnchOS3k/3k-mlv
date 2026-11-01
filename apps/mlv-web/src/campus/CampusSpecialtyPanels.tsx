import { useState } from 'react';
import {
  runGermanySpecialtyPlayable,
  runGuyanaSpecialtyPlayable,
  runGrahamSpecialtyPlayable,
  runGeelongSpecialtyPlayable,
  runGhanaOfflinePlayable,
  runGazaPlayable,
  offlineSaveConflict,
  PLAYABLE_ACCEPTANCE_NOTE,
  sceneStateLabel,
  loadLocationRecord,
} from '@3k-mlv/campus';

export default function CampusSpecialtyPanels({ slug, learnerId = 'local-learner' }: { slug: string; learnerId?: string }) {
  const [status, setStatus] = useState('');
  const label = sceneStateLabel(loadLocationRecord(`loc.campus.${slug}`) as never);

  function run() {
    let out: Record<string, unknown> | null = null;
    if (slug === 'germany') out = runGermanySpecialtyPlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'guyana') out = runGuyanaSpecialtyPlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'graham-land') out = runGrahamSpecialtyPlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'geelong') out = runGeelongSpecialtyPlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'ghana') out = runGhanaOfflinePlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'gaza') out = runGazaPlayable({ learnerId }) as Record<string, unknown>;
    else if (slug === 'gary') {
      const conflict = offlineSaveConflict({ localRevision: 'local-2', remoteRevision: 'remote-1' });
      out = { ok: conflict.ok, conflict, note: 'Gary offline conflict helper' };
    }
    if (!out) {
      setStatus('No specialty panel for this campus slug.');
      return;
    }
    setStatus(out.ok ? `Specialty task complete (${slug}). nav_only=${String(out.nav_only)}` : `Failed: ${String(out.reason || 'unknown')}`);
  }

  // Germany/Guyana/Graham/Geelong have dedicated room-bound journey UIs; keep one-click acceptance harness here.
  if (!['germany', 'guyana', 'graham-land', 'geelong', 'ghana', 'gaza', 'gary'].includes(slug)) return null;

  return (
    <section className="mlv-specialty" aria-label={`${slug} specialty learning`} data-playable="true">
      <h2>{slug} specialty acceptance harness</h2>
      <p className="mlv-kicker">{PLAYABLE_ACCEPTANCE_NOTE}</p>
      {label && (
        <p className="mlv-kicker" data-testid="scene-state-label">{label.label} · {label.capture}</p>
      )}
      <ul className="mlv-kicker">
        {slug === 'germany' && <li>Room-bound apprenticeship (mechatronics cart → I4.0 twin → portfolio)</li>}
        {slug === 'guyana' && (
          <li>
            Room-bound climate/GIS (workstation → data studio → energy → public dashboard honesty → private
            portfolio)
          </li>
        )}
        {slug === 'graham-land' && <li>Room-bound polar twin (assumptions → data lab → satcom → Home)</li>}
        {slug === 'geelong' && <li>Design critique with shell / 2021 / proposal / campus labels preserved</li>}
        {slug === 'ghana' && <li>Offline cache → resume → portfolio → regional exchange (planning routes)</li>}
        {slug === 'gaza' && <li>Shared-device offline → portfolio recover → withdraw sharing · no coordinates</li>}
        {slug === 'gary' && <li>Offline save conflict helper (local retained with notice)</li>}
      </ul>
      <button type="button" onClick={run} data-testid={`specialty-run-${slug}`}>
        Run specialty acceptance
      </button>
      {status && <p role="status">{status}</p>}
    </section>
  );
}

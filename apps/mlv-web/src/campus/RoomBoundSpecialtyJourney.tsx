import { useMemo, useState, type ReactNode } from 'react';
import {
  PLAYABLE_ACCEPTANCE_NOTE,
  GERMANY_APPRENTICE_STEPS,
  createGermanyApprenticeshipJourney,
  advanceGermanyApprenticeshipJourney,
  germanyApprenticeshipProgress,
  GUYANA_CLIMATE_STEPS,
  createGuyanaClimateGisJourney,
  advanceGuyanaClimateGisJourney,
  guyanaClimateGisProgress,
  GRAHAM_POLAR_STEPS,
  GRAHAM_ASSUMPTIONS,
  createGrahamPolarTwinJourney,
  advanceGrahamPolarTwinJourney,
  grahamPolarTwinProgress,
  GHANA_OFFLINE_ROOM_STEPS,
  createGhanaOfflineRoomJourney,
  advanceGhanaOfflineRoomJourney,
  ghanaOfflineRoomProgress,
  GAZA_RECOVERY_ROOM_STEPS,
  createGazaRecoveryRoomJourney,
  advanceGazaRecoveryRoomJourney,
  gazaRecoveryRoomProgress,
} from '@3k-mlv/campus';

type PhaseHint = 'pilot' | 'semi' | 'full' | 'remote' | 'twin';
type SpecialtySlug = 'germany' | 'guyana' | 'graham-land' | 'ghana' | 'gaza';

type JourneyCfg = {
  slug: SpecialtySlug;
  title: string;
  blurb: string;
  storageKey: string;
  steps: ReadonlyArray<{ id: string; title: string; room_key: string; phase_hint: string; min_chars: number }>;
  create: (opts: { learnerId: string }) => { ok: boolean; journey?: Record<string, unknown>; reason?: string };
  advance: (
    journey: Record<string, unknown>,
    stepId: string,
    opts: { learnerInput: string; actorId: string },
  ) => Record<string, unknown>;
  progress: (journey: Record<string, unknown>) => {
    done: number;
    total: number;
    next_step: unknown;
    complete: boolean;
    active_room_key: string | null;
  };
  extra?: ReactNode;
};

const CFGS: Record<string, JourneyCfg> = {
  germany: {
    slug: 'germany',
    title: 'Germany apprenticeship journey',
    blurb:
      'Room-bound build → document → test → improve → present. Industry 4.0 twin studio on semi; twin-test step requires industrial-cyber coursework/not-cert honesty.',
    storageKey: 'mlv.germany.apprenticeship.journey.v1',
    steps: GERMANY_APPRENTICE_STEPS as JourneyCfg['steps'],
    create: createGermanyApprenticeshipJourney,
    advance: advanceGermanyApprenticeshipJourney,
    progress: germanyApprenticeshipProgress,
  },
  guyana: {
    slug: 'guyana',
    title: 'Guyana climate / GIS journey',
    blurb:
      'Flood/drainage uncertainty → climate/GIS map → energy/logistics note → public dashboard planning-twin honesty → private offline portfolio. Synthetic planning data only; no sensitive community data; dashboard is not live civic ops.',
    storageKey: 'mlv.guyana.climate_gis.journey.v1',
    steps: GUYANA_CLIMATE_STEPS as JourneyCfg['steps'],
    create: createGuyanaClimateGisJourney,
    advance: advanceGuyanaClimateGisJourney,
    progress: guyanaClimateGisProgress,
  },
  'graham-land': {
    slug: 'graham-land',
    title: 'Graham Land polar twin journey',
    blurb:
      'Assumptions → low-bandwidth climate → NTN/satcom cart → GIS twin ops (simulation≠field honesty) → Home. No fictional WAIKE Antarctic station.',
    storageKey: 'mlv.graham.polar_twin.journey.v1',
    steps: GRAHAM_POLAR_STEPS as JourneyCfg['steps'],
    create: createGrahamPolarTwinJourney,
    advance: advanceGrahamPolarTwinJourney,
    progress: grahamPolarTwinProgress,
    extra: (
      <details open>
        <summary>Required twin assumptions</summary>
        <ul>
          {GRAHAM_ASSUMPTIONS.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
    ),
  },
  ghana: {
    slug: 'ghana',
    title: 'Ghana offline resume / exchange journey',
    blurb:
      'Cache → resume offline → private portfolio → regional exchange (planning-route honesty required) → Home. Mobile-first; not a field deployment claim.',
    storageKey: 'mlv.ghana.offline_room.journey.v1',
    steps: GHANA_OFFLINE_ROOM_STEPS as JourneyCfg['steps'],
    create: createGhanaOfflineRoomJourney,
    advance: advanceGhanaOfflineRoomJourney,
    progress: ghanaOfflineRoomProgress,
  },
  gaza: {
    slug: 'gaza',
    title: 'Gaza recovery offline / withdraw journey',
    blurb:
      'Shared-device orient → offline kit → private reconstruction portfolio → withdraw sharing → Home. No site coordinates; not a permanent campus claim.',
    storageKey: 'mlv.gaza.recovery_room.journey.v1',
    steps: GAZA_RECOVERY_ROOM_STEPS as JourneyCfg['steps'],
    create: createGazaRecoveryRoomJourney,
    advance: advanceGazaRecoveryRoomJourney,
    progress: gazaRecoveryRoomProgress,
  },
};

export default function RoomBoundSpecialtyJourney({
  slug,
  learnerId,
  onRoomFocus,
  onPhaseHint,
}: {
  slug: SpecialtySlug;
  learnerId: string;
  onRoomFocus?: (roomKey: string | null) => void;
  onPhaseHint?: (phaseToken: PhaseHint | null) => void;
}) {
  const cfg = CFGS[slug];
  const [journey, setJourney] = useState(() => {
    try {
      const raw = localStorage.getItem(cfg.storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return cfg.create({ learnerId }).journey;
  });
  const [learnerInput, setLearnerInput] = useState('');
  const [message, setMessage] = useState('');
  const progress = useMemo(() => cfg.progress(journey), [cfg, journey]);
  const next = progress.next_step as
    | { id: string; title: string; room_key: string; phase_hint: string; min_chars: number }
    | null;

  function persist(nextJourney: typeof journey) {
    setJourney(nextJourney);
    try {
      localStorage.setItem(cfg.storageKey, JSON.stringify(nextJourney));
    } catch {
      /* ignore */
    }
  }

  function runNext() {
    if (!next) return;
    const result = cfg.advance(journey, next.id, {
      learnerInput,
      actorId: learnerId,
    }) as {
      ok: boolean;
      reason?: string;
      journey?: typeof journey;
      complete?: boolean;
      active_room_key?: string;
      active_phase_hint?: PhaseHint;
    };
    if (!result.ok || !result.journey) {
      setMessage(result.reason || 'step_failed');
      return;
    }
    persist(result.journey);
    onRoomFocus?.(result.active_room_key || next.room_key);
    onPhaseHint?.(result.active_phase_hint || (next.phase_hint as PhaseHint));
    setLearnerInput('');
    setMessage(
      result.complete
        ? `${cfg.title} complete. Private portfolio retained. Return Home available.`
        : `Completed ${next.title} @ ${result.active_room_key} (${result.active_phase_hint})`,
    );
  }

  function reset() {
    const created = cfg.create({ learnerId });
    if (created.ok && created.journey) {
      persist(created.journey);
      onRoomFocus?.(null);
      onPhaseHint?.(null);
      setMessage(`${cfg.title} reset (planning concept).`);
    }
  }

  return (
    <section
      className="mlv-room-bound-specialty"
      aria-label={cfg.title}
      data-playable="true"
      data-campus={slug}
      data-representation-state="planning_concept"
    >
      <h2>{cfg.title}</h2>
      <p className="mlv-kicker">{PLAYABLE_ACCEPTANCE_NOTE}</p>
      <p className="mlv-kicker">{cfg.blurb}</p>
      {cfg.extra}
      <p>
        Progress {progress.done}/{progress.total}
        {next ? ` · next: ${next.title} @ ${next.room_key} (${next.phase_hint})` : ' · complete'}
      </p>
      <ol>
        {cfg.steps.map((step) => (
          <li key={step.id} data-room-key={step.room_key} data-phase-hint={step.phase_hint}>
            {journey.completed_step_ids?.includes(step.id) ? '✓' : '○'} {step.title}
            <span className="mlv-kicker">
              {' '}
              ({step.room_key} · {step.phase_hint})
            </span>
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
            aria-label={`${slug} specialty input for ${next.id}`}
            data-testid={`${slug}-specialty-input`}
          />
        </label>
      )}
      <div className="mlv-toolbar" role="group" aria-label={`${slug} specialty actions`}>
        <button type="button" onClick={runNext} disabled={progress.complete || !next}>
          Complete specialty task
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/mlv/academic/courses';
          }}
        >
          Open WAIKE courses
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/mlv/home';
          }}
          disabled={!journey.returned_home && !progress.complete}
        >
          Return Home
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>
      {message && (
        <p className="mlv-kicker" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

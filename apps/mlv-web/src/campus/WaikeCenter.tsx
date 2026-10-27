import { campusWaikeReaderControl, consumeWaikeContract, WAIKE_PUBLIC_READER_DOCUMENT } from '@3k-mlv/campus';
import { readReturnContext } from '../world/ReturnContext';
import { returnSceneHash } from '../world/handoffRoutes.mjs';
import ClassroomWorkstation from './ClassroomWorkstation';

const LABELS: Record<string, string> = {
  today: 'Today',
  continue: 'Continue',
  courses: 'Courses',
  assignments: 'Assignments',
  grades: 'Grades / Feedback',
  calendar: 'Calendar',
  study: 'Study',
  ask_gunnchai: 'Ask gunnchAI',
};

/** Catalog-only adapter so the classroom can open a focused courses surface without inventing Hub grades. */
function classroomCatalogAdapter() {
  return {
    readSurfaces: () => ({
      courses: {
        available: true,
        items: [
          { id: 'NETWORKING_INFRA', title: 'Networking and Internet Infrastructure' },
          { id: 'CYBER_SOC', title: 'Cybersecurity Foundations and SOC Readiness' },
          { id: 'SOFTWARE_BUILDER', title: 'Software Builder Zero-to-Hero' },
        ],
      },
    }),
  };
}

export default function WaikeCenter({ focusedClassroom = false }: { focusedClassroom?: boolean }) {
  const surface = typeof window !== 'undefined'
    ? (window.location.hash.match(/#\/mlv\/academic\/([^/?#]+)/)?.[1] || '')
    : '';
  const showWorkstation = focusedClassroom || surface === 'courses';
  const contract = consumeWaikeContract(showWorkstation ? classroomCatalogAdapter() : null);
  // Production stays on the shell constant. Only an explicit build-time tracks value opens Campus.
  const documentKind =
    import.meta.env.VITE_WAIKE_READER_DOCUMENT === 'tracks' ? 'tracks' : WAIKE_PUBLIC_READER_DOCUMENT;
  const reader = campusWaikeReaderControl(import.meta.env.VITE_WAIKE_READER_URL, documentKind);
  const returnHref = returnSceneHash(readReturnContext());
  return (
    <section aria-label="WAIKE Academic Center">
      <h2>WAIKE Academic Center</h2>
      <p className="mlv-kicker">
        Campus consumes the WAIKE contract. It does not duplicate LMS data.
        {contract.bound ? '' : ` ${contract.reason}.`}
      </p>
      <div className="mlv-waike-bar">
        {Object.values(contract.surfaces).map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="mlv-chip"
            onClick={() => {
              window.location.hash = `#/mlv/academic/${entry.id}`;
            }}
          >
            {LABELS[entry.id] || entry.id}
          </button>
        ))}
      </div>
      {showWorkstation ? <ClassroomWorkstation /> : null}
      {reader.state === 'link' && reader.href ? (
        <p><a data-testid="campus-waike-reader" href={reader.href}>Open the WAIKE reader</a></p>
      ) : (
        <p data-testid="campus-waike-unavailable">WAIKE reader unavailable. The public page is a shell and does not include the track list.</p>
      )}
      <p><a href={returnHref}>Return to the saved world location</a></p>
    </section>
  );
}

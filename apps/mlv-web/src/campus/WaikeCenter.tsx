import { consumeWaikeContract } from '@3k-mlv/campus';
import { readReturnContext } from '../world/ReturnContext';
import { returnSceneHash } from '../world/handoffRoutes.mjs';

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

export default function WaikeCenter() {
  const contract = consumeWaikeContract(null);
  const returnHref = returnSceneHash(readReturnContext());
  return (
    <section aria-label="WAIKE Academic Center">
      <h2>WAIKE Academic Center</h2>
      <p className="mlv-kicker">
        Campus consumes the WAIKE contract. It does not duplicate LMS data.
        {contract.bound ? '' : ` ${contract.reason}.`}
      </p>
      <div className="mlv-waike-bar">
        {Object.values(contract.surfaces).map((surface) => (
          <button
            key={surface.id}
            type="button"
            className="mlv-chip"
            onClick={() => {
              window.location.hash = `#/mlv/academic/${surface.id}`;
            }}
          >
            {LABELS[surface.id] || surface.id}
          </button>
        ))}
      </div>
      <p><a href={returnHref}>Return to the saved world location</a></p>
    </section>
  );
}

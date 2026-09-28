import { CAMPUS_LANDING } from '@3k-mlv/campus';
import WaikeCenter from './WaikeCenter';

export default function CampusLanding() {
  return (
    <section className="mlv-campus" aria-label="Campus landing">
      <h1>Campus</h1>
      <p className="mlv-kicker">
        Digital planning twins of the seven WAIKE UPNOW nodes. Not a claim that physical campuses exist.
      </p>
      <WaikeCenter />
      <ul className="mlv-campus__grid">
        {CAMPUS_LANDING.map((item) => (
          <li key={item.id}>
            <article>
              <h2>{item.label}</h2>
              <button type="button" onClick={() => { window.location.hash = item.route; }}>
                Open
              </button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

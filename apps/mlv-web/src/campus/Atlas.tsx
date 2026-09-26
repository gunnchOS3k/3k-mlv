import { CAMPUS_CATALOG } from '@3k-mlv/campus';

export default function Atlas() {
  return (
    <section className="mlv-campus" aria-label="7GC Atlas">
      <h1>7GC Atlas</h1>
      <p className="mlv-kicker">Seven digital UPNOW nodes. No campus is a palette swap.</p>
      <div className="mlv-atlas">
        {CAMPUS_CATALOG.map((campus) => (
          <article key={campus.id}>
            <h2>{campus.atlas_name}</h2>
            <p>{campus.planning_model}</p>
            <p className="mlv-kicker">{campus.local_focus}</p>
            <p>
              <span className={`mlv-truth mlv-truth--${campus.truth_state}`}>{campus.truth_state}</span>
              {' '}· {campus.phases[0].label}
            </p>
            <button
              type="button"
              onClick={() => { window.location.hash = `#/mlv/campus/${campus.slug}`; }}
            >
              Enter Digital Campus
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

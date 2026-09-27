const SHELVES = [
  { id: 'common-study', title: 'Common study', note: 'Public/common holdings only.' },
  { id: 'brief-readers', title: 'Campus brief readers', note: 'Planning-twin documents, not Home files.' },
  { id: 'waike-readers', title: 'WAIKE readers', note: 'Opened through the WAIKE contract, not copied LMS rows.' },
];

export default function Library() {
  return (
    <section className="mlv-campus" aria-label="Library">
      <h1>Library</h1>
      <p className="mlv-kicker">Public/common library. Home PRIVATE files do not leak into this shelf.</p>
      <ul className="mlv-room-grid">
        {SHELVES.map((shelf) => (
          <li key={shelf.id}>
            <article>
              <h2>{shelf.title}</h2>
              <p>{shelf.note}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

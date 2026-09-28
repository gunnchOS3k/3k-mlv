const PROVIDERS = [
  { id: 'anime-aggressors', name: 'Anime Aggressors', kind: 'authorized game' },
  { id: 'pedestrian-pursuit', name: 'Pedestrian Pursuit', kind: 'authorized game' },
  { id: 'waike-media', name: 'WAIKE hybrid studio', kind: 'authorized learning media' },
];

export default function MediaCenter() {
  return (
    <section className="mlv-campus" aria-label="Media Center">
      <h1>Media Center</h1>
      <p className="mlv-kicker">
        Group media and games only through authorized providers. Private Home files are out of scope.
      </p>
      <ul className="mlv-room-grid">
        {PROVIDERS.map((provider) => (
          <li key={provider.id}>
            <article>
              <h2>{provider.name}</h2>
              <p>{provider.kind}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

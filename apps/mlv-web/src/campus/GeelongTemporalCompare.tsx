import { useMemo, useState } from 'react';
import { loadLocationRecord, sceneStateLabel } from '@3k-mlv/campus';

const LAYERS = [
  { id: 'loc.heritage.geelong_gallery_shell', title: 'Building shell' },
  { id: 'loc.heritage.geelong_rone_2021', title: 'RONE 2021 exhibition' },
  { id: 'loc.heritage.geelong_jwa_proposal', title: 'JWA expansion proposal' },
  { id: 'loc.heritage.geelong_student_resonance', title: 'Student exploration' },
  { id: 'loc.campus.geelong', title: 'WAIKE Geelong planning concept' },
] as const;

export default function GeelongTemporalCompare() {
  const layers = useMemo(
    () => LAYERS.map((layer) => {
      const record = loadLocationRecord(layer.id);
      return { ...layer, record, label: sceneStateLabel(record as never) };
    }),
    [],
  );
  const [active, setActive] = useState(layers[0]?.id);

  const selected = layers.find((l) => l.id === active) || layers[0];

  return (
    <section className="mlv-geelong-compare" aria-label="Geelong temporal comparison">
      <h2>Geelong temporal / proposal comparison</h2>
      <p className="mlv-kicker">
        Shell, 2021 exhibition, institutional proposal, student exploration, and WAIKE planning concept stay separately labeled.
      </p>
      <div className="mlv-toolbar" role="toolbar" aria-label="Geelong scene states">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            className="mlv-chip"
            aria-pressed={active === layer.id}
            onClick={() => setActive(layer.id)}
          >
            {layer.title}
          </button>
        ))}
      </div>
      {selected?.label && (
        <article data-representation-state={selected.label.representation_state}>
          <h3>{selected.title}</h3>
          <p data-testid="scene-state-label">{selected.label.label}</p>
          <p className="mlv-kicker">{selected.label.capture} · {selected.label.scene_version}</p>
          <p>{String((selected.record?.claims as Array<{ claim_text: string }>)?.[0]?.claim_text || '')}</p>
          <p className="mlv-kicker">Sources: {((selected.record?.source_ids as string[]) || []).join(', ')}</p>
        </article>
      )}
    </section>
  );
}

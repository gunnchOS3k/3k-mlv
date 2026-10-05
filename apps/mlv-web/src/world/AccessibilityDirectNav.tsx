import type { WorldInteractable } from './types';

type Props = {
  items: WorldInteractable[];
  onSelect: (item: WorldInteractable) => void;
};

export default function AccessibilityDirectNav({ items, onSelect }: Props) {
  return (
    <section aria-label="Accessible direct navigation" style={{ padding: '0.75rem 1rem' }}>
      <h2 style={{ fontSize: 16 }}>Direct list (no mandatory 3D traversal)</h2>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <button type="button" onClick={() => onSelect(it)}>
              {it.verb}: {it.label} — {it.accessibilityAlternative}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

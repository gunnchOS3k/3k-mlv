import type { MlvNode } from '@3k-mlv/shared';
import { createPrivateWorkingCopy, galleryPublicOnly } from '@3k-mlv/campus';

export default function GallerySite({
  nodes,
  actor,
  onWorkingCopy,
}: {
  nodes: MlvNode[];
  actor: { id: string };
  onWorkingCopy: (node: MlvNode) => void;
}) {
  const publicNodes = galleryPublicOnly(nodes) as MlvNode[];
  return (
    <section className="mlv-gallery" aria-label="Gallery">
      <h1>Gallery</h1>
      <p className="mlv-kicker">
        PUBLIC only. Editing a public project creates a private working copy. Publish/unpublish stay explicit.
      </p>
      {publicNodes.length === 0 ? (
        <p>No public works in this player instance yet.</p>
      ) : (
        <ul className="mlv-room-grid">
          {publicNodes.map((node) => (
            <li key={node.id}>
              <article>
                <h2>{node.name}</h2>
                <p>{node.visibility}</p>
                <button
                  type="button"
                  onClick={() => {
                    const copy = createPrivateWorkingCopy(node, actor);
                    if (copy.ok) onWorkingCopy(copy.node as MlvNode);
                  }}
                >
                  Edit as private working copy
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

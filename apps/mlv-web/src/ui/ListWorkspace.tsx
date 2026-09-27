import type { MlvNode } from '@3k-mlv/shared';
import PrivacyBadge from './PrivacyBadge';

export default function ListWorkspace({
  nodes,
  onOpen,
  onShare,
  onPublish,
  onMakePrivate,
  onRename,
  onDelete,
  onUpload,
}: {
  nodes: MlvNode[];
  onOpen: (node: MlvNode) => void;
  onShare: (node: MlvNode) => void;
  onPublish: (node: MlvNode) => void;
  onMakePrivate: (node: MlvNode) => void;
  onRename: (node: MlvNode) => void;
  onDelete: (node: MlvNode) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <section className="mlv-list" aria-label="File workspace">
      <header className="mlv-list__header">
        <h2>Files</h2>
        <label className="mlv-upload">
          Upload (defaults private)
          <input
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
        </label>
      </header>
      {nodes.length === 0 ? (
        <p>No files in this player instance yet.</p>
      ) : (
        <ul className="mlv-list__grid">
          {nodes.map((node) => (
            <li key={node.id}>
              <article>
                <h3>{node.name}</h3>
                <PrivacyBadge visibility={node.visibility} />
                <p>{node.mime_type || 'file'} · {node.size_bytes ?? 0} B</p>
                <div className="mlv-list__actions">
                  <button type="button" onClick={() => onOpen(node)}>Open</button>
                  <button type="button" onClick={() => onRename(node)}>Rename</button>
                  <button type="button" onClick={() => onShare(node)}>Share Link</button>
                  <button type="button" onClick={() => onPublish(node)}>Publish</button>
                  <button type="button" onClick={() => onMakePrivate(node)}>Make Private</button>
                  <button type="button" onClick={() => onDelete(node)}>Delete</button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

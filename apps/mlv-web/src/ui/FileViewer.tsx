import { useEffect, useMemo, useState } from 'react';
import type { MlvNode } from '@3k-mlv/shared';
import PrivacyBadge from './PrivacyBadge';

function looksLikeHtml(name: string, mime: string): boolean {
  return mime.includes('html') || name.toLowerCase().endsWith('.html') || name.toLowerCase().endsWith('.htm') || name.toLowerCase().endsWith('.js');
}

export default function FileViewer({
  node,
  blob,
  onClose,
}: {
  node: MlvNode;
  blob: Blob | null;
  onClose: () => void;
}) {
  const mime = (node.mime_type || '').toLowerCase();
  const [text, setText] = useState<string>('');
  const objectUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!blob) return;
    if (mime.startsWith('text/') || mime.includes('json') || mime.includes('javascript') || mime.includes('markdown')) {
      blob.text().then(setText).catch(() => setText(''));
    }
  }, [blob, mime]);

  const executable = looksLikeHtml(node.name, mime);

  return (
    <div className="mlv-viewer" role="dialog" aria-modal="true" aria-labelledby="mlv-viewer-title">
      <header className="mlv-viewer__header">
        <div>
          <h2 id="mlv-viewer-title">{node.name}</h2>
          <PrivacyBadge visibility={node.visibility} />
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>
      <div className="mlv-viewer__body">
        {!blob && <p>No authorized bytes for this node.</p>}
        {blob && executable && (
          <p>
            Uploaded HTML/JS is not executed. Treat this as a download-only artifact.
            {objectUrl ? <a href={objectUrl} download={node.name}> Download</a> : null}
          </p>
        )}
        {blob && !executable && mime.startsWith('image/') && objectUrl && (
          <img src={objectUrl} alt={node.name} style={{ maxWidth: '100%' }} />
        )}
        {blob && !executable && mime.startsWith('audio/') && objectUrl && (
          <audio controls src={objectUrl}>Audio playback is unavailable.</audio>
        )}
        {blob && !executable && mime.startsWith('video/') && objectUrl && (
          <video controls src={objectUrl} style={{ maxWidth: '100%' }}>Video playback is unavailable.</video>
        )}
        {blob && mime === 'application/pdf' && objectUrl && (
          <iframe
            title={node.name}
            src={objectUrl}
            sandbox=""
            referrerPolicy="no-referrer"
            style={{ width: '100%', minHeight: '60vh', border: 0 }}
          />
        )}
        {blob && (mime.startsWith('text/') || mime.includes('json') || mime.includes('markdown')) && (
          <pre><code>{text}</code></pre>
        )}
        {blob && (mime.includes('gltf') || node.name.toLowerCase().endsWith('.glb')) && (
          <p>3D model authorized. Pedestal viewer uses the spatial world; bytes are not executed as scripts.</p>
        )}
        {blob && objectUrl && (
          <p>
            <a href={objectUrl} download={node.name}>Download</a>
          </p>
        )}
        <dl>
          <dt>MIME</dt><dd>{node.mime_type || 'unknown'}</dd>
          <dt>Size</dt><dd>{node.size_bytes ?? 0} bytes</dd>
          <dt>SHA-256</dt><dd>{node.sha256 || 'n/a'}</dd>
        </dl>
      </div>
    </div>
  );
}

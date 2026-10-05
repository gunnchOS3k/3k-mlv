import { useEffect, useMemo, useState } from 'react';
import type { MlvNode } from '@3k-mlv/shared';
import {
  createMyGalleryAsset,
  createPrivateWorkingCopy,
  publicGalleryAssets,
} from '@3k-mlv/campus';
import sourcesDoc from '../../../../data/gallery/v1/institution_sources.json';
import rotationDoc from '../../../../data/gallery/cultural_rotation_v4_2.json';
import { advanceRotationIndex, rotationAt } from './galleryRotation.mjs';

type InstitutionSource = {
  campus: string;
  campus_slug: string;
  institution: string;
  source_url: string;
  city_region: string;
  why_relevant: string;
  digital_treatment: string;
  affiliation_claim: boolean;
  safety_notes: string;
};

type RotationExhibit = {
  campus: string;
  institution: string;
  title: string;
  creator: string;
  date: string;
  source_url: string;
  rights_status: 'metadata-only';
  thumbnail_status: 'none';
  local_context: string;
};

const SOURCES = (sourcesDoc as { sources: InstitutionSource[] }).sources;
const ROTATION = (rotationDoc as { exhibits: RotationExhibit[] }).exhibits;

export default function GallerySite({
  nodes,
  actor,
  onWorkingCopy,
  onCreatePrivate,
  onPublish,
}: {
  nodes: MlvNode[];
  actor: { id: string };
  onWorkingCopy: (node: MlvNode) => void;
  onCreatePrivate: (node: MlvNode) => void;
  onPublish: (node: MlvNode, wing: 'public_community' | 'exchange_7gc') => void;
}) {
  const [campus, setCampus] = useState<string>('all');
  const [rotationIndex, setRotationIndex] = useState(0);
  const [rotationPlaying, setRotationPlaying] = useState(true);
  const campuses = useMemo(
    () => ['all', ...Array.from(new Set(SOURCES.map((source) => source.campus)))],
    [],
  );
  const localSources = SOURCES.filter((source) => campus === 'all' || source.campus === campus);
  const published = publicGalleryAssets(nodes) as MlvNode[];
  const exchange = published.filter((node) => node.metadata?.gallery_zone === 'exchange_7gc');
  const community = published.filter((node) => node.metadata?.gallery_zone === 'public_community');
  const mine = nodes.filter((node) =>
    node.owner_id === actor.id
    && !node.deleted_at
    && (node.metadata?.gallery_zone === 'my_gallery' || node.metadata?.gallery_file === true || node.metadata?.gallery_edit === true),
  );
  const currentRotation = rotationAt(ROTATION, rotationIndex);

  useEffect(() => {
    if (!rotationPlaying || ROTATION.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      setRotationIndex((current) => advanceRotationIndex(ROTATION.length, current, 1));
    }, 12000);
    return () => window.clearInterval(timer);
  }, [rotationPlaying]);

  return (
    <section className="mlv-gallery" aria-label="Gallery">
      <h1>Gallery</h1>
      <p className="mlv-kicker">
        Five wings. Institution wings are metadata references only. My Gallery is private until you explicitly publish. A friend&apos;s Home does not show those private files.
      </p>
      <nav className="mlv-gallery__wing-nav" aria-label="Gallery wings">
        <a href="#wing-local">Local Culture</a>
        <a href="#wing-rotating">Rotating Institution</a>
        <a href="#wing-exchange">7GC Exchange</a>
        <a href="#wing-public">Public Community</a>
        <a href="#wing-mine">My Gallery</a>
      </nav>

      <section aria-labelledby="wing-local">
        <h2 id="wing-local">Local Culture Wing</h2>
        <div className="mlv-phase-bar" role="toolbar" aria-label="Campus culture filter">
          {campuses.map((name) => (
            <button
              key={name}
              type="button"
              className="mlv-chip"
              aria-pressed={campus === name}
              onClick={() => setCampus(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <ul className="mlv-room-grid">
          {localSources.map((source) => (
            <li key={source.source_url}>
              <InstitutionCard source={source} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="wing-rotating">
        <h2 id="wing-rotating">Rotating Institution Wing</h2>
        <p className="mlv-kicker">A live metadata-only rotation across the seven campuses. No artwork is copied, no scraped images are shown, and no affiliation is implied.</p>
        {currentRotation ? (
          <article className="mlv-gallery__rotation" aria-live="polite" aria-atomic="true">
            <p className="mlv-kicker">Exhibit {rotationIndex + 1} of {ROTATION.length}</p>
            <h3>{currentRotation.title}</h3>
            <p>{currentRotation.institution} · {currentRotation.campus}</p>
            <p>{currentRotation.local_context}</p>
            <p className="mlv-kicker">
              {currentRotation.creator} · {currentRotation.date} · rights={currentRotation.rights_status} · thumbnail={currentRotation.thumbnail_status}
            </p>
            <p>
              <a href={currentRotation.source_url} target="_blank" rel="noreferrer noopener">
                Open verified external source
              </a>
            </p>
          </article>
        ) : <p>No rotation sources are available.</p>}
        <div className="mlv-toolbar" role="group" aria-label="Institution rotation controls">
          <button type="button" className="mlv-chip" onClick={() => setRotationIndex((current) => advanceRotationIndex(ROTATION.length, current, -1))}>
            Previous institution
          </button>
          <button type="button" className="mlv-chip" aria-pressed={rotationPlaying} onClick={() => setRotationPlaying((playing) => !playing)}>
            {rotationPlaying ? 'Pause rotation' : 'Resume rotation'}
          </button>
          <button type="button" className="mlv-chip" onClick={() => setRotationIndex((current) => advanceRotationIndex(ROTATION.length, current, 1))}>
            Next institution
          </button>
        </div>
      </section>

      <section aria-labelledby="wing-exchange">
        <h2 id="wing-exchange">7GC Exchange Wing</h2>
        <PublishedList
          nodes={exchange}
          actor={actor}
          empty="Exchange shows only assets explicitly published into this wing."
          onWorkingCopy={onWorkingCopy}
        />
      </section>

      <section aria-labelledby="wing-public">
        <h2 id="wing-public">Public Community Gallery</h2>
        <PublishedList
          nodes={community}
          actor={actor}
          empty="Public Gallery is empty until someone confirms publish."
          onWorkingCopy={onWorkingCopy}
        />
      </section>

      <section aria-labelledby="wing-mine">
        <h2 id="wing-mine">My Gallery</h2>
        <p className="mlv-kicker">Private by default. Publish is a separate confirmation. Unconfirmed files stay off public wings and off a friend&apos;s Home.</p>
        <button
          type="button"
          onClick={() => {
            const created = createMyGalleryAsset({
              ownerId: actor.id,
              name: 'Private gallery note',
              mimeType: 'text/plain',
              extra: { id: crypto.randomUUID() },
            });
            if (created.ok) onCreatePrivate(created.node as MlvNode);
          }}
        >
          Add private gallery note
        </button>
        {mine.length === 0 ? (
          <p>No files in My Gallery yet.</p>
        ) : (
          <ul className="mlv-room-grid">
            {mine.map((node) => (
              <li key={node.id}>
                <article>
                  <h3>{node.name}</h3>
                  <p>{node.visibility === 'public' && node.metadata?.published === true ? 'Published' : 'Private'}</p>
                  {node.visibility !== 'public' && (
                    <>
                      <button type="button" onClick={() => onPublish(node, 'public_community')}>
                        Publish to Public Community Gallery
                      </button>
                      <button type="button" onClick={() => onPublish(node, 'exchange_7gc')}>
                        Publish to 7GC Exchange
                      </button>
                    </>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

function InstitutionCard({ source }: { source: InstitutionSource }) {
  return (
    <article>
      <h3>{source.institution}</h3>
      <p>{source.campus} · {source.city_region}</p>
      <p>{source.why_relevant}</p>
      <p className="mlv-kicker">{source.digital_treatment}</p>
      <p className="mlv-kicker">affiliation_claim={String(source.affiliation_claim)}</p>
      <p className="mlv-kicker">{source.safety_notes}</p>
      <p><a href={source.source_url}>{source.source_url}</a></p>
    </article>
  );
}

function PublishedList({
  nodes,
  actor,
  empty,
  onWorkingCopy,
}: {
  nodes: MlvNode[];
  actor: { id: string };
  empty: string;
  onWorkingCopy: (node: MlvNode) => void;
}) {
  if (nodes.length === 0) return <p>{empty}</p>;
  return (
    <ul className="mlv-room-grid">
      {nodes.map((node) => (
        <li key={node.id}>
          <article>
            <h3>{node.name}</h3>
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
  );
}

export default function EvidencePanel({
  source,
  implementation,
  phase,
  status,
  limitations,
  representationState,
  representationLabel,
  sceneVersion,
  captureNote,
  metricAccuracy,
  sourceIds,
}: {
  source: string;
  implementation: string;
  phase: string;
  status: string;
  limitations: string;
  representationState?: string;
  representationLabel?: string;
  sceneVersion?: string;
  captureNote?: string;
  metricAccuracy?: string;
  sourceIds?: string[];
}) {
  return (
    <details className="mlv-evidence" open={Boolean(representationState)}>
      <summary>Planning / evidence (optional)</summary>
      {representationLabel && (
        <p>
          <strong>Scene state:</strong>{' '}
          <span data-testid="scene-state-label" data-representation-state={representationState}>
            {representationLabel}
          </span>
        </p>
      )}
      {sceneVersion && (
        <p><strong>Scene / model version:</strong> {sceneVersion}</p>
      )}
      {captureNote && (
        <p><strong>Period / capture:</strong> {captureNote}</p>
      )}
      {metricAccuracy && (
        <p><strong>Metric accuracy:</strong> {metricAccuracy}</p>
      )}
      {sourceIds && sourceIds.length > 0 && (
        <p><strong>Source IDs:</strong> {sourceIds.join(', ')}</p>
      )}
      <p><strong>Source requirement:</strong> {source}</p>
      <p><strong>Implementation:</strong> {implementation}</p>
      <p><strong>Phase:</strong> {phase}</p>
      <p><strong>Proposal / simulation / real-data status:</strong> {status}</p>
      <p><strong>Limitations:</strong> {limitations}</p>
    </details>
  );
}

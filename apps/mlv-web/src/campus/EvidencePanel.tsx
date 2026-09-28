export default function EvidencePanel({
  source,
  implementation,
  phase,
  status,
  limitations,
}: {
  source: string;
  implementation: string;
  phase: string;
  status: string;
  limitations: string;
}) {
  return (
    <details className="mlv-evidence">
      <summary>Planning / evidence (optional)</summary>
      <p><strong>Source requirement:</strong> {source}</p>
      <p><strong>Implementation:</strong> {implementation}</p>
      <p><strong>Phase:</strong> {phase}</p>
      <p><strong>Proposal / simulation / real-data status:</strong> {status}</p>
      <p><strong>Limitations:</strong> {limitations}</p>
    </details>
  );
}

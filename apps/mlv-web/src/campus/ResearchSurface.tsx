import { readReturnContext } from '../world/ReturnContext';
import { returnSceneHash } from '../world/handoffRoutes.mjs';

export default function ResearchSurface({ projectId }: { projectId: string }) {
  const returnHref = returnSceneHash(readReturnContext());
  const configuredPortal = import.meta.env.VITE_RESEARCH_WEB_URL;
  return (
    <section className="mlv-campus" aria-label="Research handoff surface">
      <h1>Research project handoff</h1>
      <p className="mlv-kicker">Project: {projectId}</p>
      <p>
        This is a simulation / digital-twin / prototype record from the declared
        <code> gunnchOS3k/gunnchos-research-portal </code> contract. It is not a
        measured deployment or evidence of physical infrastructure.
      </p>
      {configuredPortal ? (
        <p><a href={configuredPortal} target="_blank" rel="noreferrer noopener">Open configured research portal</a></p>
      ) : (
        <p className="mlv-warning">External research portal URL is not configured; this honest local contract surface remains available.</p>
      )}
      <p><a href={returnHref}>Return to the saved world location</a></p>
    </section>
  );
}

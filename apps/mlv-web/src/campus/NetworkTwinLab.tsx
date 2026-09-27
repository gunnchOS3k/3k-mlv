import { useMemo, useState } from 'react';
import {
  campusBySlug,
  CAMPUS_CATALOG,
  CANDIDATE_KINDS,
  DIGITAL_SHADOW_TIMELINE,
  EVIDENCE_CLASSES,
  MATERIAL_ASSUMPTIONS,
  NETWORK_LAYERS,
  DEFAULT_NETWORK_LAYER,
  OBJECTIVE_FIELDS,
  RIC_ALLOWED_STATES,
  RIC_DISABLED_STATES,
  SERVICE_INTENT_TEMPLATES,
  consumeOptimizationDocument,
  descriptiveGrouping,
  exportCampusDesignBundle,
  geometryDisclaimer,
  predictedMeasuredLabel,
  proposalActionLabel,
  ricDisplayState,
  syntheticLoopLabel,
  unboundWaikeCampus,
} from '@3k-mlv/campus';
import WaikeCenter from './WaikeCenter';
import { OPTIMIZATION_FIXTURES } from './networkTwinFixtures';

type OptimizationAlt = {
  alternative_id: string;
  label: string;
  objectives: Record<string, number>;
};

type Recommendation = {
  recommended_action: string;
  reason: string;
  constraints: string;
  evidence_source: string;
  allowed_actions: string[];
};

const SLUGS = CAMPUS_CATALOG.map((campus) => campus.slug);
export default function NetworkTwinLab({ slug }: { slug?: string | null }) {
  const initial = slug && SLUGS.includes(slug) ? slug : 'gary';
  const [campusSlug, setCampusSlug] = useState(initial);
  const [layer, setLayer] = useState(DEFAULT_NETWORK_LAYER);
  const [mode, setMode] = useState<'list' | 'table' | 'report'>('list');
  const [intentId, setIntentId] = useState(SERVICE_INTENT_TEMPLATES[0].id);
  const [materialId, setMaterialId] = useState(MATERIAL_ASSUMPTIONS[0].id);
  const [ric, setRic] = useState<(typeof RIC_ALLOWED_STATES)[number]>('SIMULATION ONLY');
  const campus = campusBySlug(campusSlug);
  const waike = unboundWaikeCampus();

  const design = useMemo(() => exportCampusDesignBundle(campusSlug), [campusSlug]);
  const optimization = useMemo(
    () => consumeOptimizationDocument(OPTIMIZATION_FIXTURES[campusSlug], campusSlug),
    [campusSlug],
  );

  if (!campus || !design.ok || !design.document) {
    return (
      <section className="mlv-campus" aria-label="Network Twin Lab">
        <h1>Network Twin Lab</h1>
        <p>Campus design export is unavailable.</p>
      </section>
    );
  }

  const selectedIntent = SERVICE_INTENT_TEMPLATES.find((item) => item.id === intentId);
  const selectedMaterial = MATERIAL_ASSUMPTIONS.find((item) => item.id === materialId);
  const ricState = ricDisplayState(ric);

  return (
    <section className="mlv-campus" aria-label="Network Twin Lab">
      <h1>Network Twin Lab</h1>
      <p className="mlv-kicker">
        Opt-in planning surface inside Campus. Not a RIC operating system.
        {` ${geometryDisclaimer()}`}
      </p>
      <p>
        <span className="mlv-truth">{syntheticLoopLabel()}</span>{' '}
        <span className="mlv-truth">{predictedMeasuredLabel('SIMULATED')}</span>
      </p>
      <WaikeCenter />
      <p className="mlv-kicker">
        WAIKE readiness: {waike.readiness.ready} READY / {waike.readiness.partial} PARTIAL.
        Do not claim 18/18 fully learner-ready. Fixture mode: {waike.consumer_summary.mode}.
      </p>
      <div className="mlv-toolbar" role="toolbar" aria-label="Campus and layer">
        {SLUGS.map((item) => (
          <button
            key={item}
            type="button"
            className="mlv-chip"
            aria-pressed={item === campusSlug}
            onClick={() => setCampusSlug(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mlv-toolbar" role="toolbar" aria-label="Network Twin layers">
        {NETWORK_LAYERS.map((item) => (
          <button
            key={item}
            type="button"
            className="mlv-chip"
            aria-pressed={item === layer}
            onClick={() => setLayer(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mlv-toolbar" role="toolbar" aria-label="Accessible views">
        {(['list', 'table', 'report'] as const).map((item) => (
          <button key={item} type="button" className="mlv-chip" aria-pressed={mode === item} onClick={() => setMode(item)}>
            {item}
          </button>
        ))}
      </div>
      <p className="mlv-kicker">Active layer: {layer}. One campus/network layer at a time. Heavy RF stays backend-side.</p>

      {layer === 'Campus' && (
        <article>
          <h2>{campus.name}</h2>
          <p>{design.campus_identity}</p>
          <p className="mlv-kicker">Zones link to existing Campus V2 IDs. No second room catalog.</p>
          <ul className="mlv-room-grid">
            {design.document.zones.map((zone) => (
              <li key={zone.campus_requirement_id}>
                <article>
                  <h3>{zone.campus_requirement_id}</h3>
                  <p className="mlv-kicker">{zone.digital_route}</p>
                  <p>{zone.kind} · {zone.service_intent_template} · {zone.geometry_fidelity}</p>
                </article>
              </li>
            ))}
          </ul>
        </article>
      )}

      {(layer === 'Infrastructure' || layer === 'Edge Compute' || layer === 'Connectivity') && (
        <article>
          <h2>Candidate infrastructure</h2>
          <p className="mlv-truth">PLANNING ONLY</p>
          <p>Action: {proposalActionLabel()}. Never apply to a live network.</p>
          <ul className="mlv-room-grid">
            {CANDIDATE_KINDS.map((kind) => (
              <li key={kind.id}>
                <article>
                  <h3>{kind.label}</h3>
                  <p className="mlv-kicker">PLANNING ONLY · {kind.role}</p>
                  <button type="button">{proposalActionLabel()}</button>
                </article>
              </li>
            ))}
          </ul>
          <h3>Current digital proposal nodes</h3>
          {mode === 'table' ? (
            <table>
              <caption>Planning candidates</caption>
              <thead>
                <tr>
                  <th>node</th><th>role</th><th>height</th><th>power</th><th>backhaul</th>
                </tr>
              </thead>
              <tbody>
                {design.document.candidate_infrastructure.map((node) => (
                  <tr key={node.node_id}>
                    <td>{node.node_id}</td>
                    <td>{node.role}</td>
                    <td>{node.height_m_assumption}</td>
                    <td>{node.power_dbm_bound}</td>
                    <td>{node.backhaul}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="mlv-room-grid">
              {design.document.candidate_infrastructure.map((node) => (
                <li key={node.node_id}>
                  <article>
                    <h3>{node.node_id}</h3>
                    <p>{node.role} · {node.orientation_assumption} · {node.band_profile}</p>
                    <p className="mlv-kicker">PLANNING ONLY</p>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </article>
      )}

      {(layer === 'Coverage' || layer === 'Capacity') && (
        <article>
          <h2>Service-intent planning assumptions</h2>
          <p className="mlv-kicker">Editable planning assumptions. Not measured traffic. Not learner records.</p>
          <div className="mlv-toolbar" role="listbox" aria-label="Planning templates">
            {SERVICE_INTENT_TEMPLATES.map((item) => (
              <button key={item.id} type="button" className="mlv-chip" aria-pressed={item.id === intentId} onClick={() => setIntentId(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {selectedIntent && (
            <ul>
              <li>latency target: {selectedIntent.latency_ms} ms</li>
              <li>jitter target: {selectedIntent.jitter_ms} ms</li>
              <li>packet-loss target: {selectedIntent.packet_loss_pct}%</li>
              <li>throughput target: {selectedIntent.throughput_mbps} Mbps</li>
              <li>reliability target: {selectedIntent.reliability}</li>
              <li>continuity class: {selectedIntent.continuity_class}</li>
              <li>compute: {selectedIntent.compute}</li>
              <li>privacy class: {selectedIntent.privacy_class}</li>
              <li>priority class: {selectedIntent.priority_class}</li>
              <li>assumption provenance: {selectedIntent.provenance}</li>
              <li>uncertainty: {selectedIntent.uncertainty}</li>
            </ul>
          )}
          <h3>Material / RF assumptions</h3>
          <div className="mlv-toolbar">
            {MATERIAL_ASSUMPTIONS.map((item) => (
              <button key={item.id} type="button" className="mlv-chip" aria-pressed={item.id === materialId} onClick={() => setMaterialId(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {selectedMaterial && (
            <p>
              {selectedMaterial.label} · {selectedMaterial.profile} · {selectedMaterial.model} · {selectedMaterial.provenance} · {selectedMaterial.evidence_class} · uncertainty {selectedMaterial.uncertainty}
              {' '}<span className="mlv-truth">ASSUMPTION</span>
            </p>
          )}
        </article>
      )}

      {(layer === 'Predicted vs Measured' || layer === 'Evidence Confidence') && (
        <article>
          <h2>Predicted vs measured</h2>
          <p>{predictedMeasuredLabel('SIMULATED')}</p>
          <p>{optimization.label}</p>
          <h3>Evidence legend</h3>
          <ul>
            {EVIDENCE_CLASSES.map((item) => (
              <li key={item}>{item}{item === 'SIMULATED' ? ' — current Phase-1 loop' : ''}</li>
            ))}
          </ul>
        </article>
      )}

      {(layer === 'Resilience' || layer === 'Failure Scenario') && (
        <article>
          <h2>{layer}</h2>
          <p>{design.campus_identity}</p>
          <p className="mlv-kicker">
            {campusSlug === 'gaza'
              ? 'Abstract zones only. No public infrastructure vulnerability map. No disaster branding.'
              : campusSlug === 'graham-land'
                ? 'Remote-first simulation / open-data / partner-reference. No fake WAIKE Antarctic station. No physical-control claim.'
                : 'Editable planning templates. Not demographic claims or field measurements.'}
          </p>
        </article>
      )}

      <article>
        <h2>Pareto comparison</h2>
        <p>Raw metrics from the backend optimization contract. No unexplained AI score.</p>
        {optimization.document?.alternatives?.map((alt: OptimizationAlt) => (
          <article key={alt.alternative_id}>
            <h3>{alt.label} · {descriptiveGrouping(alt)}</h3>
            {mode === 'table' ? (
              <table>
                <tbody>
                  {OBJECTIVE_FIELDS.map((field) => (
                    <tr key={field}><th>{field}</th><td>{String(alt.objectives[field])}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ul>
                {OBJECTIVE_FIELDS.map((field) => (
                  <li key={field}>{field}: {String(alt.objectives[field])}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </article>

      <article>
        <h2>Recommendation inbox</h2>
        {optimization.recommendations.map((rec: Recommendation) => (
          <article key={rec.recommended_action}>
            <h3>{rec.recommended_action}</h3>
            <p>{rec.reason}</p>
            <p className="mlv-kicker">{rec.constraints} · {rec.evidence_source}</p>
            <div className="mlv-toolbar">
              {rec.allowed_actions.map((action: string) => (
                <button key={action} type="button" className="mlv-chip">{action}</button>
              ))}
            </div>
          </article>
        ))}
      </article>

      <article>
        <h2>RIC operations surface</h2>
        <div className="mlv-toolbar">
          {RIC_ALLOWED_STATES.map((state) => (
            <button key={state} type="button" className="mlv-chip" aria-pressed={ric === state} onClick={() => setRic(state)}>
              {state}
            </button>
          ))}
          {RIC_DISABLED_STATES.map((state) => (
            <button key={state} type="button" className="mlv-chip" disabled>
              {state} (disabled)
            </button>
          ))}
        </div>
        <p>Current: {ricState.state}. REAL_ACTUATION_ENABLED=false. No browser RAN credentials.</p>
      </article>

      <article>
        <h2>Digital shadow lineage</h2>
        <ol>
          {DIGITAL_SHADOW_TIMELINE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p className="mlv-kicker">
          input design {optimization.document?.input_design_hash} · source {design.document.source_manifest_sha256} · evidence {design.document.evidence_class}
        </p>
      </article>

      {mode === 'report' && (
        <article>
          <h2>Room / zone report</h2>
          <p>{campus.name} · {design.document.phase} · {design.document.geometry_fidelity}</p>
          <ul>
            {design.document.zones.map((zone) => (
              <li key={zone.campus_requirement_id}>
                {zone.campus_requirement_id} — {zone.digital_object} — {zone.digital_route}
              </li>
            ))}
          </ul>
        </article>
      )}
    </section>
  );
}

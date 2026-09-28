import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import { EXAMPLE_REQUIREMENT_IDS } from '../packages/shared/src/campus/catalog.js';
import { exportAllCampusDesignBundles } from '../packages/shared/src/networkTwin/designExport.js';
import { evaluateNetworkTwinGates } from '../packages/shared/src/networkTwin/gates.js';
import { BACKEND_PINS, SOURCE_MANIFEST_SHA256, WAIKE_PIN } from '../packages/shared/src/networkTwin/pins.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'artifacts/campus/network_twin');
mkdirSync(outDir, { recursive: true });

const designs = exportAllCampusDesignBundles();
const gates = evaluateNetworkTwinGates();
const contractHashes = JSON.parse(readFileSync(join(root, 'data/network_twin/PINNED_CONTRACT_HASHES.json'), 'utf8'));

const requirements = [
  'NT-01 Network Twin Lab inside Campus navigation',
  'NT-02 Contract-valid campus_design_bundle producer for 7 campuses',
  'NT-03 Consume campus_optimization_result fixtures without opaque AI score',
  'NT-04 Planning-only candidate infrastructure',
  'NT-05 Predicted vs measured honesty',
  'NT-06 No browser actuation / no RIC secrets',
  'NT-07 WAIKE PR25 consumer-summary without shadow LMS',
  'NT-08 No learner records in network optimization',
  'NT-09 Gaza abstract zones / Graham no fake station',
  'NT-10 Separate from the 473 campus source requirements',
];

const traceability = {
  schema_version: '1.0.0',
  separate_from_473_source_requirements: true,
  source_manifest_sha256: SOURCE_MANIFEST_SHA256,
  example_campus_v2_ids: [...EXAMPLE_REQUIREMENT_IDS],
  backend_pins: BACKEND_PINS,
  waike_pin: WAIKE_PIN,
  rows: requirements.map((requirement, index) => ({
    requirement_id: `NT-${String(index + 1).padStart(2, '0')}`,
    requirement,
    digital_route: '#/mlv/campus/network-twin',
    evidence: 'SIMULATED',
  })),
};

writeFileSync(join(outDir, '7GC_AIRAN_NETWORK_TWIN_GATES.json'), `${JSON.stringify(gates, null, 2)}\n`);
writeFileSync(join(outDir, '7GC_AIRAN_NETWORK_REQUIREMENT_TRACEABILITY.json'), `${JSON.stringify(traceability, null, 2)}\n`);
writeFileSync(
  join(outDir, '7GC_AIRAN_NETWORK_DESIGN_EXPORTS.json'),
  `${JSON.stringify({
    CAMPUS_DESIGN_EXPORT_SCHEMA_PASS: designs.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS,
    bundles: designs.results.map((item) => item.document),
  }, null, 2)}\n`,
);
writeFileSync(
  join(outDir, 'CONTRACT_PIN_PROOF.json'),
  `${JSON.stringify({
    field_kit_pr120: BACKEND_PINS.field_kit.head,
    source_manifest_sha256: SOURCE_MANIFEST_SHA256,
    contract_hashes: contractHashes,
    design_export_sha256: createHash('sha256').update(JSON.stringify(designs.results.map((r) => r.document))).digest('hex'),
  }, null, 2)}\n`,
);

console.log(`Network Twin artifacts written to ${outDir}`);
console.log(designs.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS, gates.OPTIMIZATION_FIXTURE_CONSUMER_PASS);

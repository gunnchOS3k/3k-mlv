import { consumeWaikeContract, emptyWaikeContract } from '../campus/waikeContract.js';
import { WAIKE_PIN } from './pins.js';

export const WAIKE_DEEP_LINKS = Object.freeze([
  'waike://home',
  'waike://course/<section_id>',
  'waike://module/<module_or_instance_id>',
  'waike://lesson/<lesson_id>',
  'waike://assignment/<assignment_id>',
  'waike://quiz/<quiz_id>',
  'waike://lab/<lab_id>',
  'waike://grades',
  'waike://calendar',
  'waike://study/<content_id>',
  'waike://portfolio',
]);

export const WAIKE_FORBIDDEN_FIELDS = Object.freeze([
  'answer_keys',
  'instructor_only_materials',
  'other_learners',
  'unauthorized_grade_details',
  'tokens_or_passwords',
  'unrestricted_hub_apis',
]);

export function waikeReadinessTruth() {
  return {
    imported: WAIKE_PIN.imported,
    ready: WAIKE_PIN.ready,
    partial: WAIKE_PIN.partial,
    partial_ids: [...WAIKE_PIN.partial_ids],
    claim_18_of_18_fully_ready: false,
    WAIKE_READINESS_16_2_TRUTH_PASS: WAIKE_PIN.ready === 16 && WAIKE_PIN.partial === 2,
  };
}

export function demoConsumerSummary() {
  return {
    mode: 'FIXTURE / DEMO',
    endpoint: WAIKE_PIN.consumer_summary_endpoint,
    display_name: 'Local demo learner',
    continue_learning: { title: 'Continue Learning', available: true, fabricated_progress: false },
    due_soon: { count: 0, items: [] },
    courses: [],
    recent_feedback_count: 0,
    upcoming_count: 0,
    label: 'WAIKE backend unavailable. Contract-valid user-scoped fixture. Not academic progress.',
  };
}

export function consumeWaikeMlvContract(adapter, summary) {
  const surfaces = consumeWaikeContract(adapter);
  const forbidden = WAIKE_FORBIDDEN_FIELDS.filter((key) => summary && summary[key] != null);
  const readiness = waikeReadinessTruth();
  return {
    ...surfaces,
    pin: WAIKE_PIN,
    deep_links: [...WAIKE_DEEP_LINKS],
    consumer_summary: summary || demoConsumerSummary(),
    readiness,
    WAIKE_PR25_PIN_PASS: WAIKE_PIN.head === 'f0176c2c45c1c366ad22f46407e6c55c3c5f3e8e',
    WAIKE_CONSUMER_SUMMARY_CONTRACT_PASS: !forbidden.length,
    WAIKE_DEEPLINK_PASS: WAIKE_DEEP_LINKS.every((link) => link.startsWith('waike://')),
    WAIKE_READINESS_16_2_TRUTH_PASS: readiness.WAIKE_READINESS_16_2_TRUTH_PASS,
    NO_SHADOW_LMS_PASS: surfaces.bound === false || (summary && summary.fabricated_progress !== true),
    forbidden_exposed: forbidden,
  };
}

export function unboundWaikeCampus() {
  return consumeWaikeMlvContract(null, demoConsumerSummary());
}

export { emptyWaikeContract };

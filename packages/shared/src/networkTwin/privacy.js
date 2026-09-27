import {
  campusPresenceDoesNotExposeHomePrivate,
  galleryPublicOnly,
  gazaSensitiveLocationSuppressed,
  studyRoomAclAllows,
} from '../campus/privacy.js';
import { VISIBILITY } from '../privacyPolicy.js';

const LEARNER_KEYS = [
  'grade', 'grades', 'assignment', 'assignments', 'mastery', 'learner_history',
  'student_id', 'answer_key', 'other_learners',
];

export function networkOptimizationHasNoLearnerRecords(payload) {
  const raw = JSON.stringify(payload ?? {});
  const hit = LEARNER_KEYS.find((key) => new RegExp(`"${key}"\\s*:`, 'i').test(raw));
  return {
    NO_WAIKE_LEARNER_RECORDS_IN_NETWORK_OPTIMIZATION_PASS: !hit,
    reason: hit || null,
  };
}

export function noPersonPath(payload) {
  const raw = JSON.stringify(payload ?? {});
  const personTrue = /"contains_person_path"\s*:\s*true/.test(raw);
  const trajectory = /"trajectory"\s*:/.test(raw);
  const minor = /"exact_minor_location"\s*:\s*true/.test(raw) || /"minor_location"\s*:\s*"/.test(raw);
  return {
    NO_PERSON_PATH_PASS: !personTrue && !trajectory,
    NO_PRECISE_MINOR_LOCATION_PASS: !minor,
    reason: personTrue ? 'person_path' : trajectory ? 'trajectory' : minor ? 'minor_location' : null,
  };
}

export function noRawContentInspection(payload) {
  const raw = JSON.stringify(payload ?? {});
  return {
    NO_RAW_CONTENT_INSPECTION_PASS: !/packet_payload|deep_packet|raw_content|http_body/i.test(raw),
  };
}

export function noNetworkRoleHomeEscalation({ actorRole, homeNodes }) {
  const privileged = actorRole === 'planner' || actorRole === 'research';
  const leaked = privileged
    ? (homeNodes || []).filter((n) => n.visibility === VISIBILITY.PRIVATE)
    : [];
  return {
    NO_NETWORK_ROLE_HOME_ESCALATION_PASS: leaked.length === 0,
    HOME_PRIVATE_ISOLATION_PASS: leaked.length === 0,
  };
}

export function evaluateNetworkTwinPrivacy({
  homeNodes = [],
  campusVisibleNodes = [],
  galleryNodes = [],
  actor,
  studyRoom,
  gazaPayload,
  optimizationPayload,
  designPayload,
  actorRole = 'learner',
} = {}) {
  const home = campusPresenceDoesNotExposeHomePrivate({ homeNodes, campusVisibleNodes, actor });
  const gallery = galleryPublicOnly(galleryNodes);
  const study = studyRoom ? studyRoomAclAllows({ room: studyRoom, actor }) : true;
  const gaza = gazaSensitiveLocationSuppressed(gazaPayload || { campus: 'gaza', notes: 'recovery network' });
  const learner = networkOptimizationHasNoLearnerRecords(optimizationPayload || designPayload || {});
  const path = noPersonPath(designPayload || {});
  const inspect = noRawContentInspection(designPayload || {});
  const homeEsc = noNetworkRoleHomeEscalation({ actorRole, homeNodes });
  return {
    HOME_PRIVATE_ISOLATION_PASS: home.pass,
    GALLERY_PUBLIC_ONLY_PASS: gallery.every((n) => n.visibility === VISIBILITY.PUBLIC),
    STUDY_ROOM_ACL_PASS: studyRoom ? study === (actor?.id === studyRoom.owner_id || (studyRoom.acl || []).includes(actor?.id)) : true,
    NO_NETWORK_ROLE_HOME_ESCALATION_PASS: homeEsc.NO_NETWORK_ROLE_HOME_ESCALATION_PASS,
    NO_PERSON_PATH_PASS: path.NO_PERSON_PATH_PASS,
    NO_PRECISE_MINOR_LOCATION_PASS: path.NO_PRECISE_MINOR_LOCATION_PASS,
    NO_RAW_CONTENT_INSPECTION_PASS: inspect.NO_RAW_CONTENT_INSPECTION_PASS,
    NO_WAIKE_LEARNER_RECORDS_IN_NETWORK_OPTIMIZATION_PASS: learner.NO_WAIKE_LEARNER_RECORDS_IN_NETWORK_OPTIMIZATION_PASS,
    GAZA_SENSITIVE_LOCATION_REDACTION_PASS: gaza.pass,
  };
}

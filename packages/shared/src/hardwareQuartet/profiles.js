/** Hardware Quartet world profiles for 3k MLV (digital). Authority: hardware-industrial-design exports. */

export const HARDWARE_QUARTET_PROFILES = Object.freeze([
  {
    device_id: 'student_14_5',
    display_name: 'Student 14.5',
    profiles: [
      {
        profile_id: 'HOME_DESK',
        role: 'sustained_desk_learning_work',
        privacy: { prior_user_isolation: true, shared_session_wipe: false },
      },
      {
        profile_id: 'SHARED_LAB',
        role: 'shared_computer_lab',
        privacy: { prior_user_isolation: true, shared_session_wipe: true },
      },
    ],
  },
  {
    device_id: 'handheld_hybrid',
    display_name: 'Handheld Hybrid',
    profiles: [
      {
        profile_id: 'PORTABLE',
        role: 'mobile_compute',
        continuity: { preserve_route_on_undock: true },
      },
      {
        profile_id: 'DOCKED_EXTERNAL_DISPLAY',
        role: 'docked_external_display',
        continuity: { preserve_route_on_dock: true },
        claim_boundary: 'No any-TV claim; use display capability matrix.',
      },
    ],
  },
  {
    device_id: 'ds_xl_coder',
    display_name: 'DS-XL Coder',
    profiles: [
      {
        profile_id: 'DUAL_SCREEN_MOBILE',
        role: 'dual_screen_learn_build_test_deploy',
        second_screen_roles: ['reference', 'notes', 'tools', 'terminal_log', 'preview', 'communications_media'],
      },
    ],
  },
  {
    device_id: 'edge_io_rings',
    display_name: 'Edge I/O Rings',
    profiles: [
      {
        profile_id: 'SPATIAL_INPUT',
        role: 'authenticated_spatial_surface_input',
        physical_pass: false,
      },
      {
        profile_id: 'SPATIAL_PERIPHERAL_TARGET',
        role: 'future_calibrated_spatial_peripheral',
        digital_contract_only: true,
        physical_disconnected_keyboard_pass: false,
      },
    ],
  },
]);

export const DOCK_SUPPORTING_CONTINUITY = Object.freeze({
  is_device_class: false,
  role: 'supporting_continuity_hardware',
  note: 'Dock is not a fifth Quartet device class.',
});

export function listRequiredDigitalProfiles() {
  return HARDWARE_QUARTET_PROFILES.flatMap((d) =>
    d.profiles.map((p) => `${d.device_id}.${p.profile_id}`),
  );
}

export function evaluateHardwareQuartetDigitalGates() {
  const required = [
    'student_14_5.HOME_DESK',
    'student_14_5.SHARED_LAB',
    'handheld_hybrid.PORTABLE',
    'handheld_hybrid.DOCKED_EXTERNAL_DISPLAY',
    'ds_xl_coder.DUAL_SCREEN_MOBILE',
    'edge_io_rings.SPATIAL_INPUT',
    'edge_io_rings.SPATIAL_PERIPHERAL_TARGET',
  ];
  const present = new Set(listRequiredDigitalProfiles());
  const missing = required.filter((id) => !present.has(id));
  return {
    STUDENT_14_5_HOME_PROFILE_PASS: present.has('student_14_5.HOME_DESK'),
    STUDENT_14_5_LAB_PROFILE_PASS: present.has('student_14_5.SHARED_LAB'),
    HANDHELD_PORTABLE_PROFILE_PASS: present.has('handheld_hybrid.PORTABLE'),
    HANDHELD_DOCKED_PROFILE_PASS: present.has('handheld_hybrid.DOCKED_EXTERNAL_DISPLAY'),
    DS_XL_DUAL_SCREEN_PROFILE_PASS: present.has('ds_xl_coder.DUAL_SCREEN_MOBILE'),
    RINGS_SPATIAL_PERIPHERAL_DIGITAL_CONTRACT_PASS: present.has('edge_io_rings.SPATIAL_PERIPHERAL_TARGET'),
    missing,
  };
}

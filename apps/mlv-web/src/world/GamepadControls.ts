export type PadAxes = { moveX: number; moveY: number; lookX: number; lookY: number; interact: boolean; back: boolean };

export type PadButtonEdges = { interactPressed: boolean; backPressed: boolean };

export function applyDeadzone(value: number, deadzone = 0.14): number {
  if (!Number.isFinite(value) || Math.abs(value) < deadzone) return 0;
  const scaled = (Math.abs(value) - deadzone) / (1 - deadzone);
  return Math.sign(value) * Math.min(1, scaled);
}

export function gamepadButtonEdges(previous: PadAxes | null, current: PadAxes | null): PadButtonEdges {
  return {
    interactPressed: current?.interact === true && previous?.interact !== true,
    backPressed: current?.back === true && previous?.back !== true,
  };
}

export function readGamepad(index = 0): PadAxes | null {
  const pads = typeof navigator !== 'undefined' ? navigator.getGamepads?.() : null;
  const pad = pads?.[index];
  if (!pad) return null;
  return {
    moveX: applyDeadzone(pad.axes[0] || 0),
    moveY: applyDeadzone(pad.axes[1] || 0),
    lookX: applyDeadzone(pad.axes[2] || 0),
    lookY: applyDeadzone(pad.axes[3] || 0),
    interact: !!(pad.buttons[0]?.pressed),
    back: !!(pad.buttons[1]?.pressed),
  };
}

export type PadAxes = { moveX: number; moveY: number; lookX: number; lookY: number; interact: boolean; back: boolean };

export function readGamepad(index = 0): PadAxes | null {
  const pads = typeof navigator !== 'undefined' ? navigator.getGamepads?.() : null;
  const pad = pads?.[index];
  if (!pad) return null;
  return {
    moveX: pad.axes[0] || 0,
    moveY: pad.axes[1] || 0,
    lookX: pad.axes[2] || 0,
    lookY: pad.axes[3] || 0,
    interact: !!(pad.buttons[0]?.pressed),
    back: !!(pad.buttons[1]?.pressed),
  };
}

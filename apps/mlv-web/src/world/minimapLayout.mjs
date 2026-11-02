/**
 * Top-down plan derived from the same authored props, portals, and
 * interactables the 3D runtime renders. World X maps to SVG x, world Z to SVG y.
 */

/**
 * @typedef {{ id: string, kind: string, color: string, program: boolean, label?: string,
 *   x: number, y: number, w: number, h: number, cx: number, cy: number, rotationY: number }} MinimapShape
 * @typedef {{ id: string, label: string, cx: number, cy: number }} MinimapMarker
 * @typedef {{ viewBox: number[], shapes: MinimapShape[], program: MinimapShape[],
 *   portals: MinimapMarker[], interactables: MinimapMarker[] }} MinimapLayout
 */

const FOOTPRINT_KINDS = new Set(['wall', 'furniture', 'fixture', 'column', 'landmark', 'stair', 'art', 'planting', 'door']);

function footprint(prop) {
  const [x, , z] = prop.position;
  const [w, , d] = prop.size;
  return { x: x - w / 2, y: z - d / 2, w, h: d, cx: x, cy: z, rotationY: prop.rotationY || 0 };
}

/**
 * @param {import('./types').WorldDefinition} def
 * @returns {MinimapLayout}
 */
export function sceneMinimap(def, pad = 0.6) {
  const grounds = def.props.filter((prop) => prop.kind === 'ground');
  const basis = grounds.length ? grounds : def.props;
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const prop of basis) {
    const f = footprint(prop);
    minX = Math.min(minX, f.x); minY = Math.min(minY, f.y);
    maxX = Math.max(maxX, f.x + f.w); maxY = Math.max(maxY, f.y + f.h);
  }
  for (const [x, , z] of [def.spawn, ...def.portals.map((p) => p.position), ...def.interactables.map((i) => i.position)]) {
    minX = Math.min(minX, x); minY = Math.min(minY, z);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, z);
  }
  const viewBox = [minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2];

  const shapes = def.props
    .filter((prop) => FOOTPRINT_KINDS.has(prop.kind))
    .map((prop) => ({ id: prop.id, kind: prop.kind, color: prop.color, program: Boolean(prop.label), label: prop.label, ...footprint(prop) }));

  const program = shapes.filter((shape) => shape.program);
  const portals = def.portals.map((portal) => ({ id: portal.id, label: portal.label, cx: portal.position[0], cy: portal.position[2] }));
  const interactables = def.interactables.map((item) => ({ id: item.id, label: item.label, cx: item.position[0], cy: item.position[2] }));
  return { viewBox, shapes, program, portals, interactables };
}

export function minimapAvatar(position, yaw, length = 0.9) {
  return {
    cx: position[0],
    cy: position[2],
    hx: position[0] + Math.sin(yaw) * length,
    hy: position[2] + Math.cos(yaw) * length,
  };
}

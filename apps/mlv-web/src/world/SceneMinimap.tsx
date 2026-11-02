import { useMemo } from 'react';
import { minimapAvatar, sceneMinimap } from './minimapLayout.mjs';
import type { WorldDefinition } from './types';

type Props = {
  def: WorldDefinition;
  position: [number, number, number];
  facing: number;
  variant: 'inset' | 'plan';
};

export default function SceneMinimap({ def, position, facing, variant }: Props) {
  const layout = useMemo(() => sceneMinimap(def), [def]);
  const avatar = minimapAvatar(position, facing);
  const [vx, vy, vw, vh] = layout.viewBox;
  const unit = Math.max(vw, vh) / 60;
  const plan = variant === 'plan';
  const svg = (
    <svg
      viewBox={layout.viewBox.join(' ')}
      role={plan ? 'img' : undefined}
      aria-hidden={plan ? undefined : true}
      aria-label={plan ? `${def.title} top-down plan` : undefined}
      data-minimap={variant}
      style={plan
        ? { width: '100%', maxHeight: 360, background: '#0c0a09', borderRadius: 8 }
        : { position: 'absolute', top: 8, right: 8, width: 168, height: 168 * (vh / vw), background: 'rgba(12,10,9,0.78)', borderRadius: 8, pointerEvents: 'none' }}
    >
      <rect x={vx} y={vy} width={vw} height={vh} fill="none" stroke="#44403c" strokeWidth={unit * 0.3} />
      {layout.shapes.map((shape) => (
        <rect
          key={shape.id}
          data-program-fixture={shape.program ? shape.label : undefined}
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          fill={shape.program ? '#fbbf24' : shape.kind === 'wall' ? '#78716c' : '#57534e'}
          opacity={shape.program ? 0.95 : 0.8}
          transform={shape.rotationY ? `rotate(${(-shape.rotationY * 180) / Math.PI} ${shape.cx} ${shape.cy})` : undefined}
        >
          {shape.label && <title>{shape.label}</title>}
        </rect>
      ))}
      {layout.portals.map((portal) => (
        <circle key={portal.id} cx={portal.cx} cy={portal.cy} r={unit * 1.4} fill="#38bdf8"><title>{portal.label}</title></circle>
      ))}
      {layout.interactables.map((item) => (
        <circle key={item.id} cx={item.cx} cy={item.cy} r={unit * 0.8} fill="#a7f3d0"><title>{item.label}</title></circle>
      ))}
      {plan && layout.program.map((shape) => (
        <text key={`${shape.id}-label`} x={shape.cx} y={shape.cy} fontSize={unit * 2.1} fill="#fafaf9" textAnchor="middle" dominantBaseline="middle">
          {shape.label}
        </text>
      ))}
      <line x1={avatar.cx} y1={avatar.cy} x2={avatar.hx} y2={avatar.hy} stroke="#f87171" strokeWidth={unit * 0.6} />
      <circle cx={avatar.cx} cy={avatar.cy} r={unit * 1.2} fill="#f87171" />
    </svg>
  );
  if (!plan) return svg;
  return (
    <figure className="mlv-scene-plan" style={{ margin: '0 0 12px' }}>
      {svg}
      <figcaption className="mlv-kicker">
        Top-down plan from authored scene props · amber: room program · blue: routes · green: actions · red: you.
        {layout.program.length > 0 && ` Room program: ${layout.program.map((shape) => shape.label).join(', ')}.`}
      </figcaption>
    </figure>
  );
}

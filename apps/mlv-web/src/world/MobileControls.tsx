import type { CSSProperties } from 'react';

type Props = {
  onMove: (x: number, y: number) => void;
  onLook: (x: number, y: number) => void;
  onInteract: () => void;
  onBack: () => void;
};

const wrap: CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
};
const stickBase: CSSProperties = {
  position: 'absolute', width: 96, height: 96, borderRadius: 48,
  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
  pointerEvents: 'auto', touchAction: 'none',
};
const btn: CSSProperties = {
  position: 'absolute', right: 24, width: 64, height: 64, borderRadius: 32,
  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
  color: '#fff', pointerEvents: 'auto', fontWeight: 600,
};

export default function MobileControls({ onMove, onLook, onInteract, onBack }: Props) {
  return (
    <div style={wrap} aria-label="Touch world controls">
      <div
        style={{ ...stickBase, left: 24, bottom: 24 }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          onMove(((t.clientX - r.left) / r.width) * 2 - 1, ((t.clientY - r.top) / r.height) * 2 - 1);
        }}
        onTouchEnd={() => onMove(0, 0)}
      />
      <div
        style={{ ...stickBase, right: 120, bottom: 24 }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          onLook(((t.clientX - r.left) / r.width) * 2 - 1, ((t.clientY - r.top) / r.height) * 2 - 1);
        }}
        onTouchEnd={() => onLook(0, 0)}
      />
      <button type="button" style={{ ...btn, bottom: 110 }} onClick={onInteract}>INTERACT</button>
      <button type="button" style={{ ...btn, bottom: 24 }} onClick={onBack}>BACK</button>
    </div>
  );
}

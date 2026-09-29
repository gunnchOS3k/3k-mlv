type Props = { label?: string; active?: boolean };
export default function TransitionManager({ label, active }: Props) {
  if (!active) return null;
  return (
    <div role="status" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 8, display: 'grid', placeItems: 'center', color: '#fff' }}>
      {label || 'Entering…'}
    </div>
  );
}

type Props = { verb: string; label: string; visible: boolean };

export default function InteractionPrompt({ verb, label, visible }: Props) {
  if (!visible) return null;
  return (
    <div
      role="status"
      style={{
        position: 'absolute', left: '50%', bottom: 28, transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.72)', color: '#fff', padding: '10px 16px', borderRadius: 8,
        zIndex: 6, fontSize: 14,
      }}
    >
      <strong>{verb}</strong> — {label}
    </div>
  );
}

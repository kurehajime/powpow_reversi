type Props = {
  visible: boolean
  onClick: () => void
}

export default function ReplayOverlay({ visible, onClick }: Props) {
  if (!visible) return null
  return (
    <div
      onClick={onClick}
      style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
      title="クリックで新規ゲーム"
    >
      {/* tint layer (blend separately) */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(80, 160, 255, 0.15)', mixBlendMode: 'multiply' }} />
      {/* blink keyframes (scoped) */}
      <style>{`
        @keyframes replay-blink { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
      `}</style>
      {/* play icon layer (no blending) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          color: 'rgba(255,255,255,0.98)',
          fontWeight: 900,
          fontFamily: '"Rubik Mono One", system-ui, sans-serif',
          fontSize: 'clamp(40px, 10vmin, 110px)',
          letterSpacing: 2,
          textShadow: '0 2px 0 rgba(0,0,0,0.45), 0 0 10px rgba(255,255,255,0.95)',
          animation: 'replay-blink 1.2s ease-in-out infinite',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        ▶
      </div>
    </div>
  )
}

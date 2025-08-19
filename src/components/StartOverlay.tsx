type Props = {
  visible: boolean
  onStart: () => void
}

export default function StartOverlay({ visible, onStart }: Props) {
  if (!visible) return null
  return (
    <div
      onClick={onStart}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 16px', cursor: 'pointer' }}
    >
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.72)', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '16px 20px', maxWidth: 420, fontWeight: 700, pointerEvents: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>【ルール】</div>
        <div style={{ fontSize: 18, lineHeight: 1.6, textAlign: 'left' }}>
          ① ひっくり返すたびに点数2倍<br />
          ② 1000点以上取ったら勝ち
        </div>
      </div>
    </div>
  )
}


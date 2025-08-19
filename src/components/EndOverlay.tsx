type Props = {
  visible: boolean
  resultText: string
  titleColor: string
  newGameButtonColor: string
  onBackdropNewGame: () => void
  onNewGame: () => void
  onReplay: () => void
}

export default function EndOverlay({ visible, resultText, titleColor, newGameButtonColor, onBackdropNewGame, onNewGame, onReplay }: Props) {
  if (!visible) return null
  return (
    <div
      onClick={onBackdropNewGame}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: titleColor,
          letterSpacing: 2,
          fontFamily: '"Rubik Mono One", system-ui, sans-serif'
        }}>
          {resultText}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-pulse"
            onClick={onNewGame}
            style={{
              fontSize: 20,
              fontWeight: 900,
              padding: '12px 20px',
              borderRadius: 14,
              backgroundColor: newGameButtonColor,
              color: '#fff',
              border: 'none',
              fontFamily: '"Rubik Mono One", system-ui, sans-serif',
              letterSpacing: 1
            }}
          >
            NEW GAME
          </button>
          <button
            onClick={onReplay}
            style={{
              fontSize: 20,
              fontWeight: 900,
              padding: '12px 20px',
              borderRadius: 14,
              backgroundColor: '#1e88e5',
              color: '#fff',
              border: 'none',
              fontFamily: '"Rubik Mono One", system-ui, sans-serif',
              letterSpacing: 1
            }}
          >
            リプレイ
          </button>
        </div>
      </div>
    </div>
  )
}


type Props = {
  visible: boolean
  resultText: string
  titleColor: string
  onBackdropNewGame: () => void
  onNewGame: () => void
  onReplay: () => void
}

export default function EndOverlay({ visible, resultText, titleColor, onBackdropNewGame, onNewGame, onReplay }: Props) {
  if (!visible) return null
  // Colors: NEW GAME = bright purple, Replay = orange, same opacity
  const newGameBg = 'rgba(156, 39, 176, 0.85)' // #9C27B0 @ 0.85
  const replayBg = 'rgba(255, 152, 0, 0.85)'   // #FF9800 @ 0.85
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
              backgroundColor: newGameBg,
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
              backgroundColor: replayBg,
              color: '#fff',
              border: 'none',
              fontFamily: '"Rubik Mono One", system-ui, sans-serif',
              letterSpacing: 1
            }}
          >
            REPLAY
          </button>
        </div>
      </div>
    </div>
  )
}

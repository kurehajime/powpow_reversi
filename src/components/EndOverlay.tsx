type Props = {
  visible: boolean
  resultText: string
  titleColor: string
  onBackdropNewGame: () => void
  onNewGame: () => void
  onReplay: () => void
}

import { useTranslation } from 'react-i18next'
import { hexToRgba } from '../lib/color'

export default function EndOverlay({ visible, resultText, titleColor, onBackdropNewGame, onNewGame, onReplay }: Props) {
  const { t } = useTranslation()
  if (!visible) return null
  // Colors: NEW GAME = orange, REPLAY = bright purple, same opacity
  const newGameBg = 'rgba(255, 152, 0, 0.72)'   // #FF9800 @ 0.72
  const replayBg = 'rgba(156, 39, 176, 0.72)'   // #9C27B0 @ 0.72
  // CSS stroke keeps layout identical while adding thin outline
  const strokeBase = resultText === 'YOU WIN'
    ? '#1976D2'
    : (resultText === 'YOU LOSE' ? '#C62828' : undefined)
  // Make the outline a bit lighter (semi-transparent)
  const strokeColor = strokeBase ? hexToRgba(strokeBase, 0.6) : undefined
  return (
    <div
      onClick={onBackdropNewGame}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(0.5px)',
        WebkitBackdropFilter: 'blur(0.5px)',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: titleColor,
          letterSpacing: 2,
          fontFamily: '"Rubik Mono One", system-ui, sans-serif',
          lineHeight: 1,
          WebkitTextStrokeWidth: strokeColor ? '0.5px' : undefined,
          WebkitTextStrokeColor: strokeColor,
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
          >{t('endOverlay.newGame')}</button>
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
          >{t('endOverlay.replay')}</button>
        </div>
      </div>
    </div>
  )
}

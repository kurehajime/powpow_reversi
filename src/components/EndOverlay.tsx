type Props = {
  visible: boolean
  resultText: string
  titleColor: string
  onBackdropNewGame: () => void
  onNewGame: () => void
  onReplay: () => void
}

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useReward } from 'react-rewards'
import { hexToRgba } from '../lib/color'

export default function EndOverlay({ visible, resultText, titleColor, onBackdropNewGame, onNewGame, onReplay }: Props) {
  const { t } = useTranslation()
  // Colors: NEW GAME = orange, REPLAY = bright purple, same opacity
  const newGameBg = 'rgba(255, 152, 0, 0.72)'   // #FF9800 @ 0.72
  const replayBg = 'rgba(156, 39, 176, 0.72)'   // #9C27B0 @ 0.72
  // CSS stroke keeps layout identical while adding thin outline
  const strokeBase = resultText === 'YOU WIN'
    ? '#1976D2'
    : (resultText === 'YOU LOSE' ? '#C62828' : undefined)
  // Make the outline a bit lighter (semi-transparent)
  const strokeColor = strokeBase ? hexToRgba(strokeBase, 0.6) : undefined

  const isWin = resultText === 'YOU WIN'
  const isLose = resultText === 'YOU LOSE'
  // Effects: win -> confetti, lose -> explosion emoji, draw -> fallback emoji
  const emojiConfig = {
    emoji: ['💥'],
    spread: 80,
    lifetime: 220,
    elementCount: 50,
    startVelocity: 12,
    angle: 90,
    decay: 0.9,
    zIndex: 10,
    position: 'absolute',
  }
  const confettiConfig = {
    spread: 80,
    lifetime: 220,
    elementCount: 120,
    startVelocity: 14,
    angle: 90,
    decay: 0.9,
    zIndex: 10,
    position: 'absolute',
    colors: ['#FFEB3B', '#FF9800', '#E91E63', '#2196F3', '#4CAF50'],
  }
  const { reward: rewardEmoji } = useReward('result-reward-center', 'emoji', emojiConfig)
  const { reward: rewardConfetti } = useReward('result-reward-center', 'confetti', confettiConfig)
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => {
      try {
        if (isWin) rewardConfetti()
        else if (isLose) rewardEmoji()
        else rewardEmoji()
      } catch { /* noop */ }
    }, 30)
    return () => clearTimeout(t)
  }, [visible, resultText])

  if (!visible) return null
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
        overflow: 'hidden',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, position: 'relative' }}>
        {/* Invisible anchor at center for reward effects */}
        <div id="result-reward-center" aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 0, height: 0, pointerEvents: 'none' }} />
        <div
          onClick={(e) => { e.stopPropagation(); onNewGame() }}
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: titleColor,
            letterSpacing: 2,
            fontFamily: '"Rubik Mono One", system-ui, sans-serif',
            lineHeight: 1,
            WebkitTextStrokeWidth: strokeColor ? '0.5px' : undefined,
            WebkitTextStrokeColor: strokeColor,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
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

import { useMemo, useState } from 'react'
import PlayElement from './PlayElement'
import ReplayElement from './ReplayElement'
import { parseLog } from '../lib/replay'
import { getCookie } from '../lib/cookie'
import { clearReplayParams } from '../lib/url'

export default function GameRoot() {
  const sp = useMemo(() => new URLSearchParams(window.location.search), [])
  const isReplay = sp.get('replay') === '1'
  const playerIn = sp.get('player')
  const levelIn = sp.get('level')
  const initialSide = (playerIn === '1' || playerIn === '-1') ? (Number(playerIn) as 1 | -1) : 1
  // For replay mode, honor level from URL only.
  // For normal play, prefer explicit ?level= then fallback to cookie, then default.
  const cookieLevelRaw = getCookie('pow_level')
  const cookieLevel = cookieLevelRaw && /^\d+$/.test(cookieLevelRaw) ? Math.max(0, Math.min(6, Number(cookieLevelRaw))) : null
  const levelFromUrl = levelIn && /^\d+$/.test(levelIn) ? Math.max(0, Math.min(6, Number(levelIn))) : null
  const initialLevel = (isReplay
    ? (levelFromUrl ?? 0)
    : (levelFromUrl ?? cookieLevel ?? 0))
  const moves = parseLog(sp.get('log') ?? '')

  const [mode, setMode] = useState<'play' | 'replay'>(isReplay ? 'replay' : 'play')
  const [playSide, setPlaySide] = useState<1 | -1>(initialSide)
  const [playLevel, setPlayLevel] = useState<number>(initialLevel)

  if (mode === 'replay') {
    return (
      <ReplayElement
        player={initialSide}
        level={initialLevel}
        moves={moves}
        intervalMs={500}
        onExitToNewGame={(side, level) => {
          // URLからリプレイ系パラメータを除去して通常対局へ
          try {
            const url = clearReplayParams(window.location.href)
            window.history.replaceState({}, '', url)
          } catch { /* noop */ }
          setPlaySide(side)
          setPlayLevel(level)
          setMode('play')
        }}
      />
    )
  }

  return (
    <PlayElement initialSide={playSide} initialLevel={playLevel} />
  )
}

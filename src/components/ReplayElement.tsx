import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimer } from 'use-timer'
import GameScaffold from './GameScaffold'
import ReplayOverlay from './ReplayOverlay'
import EndOverlay from './EndOverlay'
import InfoPanelInGame from './panels/InfoPanelInGame'
import InfoPanelEnded from './panels/InfoPanelEnded'
import { Field } from '../model/Field'
import { computeJitterScale } from '../lib/board'
import { hexToRgba } from '../lib/color'
import { resultColorForText, resultTextForField, type ResultText } from '../lib/result'

type Props = {
  moves: number[]
  player: 1 | -1
  level: number
  intervalMs?: number
  onExitToNewGame: (side: 1 | -1, level: number) => void
}

export default function ReplayElement({ moves, player, level, intervalMs = 500, onExitToNewGame }: Props) {
  const { t } = useTranslation()
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState(t('status.replaying'))
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [ended, setEnded] = useState(false)
  const [awaitingResult, setAwaitingResult] = useState(false)
  const [replaying, setReplaying] = useState(true)
  const [humanSide] = useState<1 | -1>(player)
  const [depth] = useState<number>(level)

  const cellSize = 60
  const topPanelHeight = 160
  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const jitterScale = useMemo(() => computeJitterScale(field), [field])
  const resultText = useMemo(() => ended ? resultTextForField(field, humanSide) : '', [ended, field, humanSide])
  const resultColor = useMemo(() => ended ? resultColorForText(resultText as ResultText) : '#000', [ended, resultText])

  const { time: replayTime, start, pause, reset } = useTimer({ interval: intervalMs, autostart: false })
  const movesRef = useRef<number[]>(moves)
  const nextRef = useRef<number>(0)
  const pauseRef = useRef(pause)
  useEffect(() => { pauseRef.current = pause }, [pause])

  // 初期化
  useEffect(() => {
    setField(Field.Initial(8))
    setEnded(false)
    setLastIndex(null)
    setStatus(t('status.replaying'))
    movesRef.current = moves
    nextRef.current = 0
    reset()
    start()
  }, [moves, reset, start, t])

  // 1手ずつ進める
  useEffect(() => {
    if (!replaying) return
    if (nextRef.current >= movesRef.current.length) {
      // リプレイ終了: 即座に結果画面へ
      pauseRef.current()
      setReplaying(false)
      setEnded(true)
      setAwaitingResult(false)
      return
    }
    const idx = movesRef.current[nextRef.current]
    let guard = 0
    // 現在の盤面からパスを考慮して合法手に合わせる
    let cur = field
    while (!cur.CanPlace(idx)) {
      guard++
      if (guard > 2) break
      if (cur.HasAnyMove()) { break }
      const oppHas = cur.HasAnyMoveFor(cur.Turn === 1 ? -1 : 1)
      if (!oppHas) break
      cur = cur.Pass()
    }
    if (cur.CanPlace(idx)) {
      const next = cur.Place(idx)
      setField(next)
      setLastIndex(idx)
    } else {
      // 念のため現在の状態を維持
      setField(cur)
    }
    nextRef.current += 1
  }, [replaying, replayTime])

  const handleExitToNewGame = () => {
    setReplaying(false)
    pauseRef.current()
    onExitToNewGame(humanSide, depth)
  }

  const handleReplayRestart = () => {
    // 同じログでリプレイを最初からやり直す
    setEnded(false)
    setReplaying(true)
    setStatus(t('status.replaying'))
    setLastIndex(null)
    movesRef.current = moves
    nextRef.current = 0
    setField(Field.Initial(8))
    reset()
    start()
  }

  return (
    <GameScaffold
      field={field}
      cellSize={cellSize}
      hints={new Set()}
      hintColor={hintColor}
      lastIndex={lastIndex}
      jitterScale={jitterScale}
      boardOverlays={<>
        <ReplayOverlay visible={replaying} onClick={handleExitToNewGame} />
        <EndOverlay
          visible={ended}
          resultText={resultText}
          titleColor={hexToRgba(resultColor, 0.72)}
          onBackdropNewGame={handleExitToNewGame}
          onNewGame={handleExitToNewGame}
          onReplay={handleReplayRestart}
        />
      </>}
      panel={
        <div className="panel-wrap" style={{ height: topPanelHeight, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
          {ended ? (
            <InfoPanelEnded field={field} level={depth} />
          ) : (
            <InfoPanelInGame field={field} level={depth} awaitingResult={awaitingResult} status={status} />
          )}
        </div>
      }
    />
  )
}

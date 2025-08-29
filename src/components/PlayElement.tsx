import { useEffect, useMemo, useRef, useState } from 'react'
import StartOverlay from './StartOverlay'
import EndOverlay from './EndOverlay'
import StartSettingsPanel from './panels/StartSettingsPanel'
import InfoPanelInGame from './panels/InfoPanelInGame'
import InfoPanelEnded from './panels/InfoPanelEnded'
import { Field } from '../model/Field'
import { thinkAlphaBeta, thinkGreedy, evaluateEasy } from '../ai/AlphaBeta'
import { computeJitterScale } from '../lib/board'
import { hexToRgba } from '../lib/color'
import { resultColorForText, resultTextForField, type ResultText } from '../lib/result'
import { getRecord, updateRecord, type PlayerRecord } from '../lib/stats'
import { buildReplayQuery, buildReplayUrl, clearReplayParams } from '../lib/url'
import GameScaffold from './GameScaffold'
import { setCookie } from '../lib/cookie'
import PanelShare from './PanelShare'
import { useTranslation } from 'react-i18next'

type Props = {
  initialSide?: 1 | -1
  initialLevel?: number
}

export default function PlayElement({ initialSide = 1, initialLevel = 0 }: Props) {
  const { t } = useTranslation()
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState('')
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [awaitingResult, setAwaitingResult] = useState(false)
  const [humanSide, setHumanSide] = useState<1 | -1>(initialSide)
  const [depth, setDepth] = useState<number>(initialLevel)
  const [moveLog, setMoveLog] = useState<number[]>([])
  const [record, setRecord] = useState<PlayerRecord>(() => getRecord())

  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cellSize = 60
  // panel height follows content; no fixed height
  const cpuSide: 1 | -1 = (humanSide === 1 ? -1 : 1)
  const jitterScale = useMemo(() => computeJitterScale(field), [field])

  const resultText = useMemo(() => ended ? resultTextForField(field, humanSide) : '', [ended, field, humanSide])
  const resultColor = useMemo(() => ended ? resultColorForText(resultText as ResultText) : '#000', [ended, resultText])

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearReplayParamsInUrl = () => {
    try {
      const url = clearReplayParams(window.location.href)
      window.history.replaceState({}, '', url)
    } catch { /* noop */ }
  }

  const hints = useMemo(() => {
    const set = new Set<number>()
    const cells = field.Cells
    if (started && !ended && field.Turn === humanSide) {
      for (let i = 0; i < cells.length; i++) {
        if (field.CanPlace(i)) set.add(i)
      }
    }
    return set as ReadonlySet<number>
  }, [field, started, ended, humanSide])

  useEffect(() => {
    if (!started || ended) return
    let endTimer: ReturnType<typeof setTimeout> | null = null
    if (field.IsEndByScore()) {
      const { black, white } = field.Score()
      setStatus(t('status.gameEnd', { black, white }))
      setAwaitingResult(true)
      endTimer = setTimeout(() => { setEnded(true); setAwaitingResult(false) }, 1300)
    } else if (!field.HasAnyMove()) {
      const opp = field.HasAnyMoveFor(field.Turn === 1 ? -1 : 1)
      if (opp) {
        setStatus(t('status.pass'))
        setField(field.Pass())
      } else {
        const { black, white } = field.Score()
        const winner = (black === white)
          ? t('winner.draw')
          : (black > white ? t('winner.black') : t('winner.white'))
        setStatus(t('status.noMovesBoth', { winner, black, white }))
        setAwaitingResult(true)
        endTimer = setTimeout(() => { setEnded(true); setAwaitingResult(false) }, 1300)
      }
    }
    return () => { if (endTimer) clearTimeout(endTimer); setAwaitingResult(false) }
  }, [field, started, ended])

  // Update player record when a game ends
  useEffect(() => {
    if (!ended) return
    const res = resultTextForField(field, humanSide)
    const next = updateRecord(res)
    setRecord(next)
  }, [ended])

  useEffect(() => {
    if (!started || ended || awaitingResult) return
    if (field.IsEndByScore()) return
    if (field.Turn !== cpuSide) return
    if (!field.HasAnyMove()) return
    const useEasyEval = depth <= 3
    const depthForAlphaBeta = useEasyEval ? depth : depth - 2
    const { index } = (depth === 0
      ? thinkGreedy(field, useEasyEval ? evaluateEasy : undefined)
      : thinkAlphaBeta(field, depthForAlphaBeta, undefined, undefined, useEasyEval ? evaluateEasy : undefined))
    if (index != null) {
      const next = field.Place(index)
      if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null }
      aiTimerRef.current = setTimeout(() => {
        setStatus('')
        setLastIndex(index)
        setField(next)
        setMoveLog(log => [...log, index])
        aiTimerRef.current = null
      }, 750)
      return () => { if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null } }
    } else {
      setStatus('')
    }
  }, [field, started, ended, cpuSide, depth, awaitingResult])

  const handleCellClick = (index: number) => {
    if (!started || ended || awaitingResult) return
    if (field.Turn !== humanSide) return
    if (field.IsEndByScore()) return
    const next = field.Place(index)
    if (next !== field) {
      setStatus('')
      setLastIndex(index)
      setField(next)
      setMoveLog(log => [...log, index])
    }
  }

  const handleNewGame = () => {
    setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false); setLastIndex(null); setMoveLog([]); clearReplayParamsInUrl()
  }

  const handleStart = () => {
    // Persist last played level in cookie on actual start
    setCookie('pow_level', String(depth))
    setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true); setLastIndex(null); setMoveLog([]); clearReplayParamsInUrl()
  }

  const handleReplayFromEnd = () => {
    if (moveLog.length === 0) return
    try {
      const target = buildReplayUrl(window.location.href, { player: humanSide, level: depth, log: moveLog })
      if (target === window.location.href) {
        window.location.reload()
      } else {
        window.location.href = target
      }
    } catch {
      const q = buildReplayQuery({ player: humanSide, level: depth, log: moveLog })
      if (window.location.search === q) {
        window.location.reload()
      } else {
        window.location.href = q
      }
    }
  }

  return (
    <GameScaffold
      field={field}
      cellSize={cellSize}
      hints={hints}
      hintColor={hintColor}
      lastIndex={field.LastPlaced ?? lastIndex}
      flippedIndices={new Set(field.LastFlipped)}
      onCellClick={handleCellClick}
      jitterScale={jitterScale}
      boardOverlays={<>
        <StartOverlay visible={!started} onStart={handleStart} />
        <EndOverlay
          visible={ended}
          resultText={resultText}
          titleColor={hexToRgba(resultColor, 0.72)}
          onBackdropNewGame={handleNewGame}
          onNewGame={handleNewGame}
          onReplay={handleReplayFromEnd}
        />
      </>}
      panel={
        <div className="panel-wrap" style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
          {!started ? (
            <StartSettingsPanel
              humanSide={humanSide}
              depth={depth}
              onStart={handleStart}
              onChangeSide={(s) => setHumanSide(s)}
              onChangeDepth={(d) => { setDepth(d); setCookie('pow_level', String(d)) }}
            />
          ) : ended ? (
            <InfoPanelEnded field={field} level={depth} record={record} />
          ) : (
            <InfoPanelInGame field={field} level={depth} awaitingResult={awaitingResult} status={status} record={record} />
          )}
          <PanelShare
            replay={ended && moveLog.length > 0 ? { player: humanSide, level: depth, log: moveLog } : undefined}
            resultKey={ended ? (resultText as 'YOU WIN' | 'YOU LOSE' | 'DRAW') : undefined}
          />
        </div>
      }
    />
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import FieldElement from './FieldElement'
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
import { buildReplayQuery, buildReplayUrl, clearReplayParams } from '../lib/url'

type Props = {
  initialSide?: 1 | -1
  initialLevel?: number
}

export default function PlayElement({ initialSide = 1, initialLevel = 1 }: Props) {
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState('')
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [awaitingResult, setAwaitingResult] = useState(false)
  const [humanSide, setHumanSide] = useState<1 | -1>(initialSide)
  const [depth, setDepth] = useState<number>(initialLevel)
  const [moveLog, setMoveLog] = useState<number[]>([])

  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cellSize = 60
  const topPanelHeight = 160
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
      const winner = field.WinnerByScore()
      setStatus(
        winner === 1
          ? `試合終了: 黒 ${black} - 白 ${white}`
          : winner === -1
            ? `試合終了: 白 ${white} - 黒 ${black}`
            : `試合終了: 黒 ${black} - 白 ${white}`,
      )
      setAwaitingResult(true)
      endTimer = setTimeout(() => { setEnded(true); setAwaitingResult(false) }, 1000)
    } else if (!field.HasAnyMove()) {
      const opp = field.HasAnyMoveFor(field.Turn === 1 ? -1 : 1)
      if (opp) {
        setStatus('パス')
        setField(field.Pass())
      } else {
        const { black, white } = field.Score()
        const winner = black === white ? '引き分け' : (black > white ? '黒勝ち' : '白勝ち')
        setStatus(`双方打てる手がありません（${winner}: 黒 ${black} - 白 ${white}）`)
        setAwaitingResult(true)
        endTimer = setTimeout(() => { setEnded(true); setAwaitingResult(false) }, 1000)
      }
    }
    return () => { if (endTimer) clearTimeout(endTimer); setAwaitingResult(false) }
  }, [field, started, ended])

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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <h1 style={{ margin: 0, paddingTop: 8, fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em', fontFamily: '"Rubik Mono One", system-ui, sans-serif' }}>POW POW REVERSI</h1>
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="distortionFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5;6;7;8;9;10" dur="3s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={jitterScale} />
        </filter>
      </svg>
      <div className="board-wrap">
        <FieldElement
          field={field}
          cellSize={cellSize}
          hints={hints}
          hintColor={hintColor}
          lastIndex={lastIndex}
          onCellClick={handleCellClick}
        />
        <StartOverlay visible={!started} onStart={handleStart} />
        <EndOverlay
          visible={ended}
          resultText={resultText}
          titleColor={hexToRgba(resultColor, 0.85)}
          onBackdropNewGame={handleNewGame}
          onNewGame={handleNewGame}
          onReplay={handleReplayFromEnd}
        />
      </div>
      <div className="panel-wrap" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: '#444' }}>
          【ルール】✅ひっくり返すたびに点数2倍 ✅1000点以上取ったら勝ち
        </div>
      </div>
      <div className="panel-wrap" style={{ height: topPanelHeight, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
        {!started ? (
          <StartSettingsPanel
            humanSide={humanSide}
            depth={depth}
            onStart={handleStart}
            onChangeSide={(s) => setHumanSide(s)}
            onChangeDepth={(d) => setDepth(d)}
          />
        ) : ended ? (
          <InfoPanelEnded field={field} level={depth} />
        ) : (
          <InfoPanelInGame field={field} level={depth} awaitingResult={awaitingResult} status={status} />
        )}
      </div>
    </div>
  )
}

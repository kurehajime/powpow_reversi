import { useEffect, useMemo, useRef, useState } from 'react'
import lv0Img from '../assets/lv0.png'
import lv1Img from '../assets/lv1.png'
import lv2Img from '../assets/lv2.png'
import lv3Img from '../assets/lv3.png'
import lv4Img from '../assets/lv4.png'
import lv5Img from '../assets/lv5.png'
import lv6Img from '../assets/lv6.png'
import { Field } from '../model/Field'
import { useTimer } from 'use-timer'
import FieldElement from './FieldElement'
import { thinkAlphaBeta, thinkGreedy, evaluateEasy } from '../ai/AlphaBeta'
import StartOverlay from './StartOverlay'
import ReplayOverlay from './ReplayOverlay'
import EndOverlay from './EndOverlay'
import StartSettingsPanel from './panels/StartSettingsPanel'
import InfoPanelInGame from './panels/InfoPanelInGame'
import InfoPanelEnded from './panels/InfoPanelEnded'
import { hexToRgba } from '../lib/color'
import { aiLevelLabel } from '../lib/labels'
import { computeJitterScale } from '../lib/board'
import { parseLog } from '../lib/replay'
import { buildReplayUrl, buildReplayQuery, clearReplayParams as clearReplayParamsPure } from '../lib/url'

export default function GameElement() {
  // Phase 2: interactive board with alternating turns
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState<string>('')
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [started, setStarted] = useState<boolean>(false)
  const [ended, setEnded] = useState<boolean>(false)
  // 結果表示までの待機中は入力を無効化する
  const [awaitingResult, setAwaitingResult] = useState<boolean>(false)
  const [humanSide, setHumanSide] = useState<1 | -1>(1) // 1=黒(先手), -1=白(後手)
  const [depth, setDepth] = useState<number>(1)
  // ゲーム中に置いた手（index）のログ（パスは記録しない）
  const [moveLog, setMoveLog] = useState<number[]>([])
  // --- Replay states (Phase 4) ---
  const [replaying, setReplaying] = useState<boolean>(false)
  // URL指定のデフォルト設定（リプレイ終了後の新規ゲームに反映）
  const [presetHumanSide, setPresetHumanSide] = useState<1 | -1 | null>(null)
  const [presetLevel, setPresetLevel] = useState<number | null>(null)
  // use-timer for replay ticks (500ms)
  const {
    time: replayTime,
    start: startReplayTimer,
    pause: pauseReplayTimer,
    reset: resetReplayTimer,
  } = useTimer({ interval: 500, autostart: false })
  // 最新値参照用のref（lint回避と挙動安定化）
  const fieldRef = useRef(field)
  useEffect(() => { fieldRef.current = field }, [field])
  const movesRef = useRef<number[]>([])
  const nextRef = useRef<number>(0)
  const pauseRef = useRef(pauseReplayTimer)
  useEffect(() => { pauseRef.current = pauseReplayTimer }, [pauseReplayTimer])
  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cellSize = 60
  const topPanelHeight = 160
  const cpuSide: 1 | -1 = (humanSide === 1 ? -1 : 1)
  const aiStrengthLabel = useMemo(() => aiLevelLabel(depth), [depth])
  // CPU手の遅延実行タイマー参照（競合時の取りこぼし防止）
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resultText = useMemo(() => {
    if (!ended) return ''
    const { black, white } = field.Score()
    const winner = black === white ? 0 : (black > white ? 1 : -1)
    if (winner === 0) return 'DRAW'
    return winner === humanSide ? 'YOU WIN' : 'YOU LOSE'
  }, [ended, field, humanSide])
  const resultColor = useMemo(() => {
    if (!ended) return '#000'
    // Brighter and more saturated variants
    return resultText === 'YOU WIN' ? '#4FC3F7' // vivid light blue
      : resultText === 'YOU LOSE' ? '#FF5252'  // vivid red
        : '#FFD740'                               // vivid amber (draw)
  }, [ended, resultText])
  // Always show AI side avatar image regardless of turn or result
  const aiImgSrc = useMemo(() => {
    const list = [lv0Img, lv1Img, lv2Img, lv3Img, lv4Img, lv5Img, lv6Img]
    return list[Math.max(0, Math.min(6, depth))]
  }, [depth])
  // avatar rendering moved into panel components

  // URL からリプレイ系パラメータを取り除く（ページ遷移なし）
  const clearReplayParamsInUrl = () => {
    try {
      const newUrl = clearReplayParamsPure(window.location.href)
      window.history.replaceState({}, '', newUrl)
    } catch { /* noop */ }
  }
  const hints = useMemo(() => {
    const set = new Set<number>()
    const cells = field.Cells
    // 人間の手番のみハイライトを出す
    if (started && !ended && !replaying && field.Turn === humanSide) {
      for (let i = 0; i < cells.length; i++) {
        if (field.CanPlace(i)) set.add(i)
      }
    }
    return set as ReadonlySet<number>
  }, [field, started, ended, humanSide, replaying])

  // 手描き風の揺れは SVG の <animate> で実装（JSの更新なし）
  // 揺れ強度はスコアで可変: max(black, white) を ２00 で割って切り上げ、1〜5にクランプ
  const jitterScale = useMemo(() => computeJitterScale(field), [field])

  // auto-pass when no legal moves for current player but opponent has moves
  // 結果画面への遷移は1秒ディレイして演出を持たせる
  useEffect(() => {
    if (!started || ended || replaying) return
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
        // both have no moves -> terminal (delay before showing result)
        const { black, white } = field.Score()
        const winner = black === white ? '引き分け' : (black > white ? '黒勝ち' : '白勝ち')
        setStatus(`双方打てる手がありません（${winner}: 黒 ${black} - 白 ${white}）`)
        setAwaitingResult(true)
        endTimer = setTimeout(() => { setEnded(true); setAwaitingResult(false) }, 1000)
      }
    }
    return () => { if (endTimer) clearTimeout(endTimer); setAwaitingResult(false) }
  }, [field, started, ended, replaying])

  // CPU move on its turn
  useEffect(() => {
    if (!started || ended || awaitingResult || replaying) return
    if (field.IsEndByScore()) return
    if (field.Turn !== cpuSide) return
    if (!field.HasAnyMove()) return
    // 同期で十分。必要ならsetTimeoutで遅延演出可能
    // レベル0〜3は簡易評価（Cellsの総和）を使用して弱めのプレイにする
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
  }, [field, started, ended, cpuSide, depth, awaitingResult, replaying])

  // --- Replay: parse URL parameters on mount ---
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const isReplay = sp.get('replay') === '1'
    if (!isReplay) return
    // 念のため、CPUの保留タイマーを停止
    if (aiTimerRef.current) { clearTimeout(aiTimerRef.current); aiTimerRef.current = null }
    // Parse moves
    const log = sp.get('log')?.trim() ?? ''
    const moves = parseLog(log)
    // Optional presets
    const p = sp.get('player')
    const lv = sp.get('level')
    if (p === '1' || p === '-1') {
      const side = Number(p) as 1 | -1
      setPresetHumanSide(side)
      // リプレイ画面でも表示に反映させるため即時適用
      setHumanSide(side)
    }
    if (lv && /^\d+$/.test(lv)) {
      const d = Math.max(0, Math.min(6, Number(lv)))
      setPresetLevel(d)
      // リプレイ画面のAI表示（アバター/ラベル）に反映
      setDepth(d)
    }

    // Initialize replay
    setReplaying(true)
    // 終了画面の「リプレイ」ボタンで再度使えるよう、moveLog にも保持
    setMoveLog(moves)
    // refsにも反映
    movesRef.current = moves
    nextRef.current = 0
    setStatus('リプレイ中...')
    setField(Field.Initial(8))
    setStarted(true)
    setEnded(false)
    setLastIndex(null)
    // start ticking
    resetReplayTimer()
    startReplayTimer()
  }, [resetReplayTimer, startReplayTimer])

  // --- Replay: advance one move on each timer tick ---
  useEffect(() => {
    if (!replaying) return
    if (nextRef.current >= movesRef.current.length) {
      // リプレイ終了: 通常対局と同様に終了画面へ遷移
      // 先に awaiting を立て、CPU手の発火を確実に抑止
      setAwaitingResult(true)
      pauseRef.current()
      setReplaying(false)
      const t = setTimeout(() => {
        setEnded(true)
        setAwaitingResult(false)
      }, 1000)
      return () => clearTimeout(t)
    }
    // On each tick (replayTime changes), try to apply next move
    const idx = movesRef.current[nextRef.current]
    // If pass is needed, auto-pass until the move becomes legal or game ends
    let guard = 0
    let placed = false
    setField(prev => {
      let cur = prev
      while (!cur.CanPlace(idx)) {
        guard++
        if (guard > 2) break
        if (cur.HasAnyMove()) {
          break
        }
        const oppHas = cur.HasAnyMoveFor(cur.Turn === 1 ? -1 : 1)
        if (!oppHas) break
        cur = cur.Pass()
      }
      if (cur.CanPlace(idx)) {
        placed = true
        return cur.Place(idx)
      }
      return cur
    })
    if (placed) setLastIndex(idx)
    nextRef.current += 1
  }, [replaying, replayTime])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <h1 style={{ margin: 0, paddingTop: 8, fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em', fontFamily: '"Rubik Mono One", system-ui, sans-serif' }}>POW POW REVERSI</h1>

      {/* Hidden SVG filter defs (hand-drawn jitter) */}
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
          onCellClick={(index) => {
            if (!started || ended || awaitingResult || replaying) return
            if (field.Turn !== humanSide) return
            if (field.IsEndByScore()) return
            const next = field.Place(index)
            if (next !== field) {
              setStatus('')
              setLastIndex(index)
              setField(next)
              setMoveLog(log => [...log, index])
            }
          }}
        />
        {/* Replay overlay */}
        <ReplayOverlay
          visible={replaying}
          onClick={() => {
            pauseReplayTimer()
            resetReplayTimer()
            setReplaying(false)
            if (presetHumanSide != null) setHumanSide(presetHumanSide)
            if (presetLevel != null) setDepth(presetLevel)
            setField(Field.Initial(8))
            setStatus('')
            setEnded(false)
            setStarted(true)
            setLastIndex(null)
            clearReplayParamsInUrl()
          }}
        />
        {/* Start overlay */}
        <StartOverlay
          visible={!started}
          onStart={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true); setLastIndex(null) }}
        />
        {/* End overlay */}
        <EndOverlay
          visible={ended}
          resultText={resultText}
          titleColor={hexToRgba(resultColor, 0.85)}
          newGameButtonColor={hexToRgba(resultColor, 0.7)}
          onBackdropNewGame={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false); setLastIndex(null); setMoveLog([]); clearReplayParamsInUrl() }}
          onNewGame={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false); setLastIndex(null); setMoveLog([]); clearReplayParamsInUrl() }}
          onReplay={() => {
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
          }}
        />
      </div>

      {/* 盤面の下にルールの Marquee */}
      <div className="panel-wrap" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: '#444' }}>
          【ルール】✅ひっくり返すたびに点数2倍 ✅1000点以上取ったら勝ち
        </div>
      </div>

      {/* Top panel area with fixed size to avoid layout shift (moved below board) */}
      <div className="panel-wrap" style={{ height: topPanelHeight, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
        {!started ? (
          <StartSettingsPanel
            humanSide={humanSide}
            depth={depth}
            onStart={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true); setLastIndex(null); setMoveLog([]) }}
            onChangeSide={(s) => setHumanSide(s)}
            onChangeDepth={(d) => setDepth(d)}
          />
        ) : ended ? (
          <InfoPanelEnded field={field} aiImgSrc={aiImgSrc} aiLabel={aiStrengthLabel ?? ''} />
        ) : (
          <InfoPanelInGame field={field} aiImgSrc={aiImgSrc} aiLabel={aiStrengthLabel ?? ''} awaitingResult={awaitingResult} status={status} />
        )}
      </div>
    </div>
  )
}

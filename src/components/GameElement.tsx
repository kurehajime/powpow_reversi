import { useEffect, useMemo, useState } from 'react'
import lv0Img from '../assets/lv0.png'
import lv1Img from '../assets/lv1.png'
import lv2Img from '../assets/lv2.png'
import lv3Img from '../assets/lv3.png'
import lv4Img from '../assets/lv4.png'
import lv5Img from '../assets/lv5.png'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'
import { thinkAlphaBeta, thinkGreedy } from '../ai/AlphaBeta'

export default function GameElement() {
  // Phase 2: interactive board with alternating turns
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState<string>('')
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [started, setStarted] = useState<boolean>(false)
  const [ended, setEnded] = useState<boolean>(false)
  const [humanSide, setHumanSide] = useState<1 | -1>(1) // 1=黒(先手), -1=白(後手)
  const [depth, setDepth] = useState<number>(1)
  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cellSize = 60
  const topPanelHeight = 160
  const cpuSide: 1 | -1 = (humanSide === 1 ? -1 : 1)
  const aiStrengthLabel = useMemo(() => {
    switch (depth) {
      case 0: return 'Lv.0 ひよこ'
      case 1: return 'Lv.1 ウサギ'
      case 2: return 'Lv.2 ネコ'
      case 3: return 'Lv.3 オオカミ'
      case 4: return 'Lv.4 ライオン'
      case 5: return 'Lv.5 ドラゴン'
    }
  }, [depth])
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
  const hexToRgba = (hex: string, alpha: number): string => {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
    if (!m) return hex
    const r = parseInt(m[1], 16)
    const g = parseInt(m[2], 16)
    const b = parseInt(m[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  // Always show AI side avatar image regardless of turn or result
  const aiImgSrc = useMemo(() => {
    const list = [lv0Img, lv1Img, lv2Img, lv3Img, lv4Img, lv5Img]
    return list[Math.max(0, Math.min(5, depth))]
  }, [depth])
  const bigAvatarElement = useMemo(() => {
    if (!started) return null
    return (
      <img
        src={aiImgSrc}
        alt={`AI ${aiStrengthLabel}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
      />
    )
  }, [started, aiImgSrc, aiStrengthLabel])
  const hints = useMemo(() => {
    const set = new Set<number>()
    const cells = field.Cells
    // 人間の手番のみハイライトを出す
    if (started && !ended && field.Turn === humanSide) {
      for (let i = 0; i < cells.length; i++) {
        if (field.CanPlace(i)) set.add(i)
      }
    }
    return set as ReadonlySet<number>
  }, [field, started, ended, humanSide])

  // auto-pass when no legal moves for current player but opponent has moves
  useEffect(() => {
    if (!started || ended) return
    if (field.IsEndByScore()) {
      const { black, white } = field.Score()
      const winner = field.WinnerByScore()
      setStatus(winner === 1 ? `試合終了: 黒 ${black} - 白 ${white}` : winner === -1 ? `試合終了: 白 ${white} - 黒 ${black}` : `試合終了: 黒 ${black} - 白 ${white}`)
      setEnded(true)
      return
    }
    if (!field.HasAnyMove()) {
      const opp = field.HasAnyMoveFor(field.Turn === 1 ? -1 : 1)
      if (opp) {
        setStatus('パス')
        setField(field.Pass())
      } else {
        // both have no moves -> do nothing here (end state). Optional message:
        const { black, white } = field.Score()
        const winner = black === white ? '引き分け' : (black > white ? '黒勝ち' : '白勝ち')
        setStatus(`双方打てる手がありません（${winner}: 黒 ${black} - 白 ${white}）`)
        setEnded(true)
      }
    }
  }, [field, started, ended])

  // CPU move on its turn
  useEffect(() => {
    if (!started || ended) return
    if (field.IsEndByScore()) return
    if (field.Turn !== cpuSide) return
    if (!field.HasAnyMove()) return
    // 同期で十分。必要ならsetTimeoutで遅延演出可能
    const { index } = (depth === 0 ? thinkGreedy(field) : thinkAlphaBeta(field, depth))
    if (index != null) {
      const next = field.Place(index)
      const timer = setTimeout(() => {
        setStatus('')
        setLastIndex(index)
        setField(next)
      }, 750)
      return () => clearTimeout(timer)
    } else {
      setStatus('')
    }
  }, [field, started, ended, cpuSide, depth])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <h1 style={{ margin: 0, paddingTop: 8, fontSize: 36, fontFamily: '"Rubik Mono One", system-ui, sans-serif' }}>POW REVERSI</h1>


      <div className="board-wrap">
        <FieldElement
          field={field}
          cellSize={cellSize}
          hints={hints}
          hintColor={hintColor}
          lastIndex={lastIndex}
          onCellClick={(index) => {
            if (!started || ended) return
            if (field.Turn !== humanSide) return
            if (field.IsEndByScore()) return
            const next = field.Place(index)
            if (next !== field) {
              setStatus('')
              setLastIndex(index)
              setField(next)
            }
          }}
        />
        {!started && (
          <div
            onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true); setLastIndex(null) }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 16px', cursor: 'pointer' }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '16px 20px', maxWidth: 420 }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>【ルール】</div>
              <div style={{ fontSize: 18, lineHeight: 1.6 }}>
                ① ひっくり返るたびに点数2倍<br />
                ② 1000点以上取った時点で勝利
              </div>
            </div>
          </div>
        )}
        {ended && (
          <div
            onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false); setLastIndex(null) }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                fontSize: 64,
                fontWeight: 800,
                color: hexToRgba(resultColor, 0.85),
                letterSpacing: 2,
                fontFamily: '"Rubik Mono One", system-ui, sans-serif'
              }}>
                {resultText}
              </div>
              <button
                className="btn-pulse"
                onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false); setLastIndex(null) }}
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  padding: '14px 28px',
                  borderRadius: 14,
                  backgroundColor: hexToRgba(resultColor, 0.7),
                  color: '#fff',
                  border: 'none',
                  fontFamily: '"Rubik Mono One", system-ui, sans-serif',
                  letterSpacing: 1
                }}
              >
                NEW GAME
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 盤面の下にルールの Marquee */}
      <div className="panel-wrap" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: '#444' }}>
          【ルール】①ひっくり返るたびに点数2倍 ②1000点以上取った時点で勝利
        </div>
      </div>

      {/* Top panel area with fixed size to avoid layout shift (moved below board) */}
      <div className="panel-wrap" style={{ height: topPanelHeight, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
        {!started ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #ccc', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
            <button onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true); setLastIndex(null) }}>ゲームスタート</button>
            <div>
              <span style={{ fontWeight: 700 }}>Player:</span>
              <label style={{ marginLeft: 8 }}>
                <input type="radio" name="side" checked={humanSide === 1} onChange={() => setHumanSide(1)} /> Black
              </label>
              <label style={{ marginLeft: 8 }}>
                <input type="radio" name="side" checked={humanSide === -1} onChange={() => setHumanSide(-1)} /> White
              </label>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>AI:</span>
              <div style={{ display: 'inline-block', position: 'relative', marginLeft: 8 }}>
                <select
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  style={{
                    padding: '8px 40px 8px 12px',
                    borderRadius: 12,
                    border: '1px solid #ccc',
                    background: '#ffffff',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <option value={0}>Lv.0 ひよこ</option>
                  <option value={1}>Lv.1 ウサギ</option>
                  <option value={2}>Lv.2 ネコ</option>
                  <option value={3}>Lv.3 オオカミ</option>
                  <option value={4}>Lv.4 ライオン</option>
                  <option value={5}>Lv.5 ドラゴン</option>
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
              </div>
            </div>
          </div>
        ) : ended ? (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8, background: 'rgba(255,255,255,0.75)', width: '100%', height: '100%', boxSizing: 'border-box', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
              <div style={{ width: 96, height: 96, borderRadius: 12, background: '#eee', border: '1px solid #ccc', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>{bigAvatarElement}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{aiStrengthLabel}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
              <ScoreElement field={field} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
              <div style={{ width: 96, height: 96, borderRadius: 12, background: '#eee', border: '1px solid #ccc', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>{bigAvatarElement}</div>
              <div style={{ fontSize: 12, color: '#555' }}>{aiStrengthLabel}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
              <ScoreElement field={field} />
              <div>{status}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

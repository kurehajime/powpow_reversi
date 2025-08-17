import { useEffect, useMemo, useState } from 'react'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'
import { thinkAlphaBeta } from '../ai/AlphaBeta'

export default function GameElement() {
  // Phase 2: interactive board with alternating turns
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState<string>('')
  const [started, setStarted] = useState<boolean>(false)
  const [ended, setEnded] = useState<boolean>(false)
  const [humanSide, setHumanSide] = useState<1 | -1>(1) // 1=黒(先手), -1=白(後手)
  const [depth, setDepth] = useState<number>(3)
  const turnLabel = field.Turn === 1 ? 'Black' : 'White'
  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cellSize = 60
  const boardSize = field.Size() * cellSize
  const topPanelHeight = 160
  const cpuSide: 1 | -1 = (humanSide === 1 ? -1 : 1)
  const resultText = useMemo(() => {
    if (!ended) return ''
    const { black, white } = field.Score()
    const winner = black === white ? 0 : (black > white ? 1 : -1)
    if (winner === 0) return 'DRAW'
    return winner === humanSide ? 'YOU WIN' : 'YOU LOSE'
  }, [ended, field, humanSide])
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
    setStatus('CPU考え中...')
    // 同期で十分。必要ならsetTimeoutで遅延演出可能
    const { index } = thinkAlphaBeta(field, depth)
    if (index != null) {
      const next = field.Place(index)
      setStatus('')
      setField(next)
    } else {
      setStatus('')
    }
  }, [field, started, ended, cpuSide, depth])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Pow Reversi</h1>
      {/* Top panel area with fixed size to avoid layout shift */}
      <div style={{ width: boardSize, height: topPanelHeight, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 8 }}>
        {!started ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #ccc', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
            <div>
              先手/後手:
              <label style={{ marginLeft: 8 }}>
                <input type="radio" name="side" checked={humanSide === 1} onChange={() => setHumanSide(1)} /> 先手（黒・人間）
              </label>
              <label style={{ marginLeft: 8 }}>
                <input type="radio" name="side" checked={humanSide === -1} onChange={() => setHumanSide(-1)} /> 後手（白・人間）
              </label>
            </div>
            <div>
              強さ:
              <select value={depth} onChange={(e) => setDepth(Number(e.target.value))} style={{ marginLeft: 8 }}>
                <option value={1}>1（速い）</option>
                <option value={2}>2</option>
                <option value={3}>3（標準）</option>
                <option value={4}>4</option>
                <option value={5}>5（強い）</option>
              </select>
            </div>
            <button onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true) }}>開始</button>
          </div>
        ) : ended ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '1px solid #ccc', borderRadius: 8, background: 'rgba(255,255,255,0.75)', width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div>{status}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false) }}>再挑戦</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <ScoreElement field={field} />
            <div>Turn: {turnLabel} {status && ` / ${status}`}</div>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', width: boardSize, height: boardSize }}>
        <FieldElement
          field={field}
          cellSize={cellSize}
          hints={hints}
          hintColor={hintColor}
          onCellClick={(index) => {
            if (!started || ended) return
            if (field.Turn !== humanSide) return
            if (field.IsEndByScore()) return
            const next = field.Place(index)
            if (next !== field) {
              setStatus('')
              setField(next)
            }
          }}
        />
        {ended && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center' }}>
            <div style={{
              fontSize: 48,
              fontWeight: 800,
              color: resultText === 'YOU WIN' ? '#64b5f6' : resultText === 'YOU LOSE' ? '#ff5252' : '#ffd740',
              letterSpacing: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {resultText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

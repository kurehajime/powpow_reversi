import { useEffect, useMemo, useState } from 'react'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'
import { thinkAlphaBeta } from '../ai/AlphaBeta'
import Modal from './Modal'

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
  const cpuSide: 1 | -1 = (humanSide === 1 ? -1 : 1)
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
      <ScoreElement field={field} />
      <div style={{ marginBottom: 4 }}>Turn: {turnLabel} {status && ` / ${status}`}</div>
      <FieldElement
        field={field}
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

      {/* Start Modal */}
      <Modal show={!started} title="ゲーム開始">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      </Modal>

      {/* Replay Modal */}
      <Modal show={ended} title="試合終了">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>{status}</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(true) }}>同じ設定で再戦</button>
            <button onClick={() => { setField(Field.Initial(8)); setStatus(''); setEnded(false); setStarted(false) }}>設定から再戦</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

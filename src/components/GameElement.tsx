import { useEffect, useMemo, useState } from 'react'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'
import { thinkAlphaBeta } from '../ai/AlphaBeta'

export default function GameElement() {
  // Phase 2: interactive board with alternating turns
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState<string>('')
  const turnLabel = field.Turn === 1 ? 'Black' : 'White'
  const hintColor: 'black' | 'white' = field.Turn === 1 ? 'black' : 'white'
  const cpuSide: 1 | -1 = -1 // CPUは白
  const hints = useMemo(() => {
    const set = new Set<number>()
    const cells = field.Cells
    for (let i = 0; i < cells.length; i++) {
      if (field.CanPlace(i)) set.add(i)
    }
    return set as ReadonlySet<number>
  }, [field])

  // auto-pass when no legal moves for current player but opponent has moves
  useEffect(() => {
    if (field.IsEndByScore()) {
      const { black, white } = field.Score()
      const winner = field.WinnerByScore()
      setStatus(winner === 1 ? `試合終了: 黒 ${black} - 白 ${white}` : winner === -1 ? `試合終了: 白 ${white} - 黒 ${black}` : `試合終了: 黒 ${black} - 白 ${white}`)
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
      }
    }
  }, [field])

  // CPU move on its turn
  useEffect(() => {
    if (field.IsEndByScore()) return
    if (field.Turn !== cpuSide) return
    if (!field.HasAnyMove()) return
    setStatus('CPU考え中...')
    // 同期で十分。必要ならsetTimeoutで遅延演出可能
    const { index } = thinkAlphaBeta(field, 3)
    if (index != null) {
      const next = field.Place(index)
      setStatus('')
      setField(next)
    } else {
      setStatus('')
    }
  }, [field])

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
          if (field.IsEndByScore()) return
          const next = field.Place(index)
          if (next !== field) {
            setStatus('')
            setField(next)
          }
        }}
      />
    </div>
  )
}

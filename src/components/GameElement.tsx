import { useEffect, useState } from 'react'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'

export default function GameElement() {
  // Phase 2: interactive board with alternating turns
  const [field, setField] = useState<Field>(() => Field.Initial(8))
  const [status, setStatus] = useState<string>('')
  const turnLabel = field.Turn === 1 ? 'Black' : 'White'

  // auto-pass when no legal moves for current player but opponent has moves
  useEffect(() => {
    if (!field.HasAnyMove()) {
      const opp = field.HasAnyMoveFor(field.Turn === 1 ? -1 : 1)
      if (opp) {
        setStatus('パス')
        setField(field.Pass())
      } else {
        // both have no moves -> do nothing here (end state). Optional message:
        setStatus('双方打てる手がありません')
      }
    }
  }, [field])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Pow Reversi</h1>
      <ScoreElement field={field} />
      <div style={{ marginBottom: 4 }}>Turn: {turnLabel} {status && ` / ${status}`}</div>
      <FieldElement
        field={field}
        onCellClick={(index) => {
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

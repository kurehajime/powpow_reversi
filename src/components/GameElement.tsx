import { useMemo } from 'react'
import { Field } from '../model/Field'
import FieldElement from './FieldElement'
import ScoreElement from './ScoreElement'

export default function GameElement() {
  // Phase 1: static initial board, no interactions
  const field = useMemo(() => Field.Initial(8), [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Pow Reversi</h1>
      <ScoreElement field={field} />
      <FieldElement field={field} />
    </div>
  )
}

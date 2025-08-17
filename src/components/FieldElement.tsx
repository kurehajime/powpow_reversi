import { Field } from '../model/Field'
import CellElement from './CellElement'

type Props = {
  field: Field
  cellSize?: number
}

export default function FieldElement({ field, cellSize = 60 }: Props) {
  const size = field.Size()
  const dim = size * cellSize
  return (
    <svg width={dim} height={dim} role="img" aria-label="board">
      {/* grid lines */}
      {[...Array(size + 1)].map((_, i) => (
        <>
          <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={dim} stroke="#0a3d1a" />
          <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={dim} y2={i * cellSize} stroke="#0a3d1a" />
        </>
      ))}
      {field.Cells.map((cell, index) => {
        const x = (index % size) * cellSize
        const y = Math.floor(index / size) * cellSize
        return (
          <CellElement key={index} cell={cell} x={x} y={y} cellSize={cellSize} />
        )
      })}
    </svg>
  )
}

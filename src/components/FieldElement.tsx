import { Field } from '../model/Field'
import CellElement from './CellElement'

type Props = {
  field: Field
  cellSize?: number
  onCellClick?: (index: number) => void
  hints?: ReadonlySet<number>
  hintColor?: 'black' | 'white'
  lastIndex?: number | null
}

export default function FieldElement({ field, cellSize = 60, onCellClick, hints, hintColor, lastIndex }: Props) {
  const size = field.Size()
  const dim = size * cellSize
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onCellClick) return
    const x = (e.nativeEvent as MouseEvent).offsetX
    const y = (e.nativeEvent as MouseEvent).offsetY
    const ix = Math.floor(x / cellSize)
    const iy = Math.floor(y / cellSize)
    const index = ix + iy * size
    onCellClick(index)
  }
  return (
    <svg width={dim} height={dim} role="img" aria-label="board" onClick={handleClick}>
      {/* grid lines */}
      {[...Array(size + 1)].map((_, i) => (
        <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={dim} stroke="rgba(255, 255, 255, 0.07)" />
      ))}
      {[...Array(size + 1)].map((_, i) => (
        <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={dim} y2={i * cellSize} stroke="rgba(255, 255, 255, 0.07)" />
      ))}
      {field.Cells.map((cell, index) => {
        const x = (index % size) * cellSize
        const y = Math.floor(index / size) * cellSize
        return (
          <CellElement key={index} cell={cell} x={x} y={y} cellSize={cellSize} hint={hints?.has(index)} hintColor={hintColor} isLast={lastIndex === index} />
        )
      })}
    </svg>
  )
}

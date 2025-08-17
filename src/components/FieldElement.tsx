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
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ix = Math.floor(x / (rect.width / size))
    const iy = Math.floor(y / (rect.height / size))
    const index = ix + iy * size
    onCellClick(index)
  }
  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      role="img"
      aria-label="board"
      onClick={handleClick}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="discShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.0" flood-color="rgba(0,0,0,0.4)" />
        </filter>
      </defs>
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
      {/* corner star dots (2 cells from each corner) - draw above cells */}
      {(() => {
        const o = 2
        // grid intersections are at integer multiples of cellSize (0..size)
        const pts: Array<[number, number]> = [
          [o, o],
          [size - o, o],
          [o, size - o],
          [size - o, size - o],
        ]
        const r = Math.max(1, Math.floor(cellSize * 0.06))
        const fill = 'rgba(255,255,255,0.30)'
        return (
          <g>
            {pts.map(([gx, gy], idx) => (
              <circle key={`star-${idx}`} cx={gx * cellSize} cy={gy * cellSize} r={r} fill={fill} />
            ))}
          </g>
        )
      })()}
    </svg>
  )
}

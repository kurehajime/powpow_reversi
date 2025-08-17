import type { Cell } from '../model/types'

type Props = {
  cell: Cell
  x: number
  y: number
  cellSize: number
  hint?: boolean
  hintColor?: 'black' | 'white'
}

export default function CellElement({ cell, x, y, cellSize, hint, hintColor }: Props) {
  const padding = Math.max(2, Math.floor(cellSize * 0.08))
  const cx = x + cellSize / 2
  const cy = y + cellSize / 2
  const r = (cellSize / 2) - padding
  const isDisc = cell !== 0
  const isBlack = cell > 0

  return (
    <g style={{ cursor: !isDisc && hint ? 'pointer' as const : 'default' }}>
      <rect x={x} y={y} width={cellSize} height={cellSize} fill="#2e7d32" stroke="#1b5e20" />
      {/* hint dot for legal move on empty cell */}
      {!isDisc && hint && (
        <circle
          cx={cx}
          cy={cy}
          r={Math.max(3, r * 0.35)}
          fill={hintColor === 'white' ? '#ffffff' : '#000000'}
          opacity={0.35}
        />
      )}
      {isDisc && (
        <>
          <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke="#000" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={Math.max(10, r * 0.7)} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif'>
            {Math.abs(cell)}
          </text>
        </>
      )}
    </g>
  )
}

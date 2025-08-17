import { useEffect, useRef, useState } from 'react'
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
  const strokeColor = isBlack ? '#222222' : '#eeeeee'
  const strokeWidth = Math.max(2, Math.floor(cellSize * 0.10))

  const digits = Math.abs(cell).toString().length
  const baseFont = Math.max(10, r * 0.7)
  const fontSize = digits <= 3 ? baseFont * 1.15 : (digits === 4 ? baseFont * 0.85 : baseFont)

  // flip fade animation
  const prevRef = useRef<Cell>(cell)
  const [fadeFrom, setFadeFrom] = useState<Cell | null>(null)
  const [showNew, setShowNew] = useState<boolean>(true)
  useEffect(() => {
    const prev = prevRef.current
    const ps = prev === 0 ? 0 : prev > 0 ? 1 : -1
    const cs = cell === 0 ? 0 : cell > 0 ? 1 : -1
    if (ps !== 0 && cs !== 0 && ps === -cs) {
      setFadeFrom(prev)
      setShowNew(false)
      const t1 = setTimeout(() => setShowNew(true), 10)
      const t2 = setTimeout(() => setFadeFrom(null), 520)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    prevRef.current = cell
  }, [cell])

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
      {isDisc && fadeFrom === null && (
        <>
          <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
            {Math.abs(cell)}
          </text>
        </>
      )}
      {isDisc && fadeFrom !== null && (
        <>
          {/* previous disc fading out */}
          {(() => {
            const prevBlack = fadeFrom > 0
            const prevStroke = prevBlack ? '#222222' : '#eeeeee'
            const prevDigits = Math.abs(fadeFrom).toString().length
            const prevFont = Math.max(10, r * 0.7)
            const prevSize = prevDigits <= 3 ? prevFont * 1.15 : (prevDigits === 4 ? prevFont * 0.85 : prevFont)
            return (
              <g style={{ opacity: showNew ? 0 : 1, transition: 'opacity 500ms ease' }}>
                <circle cx={cx} cy={cy} r={r} fill={prevBlack ? '#111' : '#fafafa'} stroke={prevStroke} strokeWidth={strokeWidth} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={prevSize} fill={prevBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                  {Math.abs(fadeFrom)}
                </text>
              </g>
            )
          })()}
          {/* current disc fading in */}
          <g style={{ opacity: showNew ? 1 : 0, transition: 'opacity 500ms ease' }}>
            <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
              {Math.abs(cell)}
            </text>
          </g>
        </>
      )}
    </g>
  )
}

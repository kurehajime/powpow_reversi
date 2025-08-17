import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { Cell } from '../model/types'

type Props = {
  cell: Cell
  x: number
  y: number
  cellSize: number
  hint?: boolean
  hintColor?: 'black' | 'white'
  isLast?: boolean
}

export default function CellElement({ cell, x, y, cellSize, hint, hintColor, isLast }: Props) {
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
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [flipFrom, setFlipFrom] = useState<Cell | null>(null)
  useEffect(() => {
    const prev = prevRef.current
    const ps = prev === 0 ? 0 : prev > 0 ? 1 : -1
    const cs = cell === 0 ? 0 : cell > 0 ? 1 : -1
    // trigger flip only on sign flip (true disc flip)
    if (ps !== 0 && cs !== 0 && ps === -cs) {
      if (clearRef.current) clearTimeout(clearRef.current)
      setFlipFrom(prev)
      clearRef.current = setTimeout(() => setFlipFrom(null), 500)
    }
    prevRef.current = cell
    return () => {
      if (clearRef.current != null) clearTimeout(clearRef.current)
    }
  }, [cell])

  return (
    <g style={{ cursor: !isDisc && hint ? 'pointer' as const : 'default' }}>
      <rect x={x} y={y} width={cellSize} height={cellSize} fill="seagreen" stroke="rgba(255, 255, 255, 0.07)" strokeWidth={1} />
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
      {isDisc && flipFrom === null && (
        <>
          <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} filter="url(#discShadow)" />
          {isLast && (
            <circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />
          )}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
            {Math.abs(cell)}
          </text>
        </>
      )}
      {isDisc && flipFrom !== null && (
        <>
          {/* previous disc scales X to 0 */}
          {(() => {
            const prevBlack = flipFrom > 0
            const prevStroke = prevBlack ? '#222222' : '#eeeeee'
            const prevDigits = Math.abs(flipFrom).toString().length
            const prevFont = Math.max(10, r * 0.7)
            const prevSize = prevDigits <= 3 ? prevFont * 1.15 : (prevDigits === 4 ? prevFont * 0.85 : prevFont)
            return (
              <motion.g
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'fill-box' as any }}
              >
                <circle cx={cx} cy={cy} r={r} fill={prevBlack ? '#111' : '#fafafa'} stroke={prevStroke} strokeWidth={strokeWidth} filter="url(#discShadow)" />
                {isLast && (
                  <circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />
                )}
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={prevSize} fill={prevBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                  {Math.abs(flipFrom)}
                </text>
              </motion.g>
            )
          })()}
          {/* current disc scales X from 0 to 1 */}
          <motion.g
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'fill-box' as any }}
          >
            <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} filter="url(#discShadow)" />
            {isLast && (
              <circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />
            )}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
              {Math.abs(cell)}
            </text>
          </motion.g>
        </>
      )}
    </g>
  )
}

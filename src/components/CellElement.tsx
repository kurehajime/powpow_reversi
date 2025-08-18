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
  // If the stone value is very large, draw dashed outline to emphasize
  const isBig = Math.abs(cell) > 100
  const dashMajor = Math.max(4, Math.floor(cellSize * 0.22))
  const dashMinor = Math.max(3, Math.floor(cellSize * 0.14))
  const strokeDasharray = `${dashMajor} ${dashMinor}`
  // Medal ring color: grayscale. White stones -> light gray, Black stones -> dark gray
  const medalColor = isBlack ? '#444444' : '#CCCCCC'

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
          {isBig ? (
            <>
              {/* Base disc without border */}
              <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke="none" filter="url(#discShadow)" />
              {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
              {/* Medal ring (solid) same radius */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={medalColor} strokeWidth={strokeWidth} />
              {/* Dashed ring overlay (top) same radius */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={strokeColor} strokeWidth={Math.max(1, Math.floor(strokeWidth * 0.6))} strokeDasharray={strokeDasharray} />
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                {Math.abs(cell)}
              </text>
            </>
          ) : (
            <>
              <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} filter="url(#discShadow)" />
              {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                {Math.abs(cell)}
              </text>
            </>
          )}
        </>
      )}
      {isDisc && flipFrom !== null && (
        <>
          {/* previous disc scales X to 0 */}
          {(() => {
            const prevBlack = flipFrom > 0
            const prevStroke = prevBlack ? '#222222' : '#eeeeee'
            const prevIsBig = Math.abs(flipFrom) > 100
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
                {prevIsBig ? (
                  <>
                    {/* Base disc without border */}
                    <circle cx={cx} cy={cy} r={r} fill={prevBlack ? '#111' : '#fafafa'} stroke="none" filter="url(#discShadow)" />
                    {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
                    {/* Medal ring (grayscale based on previous color) */}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={prevBlack ? '#444444' : '#CCCCCC'} strokeWidth={strokeWidth} />
                    {/* Dashed overlay */}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={prevStroke} strokeWidth={Math.max(1, Math.floor(strokeWidth * 0.6))} strokeDasharray={strokeDasharray} />
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={prevSize} fill={prevBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                      {Math.abs(flipFrom)}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx={cx} cy={cy} r={r} fill={prevBlack ? '#111' : '#fafafa'} stroke={prevStroke} strokeWidth={strokeWidth} filter="url(#discShadow)" />
                    {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={prevSize} fill={prevBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                      {Math.abs(flipFrom)}
                    </text>
                  </>
                )}
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
            {isBig ? (
              <>
                {/* Base disc without border */}
                <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke="none" filter="url(#discShadow)" />
                {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
                {/* Medal ring */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={medalColor} strokeWidth={strokeWidth} />
                {/* Dashed overlay */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={strokeColor} strokeWidth={Math.max(1, Math.floor(strokeWidth * 0.6))} strokeDasharray={strokeDasharray} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                  {Math.abs(cell)}
                </text>
              </>
            ) : (
              <>
                <circle cx={cx} cy={cy} r={r} fill={isBlack ? '#111' : '#fafafa'} stroke={strokeColor} strokeWidth={strokeWidth} filter="url(#discShadow)" />
                {isLast && (<circle cx={cx} cy={cy} r={r} fill="#FFD54F" opacity={0.18} />)}
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={fontSize} fill={isBlack ? '#fff' : '#111'} fontFamily='"Rubik Mono One", system-ui, sans-serif' style={{ letterSpacing: '-1px' }}>
                  {Math.abs(cell)}
                </text>
              </>
            )}
          </motion.g>
        </>
      )}
    </g>
  )
}

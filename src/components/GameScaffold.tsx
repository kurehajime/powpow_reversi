import FieldElement from './FieldElement'
import { Field } from '../model/Field'
import { useTranslation } from 'react-i18next'

type Props = {
  field: Field
  cellSize: number
  hints?: ReadonlySet<number>
  hintColor?: 'black' | 'white'
  lastIndex?: number | null
  onCellClick?: (index: number) => void
  jitterScale: number
  boardOverlays?: React.ReactNode
  panel: React.ReactNode
  flippedIndices?: ReadonlySet<number>
}

export default function GameScaffold({
  field,
  cellSize,
  hints,
  hintColor,
  lastIndex,
  onCellClick,
  jitterScale,
  boardOverlays,
  panel,
  flippedIndices,
}: Props) {
  const { t } = useTranslation()
  const title = 'POW POW REVERSI'
  // dark -> mid -> light
  const orange = ['#F57C00', '#FF9800', '#FFC107']
  const blue = ['#1565C0', '#1E88E5', '#4FC3F7']
  // dark -> mid -> light (reverse of before)
  const green = ['#004D40', '#1B5E20', '#2E7D32']  // dark green gradient
  const renderWordWithColors = (word: string, palette: string[]) => (
    <>
      {word.split('').map((ch, i) => (
        <span key={`${word}-${i}`} style={{ color: palette[i % palette.length] }}>{ch}</span>
      ))}
    </>
  )
  const titleNode = (
    <h1 style={{ margin: 0, paddingTop: 8, fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em', fontFamily: '"Rubik Mono One", system-ui, sans-serif' }} aria-label={title}>
      {renderWordWithColors('POW', orange)}
      <span aria-hidden style={{ display: 'inline-block', width: '0.5ch' }}>{' '}</span>
      {renderWordWithColors('POW', blue)}
      <span aria-hidden style={{ display: 'inline-block', width: '0.5ch' }}>{' '}</span>
      {renderWordWithColors('REVERSI', green)}
    </h1>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {titleNode}

      {/* Hidden SVG filter defs (hand-drawn jitter) */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="distortionFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5;6;7;8;9;10" dur="2s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={jitterScale} />
        </filter>
      </svg>

      <div className="board-wrap">
        <FieldElement
          field={field}
          cellSize={cellSize}
          hints={hints}
          hintColor={hintColor}
          lastIndex={lastIndex}
          onCellClick={onCellClick}
          flippedIndices={flippedIndices}
        />
        {boardOverlays}
      </div>

      {/* 盤面の下にルールの Marquee */}
      <div className="panel-wrap" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: 'var(--muted-text)' }}>{t('rules.inline')}</div>
      </div>

      {panel}
    </div>
  )
}

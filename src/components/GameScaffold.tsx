import FieldElement from './FieldElement'
import { Field } from '../model/Field'

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
}: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <h1 style={{ margin: 0, paddingTop: 8, fontSize: 'clamp(28px, 4vw, 36px)', letterSpacing: '-0.02em', fontFamily: '"Rubik Mono One", system-ui, sans-serif' }}>POW POW REVERSI</h1>

      {/* Hidden SVG filter defs (hand-drawn jitter) */}
      <svg aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="distortionFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="1" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5;6;7;8;9;10" dur="3s" repeatCount="indefinite" calcMode="discrete" />
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
        />
        {boardOverlays}
      </div>

      {/* 盤面の下にルールの Marquee */}
      <div className="panel-wrap" style={{ marginTop: 4 }}>
        <div style={{ fontSize: 14, color: '#444' }}>
          【ルール】✅ひっくり返すたびに点数2倍 ✅1000点以上取ったら勝ち
        </div>
      </div>

      {panel}
    </div>
  )
}


import { Field } from '../model/Field'
import type { ReactNode } from 'react'

type Props = {
  field: Field
  blackAvatar?: ReactNode
  whiteAvatar?: ReactNode
}

export default function ScoreElement({ field, blackAvatar, whiteAvatar }: Props) {
  const cells = field.Cells
  const black = cells.filter(c => c > 0).reduce((s, c) => s + Math.abs(c), 0)
  const white = cells.filter(c => c < 0).reduce((s, c) => s + Math.abs(c), 0)
  const toPercent = (v: number) => Math.max(0, Math.min(100, (v / 1000) * 100))
  const barHeight = 14
  const barRadius = 6

  const Bar = ({ percent, fg, bg, border }: { percent: number, fg: string, bg: string, border: string }) => (
    <div style={{ width: '100%', background: bg, border: `2px solid ${border}`, borderRadius: barRadius, height: barHeight, position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, background: fg, height: '100%', borderRadius: barRadius }}></div>
    </div>
  )
  const hatchBg = 'repeating-linear-gradient(45deg, #c8c8c8 0 6px, #b0b0b0 6px 12px), ' +
                  'repeating-linear-gradient(-45deg, #c8c8c8 0 6px, #b0b0b0 6px 12px)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', textAlign: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          {blackAvatar}
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#111', border: '2px solid #000', verticalAlign: 'middle' }} />
          <strong style={{ marginLeft: 8 }}>Black</strong>
          <span style={{ marginLeft: 8 }}>{black} / 1000</span>
        </div>
        <Bar percent={toPercent(black)} fg="#111" bg={hatchBg} border="#000" />
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          {whiteAvatar}
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#fafafa', border: '2px solid #000', verticalAlign: 'middle' }} />
          <strong style={{ marginLeft: 8 }}>White</strong>
          <span style={{ marginLeft: 8 }}>{white} / 1000</span>
        </div>
        <Bar percent={toPercent(white)} fg="#fafafa" bg={hatchBg} border="#000" />
      </div>
    </div>
  )
}

import { Field } from '../model/Field'

type Props = {
  field: Field
}

export default function ScoreElement({ field }: Props) {
  const cells = field.Cells
  const black = cells.filter(c => c > 0).reduce((s, c) => s + Math.abs(c), 0)
  const white = cells.filter(c => c < 0).reduce((s, c) => s + Math.abs(c), 0)
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#111', border: '1px solid #000' }} />
        <strong>Black:</strong> {black}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: '#fafafa', border: '1px solid #000' }} />
        <strong>White:</strong> {white}
      </div>
    </div>
  )
}

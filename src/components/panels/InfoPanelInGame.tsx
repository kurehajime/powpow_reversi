import ScoreElement from '../ScoreElement'
import AiAvatar from '../AiAvatar'
import type { Field } from '../../model/Field'

type Props = {
  field: Field
  aiImgSrc: string
  aiLabel: string
  awaitingResult: boolean
  status: string
}

export default function InfoPanelInGame({ field, aiImgSrc, aiLabel, awaitingResult, status }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: 12, border: '2px solid #bbb', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', alignItems: 'center', fontWeight: 700 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
        <div style={{ width: 96, height: 96, borderRadius: 12, background: '#eee', border: '2px solid #bbb', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          <AiAvatar src={aiImgSrc} alt={`AI ${aiLabel}`} awaiting={awaitingResult} />
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>{aiLabel}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
        <ScoreElement field={field} />
        <div>{status}</div>
      </div>
    </div>
  )
}


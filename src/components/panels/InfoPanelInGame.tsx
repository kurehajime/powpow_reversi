import ScoreElement from '../ScoreElement'
import AiAvatar from '../AiAvatar'
import type { Field } from '../../model/Field'
import type { PlayerRecord } from '../../lib/stats'
import { useTranslation } from 'react-i18next'
import { aiLevelLabel } from '../../lib/labels'
import lv0Img from '../../assets/lv0.png'
import lv1Img from '../../assets/lv1.png'
import lv2Img from '../../assets/lv2.png'
import lv3Img from '../../assets/lv3.png'
import lv4Img from '../../assets/lv4.png'
import lv5Img from '../../assets/lv5.png'
import lv6Img from '../../assets/lv6.png'

type Props = {
  field: Field
  level: number
  awaitingResult: boolean
  status: string
  record?: PlayerRecord
}

export default function InfoPanelInGame({ field, level, awaitingResult, status, record }: Props) {
  const list = [lv0Img, lv1Img, lv2Img, lv3Img, lv4Img, lv5Img, lv6Img]
  const idx = Math.max(0, Math.min(6, level))
  const aiImgSrc = list[idx]
  const aiLabel = aiLevelLabel(level)
  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 6, padding: 12, border: '2px solid #bbb', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', alignItems: 'center', fontWeight: 700 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto' }}>
        <div style={{ width: 96, height: 96, borderRadius: 12, background: '#eee', border: '2px solid #bbb', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          <AiAvatar src={aiImgSrc} alt={`AI ${aiLabel}`} awaiting={awaitingResult} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-text)' }}>{aiLabel}</div>
        {record ? (
          <RecordLine record={record} />
        ) : null}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
        <ScoreElement field={field} />
        <div>{status}</div>
      </div>
    </div>
  )
}

function RecordLine({ record }: { record: PlayerRecord }) {
  const { t } = useTranslation()
  const { win: w, lose: l, draw: d } = record
  return (
    <div style={{ fontSize: 12, color: 'var(--muted-text)' }}>
      {t('stats.record', { w, l, d })}
    </div>
  )
}

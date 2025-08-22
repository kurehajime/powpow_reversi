type Props = {
  humanSide: 1 | -1
  depth: number
  onStart: () => void
  onChangeSide: (side: 1 | -1) => void
  onChangeDepth: (d: number) => void
}

import { useTranslation } from 'react-i18next'

export default function StartSettingsPanel({ humanSide, depth, onStart, onChangeSide, onChangeDepth }: Props) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, border: '2px solid #bbb', borderRadius: 8, width: '100%', height: '100%', boxSizing: 'border-box', justifyContent: 'center', fontWeight: 700 }}>
      <button style={{ fontWeight: 900 }} onClick={onStart}>{t('start.startGame')}</button>
      <div>
        <span style={{ fontWeight: 700 }}>{t('start.player')}</span>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name="side" checked={humanSide === 1} onChange={() => onChangeSide(1)} /> {t('color.black')}
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name="side" checked={humanSide === -1} onChange={() => onChangeSide(-1)} /> {t('color.white')}
        </label>
      </div>
      <div>
        <span style={{ fontWeight: 700 }}>{t('start.ai')}</span>
        <div style={{ display: 'inline-block', position: 'relative', marginLeft: 8 }}>
          <select
            value={depth}
            onChange={(e) => onChangeDepth(Number(e.target.value))}
            style={{
              padding: '8px 40px 8px 12px',
              borderRadius: 12,
              border: '2px solid #bbb',
              background: '#ffffff',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {[0,1,2,3,4,5,6].map((lv) => (
              <option key={lv} value={lv}>{t(`level.${lv}`)}</option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>▼</span>
        </div>
      </div>
    </div>
  )
}

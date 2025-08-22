type Props = {
  visible: boolean
  onStart: () => void
}

import { useTranslation } from 'react-i18next'

export default function StartOverlay({ visible, onStart }: Props) {
  const { t } = useTranslation()
  if (!visible) return null
  return (
    <div
      onClick={onStart}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 16px', cursor: 'pointer' }}
    >
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.92)', background: 'rgba(0,0,0,0.72)', border: '2px solid rgba(255,255,255,0.6)', borderRadius: 12, padding: '16px 20px', maxWidth: 420, fontWeight: 700, pointerEvents: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{t('rules.title')}</div>
        <div style={{ fontSize: 18, lineHeight: 1.6, textAlign: 'left' }}>
          ① {t('rules.line1')}<br />
          ② {t('rules.line2')}
        </div>
      </div>
    </div>
  )
}

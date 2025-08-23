import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { buildReplayUrl } from '../lib/url'

type ReplayParams = { player: 1 | -1, level: number, log: number[] }

export default function PanelShare({ replay }: { replay?: ReplayParams }) {
  const { t, i18n } = useTranslation()
  const shareUrl = useMemo(() => {
    try {
      const base = window.location.href
      if (replay && replay.log && replay.log.length > 0) {
        return buildReplayUrl(base, replay)
      }
      return base
    } catch { return '' }
  }, [replay?.player, replay?.level, replay?.log])
  const text = t('share.message', { defaultValue: 'I played POW POW REVERSI!' })
  const intent = useMemo(() => {
    const base = 'https://x.com/intent/tweet'
    const sp = new URLSearchParams()
    sp.set('text', text)
    if (shareUrl) sp.set('url', shareUrl)
    sp.set('lang', i18n.resolvedLanguage?.startsWith('ja') ? 'ja' : 'en')
    return `${base}?${sp.toString()}`
  }, [text, shareUrl, i18n.resolvedLanguage])
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 8 }}>
      <a href={intent} target="_blank" rel="noopener noreferrer"
         style={{
           display: 'inline-flex', alignItems: 'center', gap: 8,
           background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 9999,
           padding: '8px 14px', fontWeight: 900, textDecoration: 'none'
         }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>𝕏</span>
        <span>{t('share.shareOnX')}</span>
      </a>
    </div>
  )
}

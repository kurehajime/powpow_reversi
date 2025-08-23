import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function ShareBar() {
  const { t, i18n } = useTranslation()
  const shareUrl = useMemo(() => {
    try { return window.location.href } catch { return '' }
  }, [])
  const text = t('share.message', { defaultValue: 'I played POW POW REVERSI!' })
  const intent = useMemo(() => {
    const base = 'https://x.com/intent/tweet'
    const sp = new URLSearchParams()
    sp.set('text', text)
    if (shareUrl) sp.set('url', shareUrl)
    // optionally set lang
    sp.set('lang', i18n.resolvedLanguage?.startsWith('ja') ? 'ja' : 'en')
    return `${base}?${sp.toString()}`
  }, [text, shareUrl, i18n.resolvedLanguage])
  return (
    <div className="share-wrap" style={{ position: 'relative', height: 32 }}>
      <div className="share-reveal" style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0, pointerEvents: 'none', transform: 'translateY(4px)', transition: 'opacity 200ms ease, transform 200ms ease'
      }}>
        <a href={intent} target="_blank" rel="noopener noreferrer"
           style={{
             display: 'inline-flex', alignItems: 'center', gap: 8,
             background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 9999,
             padding: '6px 12px', fontWeight: 900, textDecoration: 'none'
           }}
        >
          <span style={{ fontSize: 16 }}>𝕏</span>
          <span>{t('share.shareOnX')}</span>
        </a>
      </div>
    </div>
  )
}

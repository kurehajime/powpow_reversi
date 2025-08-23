import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function FooterShare() {
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
    sp.set('lang', i18n.resolvedLanguage?.startsWith('ja') ? 'ja' : 'en')
    return `${base}?${sp.toString()}`
  }, [text, shareUrl, i18n.resolvedLanguage])
  return (
    <div className="footer-share" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', padding: '6px 0', pointerEvents: 'none' }}>
      <div className="footer-share-inner" style={{ pointerEvents: 'auto', transition: 'opacity 200ms ease, transform 200ms ease', opacity: 0.2, transform: 'translateY(6px)' }}>
        <a href={intent} target="_blank" rel="noopener noreferrer"
           className="footer-share-pill"
           style={{
             display: 'inline-flex', alignItems: 'center', gap: 8,
             background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 9999,
             padding: '8px 14px', fontWeight: 900, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
           }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>𝕏</span>
          <span>{t('share.shareOnX')}</span>
        </a>
      </div>
    </div>
  )
}

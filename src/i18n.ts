import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ja from './locales/ja/translation.json'

function detectInitialLang() {
  try {
    const sp = new URLSearchParams(window.location.search)
    const urlLang = sp.get('lang')
    if (urlLang === 'ja' || urlLang === 'en') return urlLang
  } catch { /* noop */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav && nav.startsWith('ja') ? 'ja' : 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: detectInitialLang(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  })

// No UI switcher nor cookie persistence; URL param controls language.

export default i18n

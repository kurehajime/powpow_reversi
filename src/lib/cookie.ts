export function setCookie(name: string, value: string, days = 365): void {
  try {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
    const encoded = encodeURIComponent(name) + '=' + encodeURIComponent(value)
    document.cookie = `${encoded}; expires=${expires}; path=/` // path=/ to share across routes
  } catch {
    // noop (cookies might be disabled)
  }
}

export function getCookie(name: string): string | null {
  try {
    const key = encodeURIComponent(name) + '='
    const parts = document.cookie.split('; ')
    for (const part of parts) {
      if (part.startsWith(key)) {
        return decodeURIComponent(part.substring(key.length))
      }
    }
  } catch {
    // noop
  }
  return null
}


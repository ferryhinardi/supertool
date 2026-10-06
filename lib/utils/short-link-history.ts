export const SHORT_LINK_HISTORY_KEY = 'url_shortener_codes'
export const MAX_SHORT_LINK_HISTORY = 100

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{3,50}$/

export function isShortCode(value: unknown): value is string {
  return typeof value === 'string' && SHORT_CODE_PATTERN.test(value)
}

export function readShortLinkHistory(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SHORT_LINK_HISTORY_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isShortCode).slice(0, MAX_SHORT_LINK_HISTORY) : []
  } catch {
    return []
  }
}

function writeShortLinkHistory(codes: string[]) {
  try {
    localStorage.setItem(
      SHORT_LINK_HISTORY_KEY,
      JSON.stringify(codes.slice(0, MAX_SHORT_LINK_HISTORY))
    )
  } catch {
    // Storage can be full or disabled; the list just won't persist.
  }
}

export function rememberShortLink(code: string) {
  if (!isShortCode(code)) return
  writeShortLinkHistory([code, ...readShortLinkHistory().filter((saved) => saved !== code)])
}

export function forgetShortLink(code: string) {
  writeShortLinkHistory(readShortLinkHistory().filter((saved) => saved !== code))
}

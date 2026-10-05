const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa']

function isPrivateIPv4(host: string): boolean {
  const parts = host.split('.')
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part))) return false
  const [a, b] = parts.map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function isPrivateIPv6(host: string): boolean {
  if (!host.startsWith('[')) return false
  const address = host.slice(1, -1).toLowerCase()
  return (
    address === '::' ||
    address === '::1' ||
    address.startsWith('fc') ||
    address.startsWith('fd') ||
    address.startsWith('fe80') ||
    address.startsWith('::ffff:')
  )
}

/**
 * True for http(s) URLs whose host is reachable on the public internet. Short links
 * are public, so they must not point at loopback, private-network, or bare intranet hosts.
 */
export function isPublicHttpUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!host || host === 'localhost') return false
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return false
  if (isPrivateIPv4(host) || isPrivateIPv6(host)) return false
  return host.includes('.') || host.startsWith('[')
}

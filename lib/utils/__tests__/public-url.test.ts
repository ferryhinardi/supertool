import { describe, expect, it } from 'vitest'
import { isPublicHttpUrl } from '../public-url'

describe('isPublicHttpUrl', () => {
  it('accepts public http and https URLs', () => {
    expect(isPublicHttpUrl('https://supertool.id/tools')).toBe(true)
    expect(isPublicHttpUrl('http://example.com:8080/path?q=1')).toBe(true)
    expect(isPublicHttpUrl('https://8.8.8.8/')).toBe(true)
    expect(isPublicHttpUrl('https://[2606:4700::1111]/')).toBe(true)
  })

  it('rejects malformed URLs and other protocols', () => {
    expect(isPublicHttpUrl('not a url')).toBe(false)
    expect(isPublicHttpUrl('ftp://example.com')).toBe(false)
    expect(isPublicHttpUrl('javascript:alert(1)')).toBe(false)
  })

  it.each([
    'http://localhost:2900/',
    'http://LOCALHOST./',
    'http://app.localhost/',
    'http://printer.local/',
    'http://intranet/',
    'http://127.0.0.1:3000/',
    'http://10.0.0.5/',
    'http://172.20.1.1/',
    'http://192.168.1.1/',
    'http://169.254.169.254/latest/meta-data',
    'http://100.64.0.1/',
    'http://0.0.0.0/',
    'http://[::1]/',
    'http://[fd00::1]/',
    'http://[fe80::1]/',
    'http://[::ffff:127.0.0.1]/',
  ])('rejects private host %s', (url) => {
    expect(isPublicHttpUrl(url)).toBe(false)
  })
})

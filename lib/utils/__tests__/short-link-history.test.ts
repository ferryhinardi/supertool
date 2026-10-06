import { beforeEach, describe, expect, it } from 'vitest'
import {
  forgetShortLink,
  isShortCode,
  MAX_SHORT_LINK_HISTORY,
  readShortLinkHistory,
  rememberShortLink,
  SHORT_LINK_HISTORY_KEY,
} from '../short-link-history'

describe('short-link-history', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('validates short codes', () => {
    expect(isShortCode('abc123')).toBe(true)
    expect(isShortCode('my-custom_link')).toBe(true)
    expect(isShortCode('ab')).toBe(false)
    expect(isShortCode('a,b,c')).toBe(false)
    expect(isShortCode(42)).toBe(false)
  })

  it('remembers codes newest first without duplicates', () => {
    rememberShortLink('first1')
    rememberShortLink('second')
    rememberShortLink('first1')

    expect(readShortLinkHistory()).toEqual(['first1', 'second'])
  })

  it('ignores invalid codes', () => {
    rememberShortLink('no way')
    expect(readShortLinkHistory()).toEqual([])
  })

  it('forgets a code', () => {
    rememberShortLink('keep01')
    rememberShortLink('drop01')
    forgetShortLink('drop01')

    expect(readShortLinkHistory()).toEqual(['keep01'])
  })

  it('caps the history length', () => {
    for (let i = 0; i < MAX_SHORT_LINK_HISTORY + 5; i++) rememberShortLink(`code${i}`)

    const history = readShortLinkHistory()
    expect(history).toHaveLength(MAX_SHORT_LINK_HISTORY)
    expect(history[0]).toBe(`code${MAX_SHORT_LINK_HISTORY + 4}`)
  })

  it('recovers from corrupted or foreign data', () => {
    localStorage.setItem(SHORT_LINK_HISTORY_KEY, '{not json')
    expect(readShortLinkHistory()).toEqual([])

    localStorage.setItem(SHORT_LINK_HISTORY_KEY, JSON.stringify(['valid1', 7, 'bad code']))
    expect(readShortLinkHistory()).toEqual(['valid1'])
  })
})

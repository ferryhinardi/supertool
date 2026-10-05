import type { User } from '@supabase/supabase-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { supabase } from '@/lib/auth/supabaseClient'
import { buildProfileInsert, ensureUserProfile } from '../user-profile'

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'dev@example.com',
    app_metadata: { provider: 'github' },
    user_metadata: { full_name: 'Dev Person', avatar_url: 'https://example.com/a.png' },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function mockProfileTable(options: {
  existing: unknown
  selectError?: unknown
  created?: unknown
  insertError?: unknown
}) {
  const insert = vi.fn(() => ({
    select: () => ({
      maybeSingle: () =>
        Promise.resolve({ data: options.created ?? null, error: options.insertError ?? null }),
    }),
  }))
  const from = vi.spyOn(supabase, 'from').mockImplementation(
    () =>
      ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: options.existing, error: options.selectError ?? null }),
          }),
        }),
        insert,
      }) as unknown as ReturnType<typeof supabase.from>
  )
  return { from, insert }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('buildProfileInsert', () => {
  it('uses full name, avatar and provider from metadata', () => {
    expect(buildProfileInsert(makeUser())).toEqual({
      id: 'user-1',
      email: 'dev@example.com',
      display_name: 'Dev Person',
      avatar_url: 'https://example.com/a.png',
      provider: 'github',
    })
  })

  it('falls back to name, then the email prefix, and email provider', () => {
    expect(
      buildProfileInsert(makeUser({ app_metadata: {}, user_metadata: { name: 'Handle' } }))
    ).toMatchObject({ display_name: 'Handle', avatar_url: null, provider: 'email' })
    expect(buildProfileInsert(makeUser({ user_metadata: {} })).display_name).toBe('dev')
    expect(
      buildProfileInsert(makeUser({ email: undefined, user_metadata: {} })).display_name
    ).toBeNull()
  })
})

describe('ensureUserProfile', () => {
  it('returns the existing profile without inserting', async () => {
    const existing = { id: 'user-1', display_name: 'Dev Person' }
    const { insert } = mockProfileTable({ existing })

    await expect(ensureUserProfile(makeUser())).resolves.toEqual(existing)
    expect(insert).not.toHaveBeenCalled()
  })

  it('creates the profile when the row is missing', async () => {
    const created = { id: 'user-1', display_name: 'Dev Person' }
    const { insert } = mockProfileTable({ existing: null, created })

    await expect(ensureUserProfile(makeUser())).resolves.toEqual(created)
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }))
  })

  it('throws select and insert errors', async () => {
    mockProfileTable({ existing: null, selectError: new Error('select failed') })
    await expect(ensureUserProfile(makeUser())).rejects.toThrow('select failed')

    vi.restoreAllMocks()
    mockProfileTable({ existing: null, insertError: new Error('insert failed') })
    await expect(ensureUserProfile(makeUser())).rejects.toThrow('insert failed')
  })
})

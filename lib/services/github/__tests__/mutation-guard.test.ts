import { describe, expect, it } from 'vitest'
import { githubMutationForbidden } from '../mutation-guard'

describe('githubMutationForbidden', () => {
  it('returns 403 with a clear read-only message', async () => {
    const response = githubMutationForbidden()
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toMatch(/read-only/i)
  })
})

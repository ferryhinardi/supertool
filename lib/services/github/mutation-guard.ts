import { NextResponse } from 'next/server'

/**
 * GitHub mutating endpoints previously proxied writes through the shared
 * server GITHUB_TOKEN with no caller auth. That lets anyone create/update/delete
 * files, PRs, issues, and branches in any repo the token can access.
 * Reads remain available; writes stay disabled until per-user OAuth exists.
 */
export function githubMutationForbidden() {
  return NextResponse.json(
    {
      error:
        'GitHub write operations are disabled. This API is read-only and does not proxy mutations with the server token.',
    },
    { status: 403 }
  )
}

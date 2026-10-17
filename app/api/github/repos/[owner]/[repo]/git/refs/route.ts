import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'
import { githubMutationForbidden } from '@/lib/services/github/mutation-guard'

/**
 * POST /api/github/repos/[owner]/[repo]/git/refs
 * Disabled: must not proxy writes with the shared server GITHUB_TOKEN.
 */
export async function POST(
  _request: NextRequest,
  _context: { params: Promise<{ owner: string; repo: string }> }
) {
  return githubMutationForbidden()
}

/**
 * GET /api/github/repos/[owner]/[repo]/git/refs
 * Get a git reference
 * Query params:
 *   - ref: The reference path (e.g., "heads/main" for branches)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json({ error: 'Reference path is required' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.getRef(owner, repo, ref)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to get reference' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

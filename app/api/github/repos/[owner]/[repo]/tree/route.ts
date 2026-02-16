import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/tree
 * Fetch repository file tree
 * Query params:
 *   - sha: tree SHA or branch name (optional, defaults to default branch)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const searchParams = request.nextUrl.searchParams
    const sha = searchParams.get('sha') || undefined

    const github = getGitHubService()
    const result = await github.fetchFileTree(owner, repo, sha)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch file tree' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

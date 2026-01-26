import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * POST /api/github/repos/[owner]/[repo]/git/refs
 * Create a new branch (git reference)
 * Body:
 *   - branchName: Name of the new branch (without refs/heads/ prefix)
 *   - sha: Commit SHA to branch from (required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params
    const body = (await request.json()) as { branchName: string; sha: string }

    if (!body.branchName) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
    }

    if (!body.sha) {
      return NextResponse.json({ error: 'Commit SHA is required' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.createBranch(owner, repo, body.branchName, body.sha)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create branch' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
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

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import type { CreateCommentParams } from '@/lib/services/github'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/issues/[number]/comments
 * List comments on an issue or PR
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  try {
    const { owner, repo, number } = await params
    const issueNumber = Number.parseInt(number, 10)

    if (Number.isNaN(issueNumber) || issueNumber <= 0) {
      return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.fetchIssueComments(owner, repo, issueNumber)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch comments' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/github/repos/[owner]/[repo]/issues/[number]/comments
 * Create a comment on an issue or PR
 * Note: In GitHub API, PRs are issues, so this works for both
 * Body:
 *   - body: Comment text (required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; number: string }> }
) {
  try {
    const { owner, repo, number } = await params
    const issueNumber = Number.parseInt(number, 10)

    if (Number.isNaN(issueNumber) || issueNumber <= 0) {
      return NextResponse.json({ error: 'Invalid issue number' }, { status: 400 })
    }

    const body = (await request.json()) as CreateCommentParams

    if (!body.body) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
    }

    const github = getGitHubService()
    const result = await github.createIssueComment(owner, repo, issueNumber, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to create comment' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json(result.data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import { getGitHubService } from '@/lib/services/github'

/**
 * GET /api/github/repos/[owner]/[repo]/contents/[...path]
 * Fetch file content at a specific path
 * Query params:
 *   - ref: branch, tag, or commit SHA (optional, defaults to default branch)
 *   - raw: if 'true', returns raw file content as text
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  try {
    const { owner, repo, path } = await params
    const filePath = path.join('/')
    const searchParams = request.nextUrl.searchParams
    const ref = searchParams.get('ref') || undefined
    const raw = searchParams.get('raw') === 'true'

    const github = getGitHubService()

    if (raw) {
      const result = await github.fetchRawContent(owner, repo, filePath, ref)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error?.message || 'Failed to fetch raw content' },
          { status: result.error?.status || 500 }
        )
      }

      return new NextResponse(result.data, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }

    const result = await github.fetchFileContent(owner, repo, filePath, ref)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch file content' },
        { status: result.error?.status || 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

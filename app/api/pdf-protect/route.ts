import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const password = formData.get('password') as string
    const _ownerPassword = formData.get('ownerPassword') as string | null
    const permissionsStr = formData.get('permissions') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!password || password.trim() === '') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long' },
        { status: 400 }
      )
    }

    // Parse permissions
    let permissions = {
      printing: false,
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
    }

    if (permissionsStr) {
      try {
        const parsed = JSON.parse(permissionsStr)
        permissions = { ...permissions, ...parsed }
      } catch (e) {
        console.error('Failed to parse permissions:', e)
      }
    }

    // Load PDF
    const arrayBuffer = await file.arrayBuffer()
    const _pdfDoc = await PDFDocument.load(arrayBuffer)

    // Note: pdf-lib v1.17.1 doesn't natively support encryption
    // We need to use a workaround or external library
    // For now, we'll return an error indicating this feature requires additional setup

    return NextResponse.json(
      {
        error:
          'Password protection requires additional server setup. This feature will be available in a future update.',
      },
      { status: 501 }
    )

    // TODO: Implement encryption using external library like:
    // - hummus (node-hummus)
    // - pdf-lib with encryption patch
    // - qpdf via child_process
    // - muhammara
  } catch (error) {
    console.error('PDF protection error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to protect PDF' },
      { status: 500 }
    )
  }
}

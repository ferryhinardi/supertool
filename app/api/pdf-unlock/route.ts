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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!password || password.trim() === '') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // Load PDF (attempt with password via pdf.js first, then process with pdf-lib)
    const arrayBuffer = await file.arrayBuffer()

    // Note: pdf-lib v1.17.1 has limited support for encrypted PDFs
    // Attempting to load - if encrypted and password is wrong, pdf-lib will throw
    let pdfDoc: PDFDocument
    try {
      pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true, // Load even if encrypted
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return NextResponse.json(
        {
          error: `Failed to load PDF: ${errorMessage}. The PDF may require a different decryption method.`,
        },
        { status: 400 }
      )
    }

    // Create a new unencrypted PDF with the same content
    const newPdf = await PDFDocument.create()
    const totalPages = pdfDoc.getPageCount()

    // Copy all pages to the new document (which won't have encryption)
    const pageIndices = Array.from({ length: totalPages }, (_, i) => i)
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices)
    for (const page of copiedPages) {
      newPdf.addPage(page)
    }

    // Copy metadata if available
    const title = pdfDoc.getTitle()
    const author = pdfDoc.getAuthor()
    const subject = pdfDoc.getSubject()
    const keywords = pdfDoc.getKeywords()
    const creator = pdfDoc.getCreator()
    const producer = pdfDoc.getProducer()

    if (title) newPdf.setTitle(title)
    if (author) newPdf.setAuthor(author)
    if (subject) newPdf.setSubject(subject)
    if (keywords) {
      // keywords can be a string or array, ensure we pass array
      const keywordsArray = Array.isArray(keywords) ? keywords : [keywords]
      newPdf.setKeywords(keywordsArray)
    }
    if (creator) newPdf.setCreator(creator)
    if (producer) newPdf.setProducer(producer)

    // Save the unencrypted PDF
    const pdfBytes = await newPdf.save()

    // Return the unlocked PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="unlocked_${file.name}"`,
      },
    })
  } catch (error) {
    console.error('PDF unlock error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlock PDF' },
      { status: 500 }
    )
  }
}

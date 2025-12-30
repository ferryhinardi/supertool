// PDF Export for Cover Letters
// Uses html2canvas and jsPDF to generate PDFs

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { CoverLetterData } from '../types'

/**
 * Export cover letter to PDF with visual formatting
 * Captures the rendered template as an image and converts to PDF
 */
export async function exportCoverLetterToPDF(elementId: string, fileName: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error('Cover letter element not found')
  }

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    // A4 dimensions in mm
    const pdfWidth = 210

    // Calculate dimensions to fit the page
    const imgWidth = pdfWidth
    const imgHeight = (canvas.height * pdfWidth) / canvas.width

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

    // Download the PDF
    pdf.save(fileName)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    throw new Error('Failed to export cover letter to PDF')
  }
}

/**
 * Export cover letter as plain text PDF for ATS compatibility
 * Uses simple text formatting without images
 */
export async function exportCoverLetterToTextPDF(
  data: CoverLetterData,
  fileName: string
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = 210
    const marginLeft = 20
    const marginRight = 20
    const marginTop = 20
    const lineHeight = 6
    const maxWidth = pageWidth - marginLeft - marginRight

    let yPosition = marginTop

    // Helper function to add text with proper line breaks
    const addText = (text: string, fontSize: number, isBold = false) => {
      pdf.setFontSize(fontSize)
      if (isBold) {
        pdf.setFont('helvetica', 'bold')
      } else {
        pdf.setFont('helvetica', 'normal')
      }

      const lines = pdf.splitTextToSize(text, maxWidth)
      lines.forEach((line: string) => {
        if (yPosition > 280) {
          // Page break
          pdf.addPage()
          yPosition = marginTop
        }
        pdf.text(line, marginLeft, yPosition)
        yPosition += lineHeight
      })
    }

    // Add personal info
    addText(data.personal.fullName, 14, true)
    if (data.personal.location) {
      addText(data.personal.location, 10)
    }
    if (data.personal.phone) {
      addText(data.personal.phone, 10)
    }
    if (data.personal.email) {
      addText(data.personal.email, 10)
    }
    yPosition += lineHeight

    // Add date
    addText(
      new Date(data.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      10
    )
    yPosition += lineHeight

    // Add recipient info
    if (data.recipient.hiringManagerName) {
      addText(data.recipient.hiringManagerName, 10)
    }
    if (data.recipient.companyName) {
      addText(data.recipient.companyName, 10)
    }
    if (data.recipient.department) {
      addText(data.recipient.department, 10)
    }
    yPosition += lineHeight

    // Add position
    if (data.position) {
      addText(`RE: ${data.position}`, 10, true)
      yPosition += lineHeight
    }

    // Add salutation
    addText(`${data.salutation},`, 10)
    yPosition += lineHeight

    // Add content
    if (data.content.opening) {
      addText(data.content.opening, 10)
      yPosition += lineHeight
    }

    if (data.content.body) {
      // Handle multiple paragraphs
      const paragraphs = data.content.body.split('\n\n')
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          addText(paragraph.trim(), 10)
          yPosition += lineHeight
        }
      })
    }

    if (data.content.closing) {
      addText(data.content.closing, 10)
      yPosition += lineHeight
    }

    if (data.content.callToAction) {
      addText(data.content.callToAction, 10)
      yPosition += lineHeight * 2
    }

    // Add signature
    addText(`${data.signature},`, 10)
    yPosition += lineHeight * 3
    addText(data.personal.fullName, 10, true)

    // Download the PDF
    pdf.save(fileName)
  } catch (error) {
    console.error('Failed to export text PDF:', error)
    throw new Error('Failed to export cover letter to text PDF')
  }
}

/**
 * Get suggested filename based on cover letter data
 */
export function getSuggestedFileName(data: CoverLetterData, format: 'visual' | 'text'): string {
  const namePart = data.personal.fullName.replace(/\s+/g, '-').toLowerCase()
  const positionPart = data.position.replace(/\s+/g, '-').toLowerCase()
  const companyPart = data.recipient.companyName.replace(/\s+/g, '-').toLowerCase()
  const timestamp = Date.now()

  return `cover-letter-${namePart}-${positionPart}-${companyPart}-${format}-${timestamp}.pdf`
}

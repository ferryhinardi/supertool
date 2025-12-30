/**
 * PDF Export Utility
 * Generate downloadable PDF from resume data using jsPDF and html2canvas
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { ResumeData } from '../types'

export interface PDFExportOptions {
  filename?: string
  quality?: number // 0-1
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
}

/**
 * Export resume to PDF by capturing the preview element
 * @param elementId - ID of the element to capture
 * @param options - PDF export options
 */
export async function exportResumeToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = `resume-${Date.now()}.pdf`,
    quality = 0.95,
    format = 'a4',
    orientation = 'portrait',
  } = options

  try {
    // Get the element to capture
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Show loading state (you can add a toast or spinner here)
    console.log('Generating PDF...')

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Calculate PDF dimensions
    const imgWidth = format === 'a4' ? 210 : 216 // mm (A4 or Letter)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
      compress: true,
    })

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', quality)
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)

    // Download PDF
    pdf.save(filename)

    console.log('PDF generated successfully!')
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

/**
 * Export resume directly from ResumeData (without preview)
 * Uses jsPDF directly for simpler, ATS-friendly PDFs
 */
export function exportResumeToSimplePDF(data: ResumeData, options: PDFExportOptions = {}): void {
  const { filename = `resume-${Date.now()}.pdf`, format = 'a4', orientation = 'portrait' } = options

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
    compress: true,
  })

  const { personal, experience, education, skills } = data
  const pageWidth = format === 'a4' ? 210 : 216
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper to add text with word wrapping
  const addText = (text: string, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal') => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', fontStyle)
    const lines = pdf.splitTextToSize(text, contentWidth)
    pdf.text(lines, margin, yPosition)
    yPosition += lines.length * (fontSize / 2) + 3
  }

  // Add line
  const addLine = () => {
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5
  }

  // Header
  addText(personal.fullName || 'Your Name', 20, 'bold')
  addText(personal.professionalTitle || 'Professional Title', 12, 'normal')
  yPosition += 2
  addText(
    `${personal.email || ''} | ${personal.phone || ''} | ${personal.location || ''}`,
    9,
    'normal'
  )
  addLine()

  // Professional Summary
  if (personal.summary) {
    addText('PROFESSIONAL SUMMARY', 12, 'bold')
    addText(personal.summary, 10, 'normal')
    yPosition += 3
  }

  // Experience
  if (experience && experience.length > 0) {
    addText('WORK EXPERIENCE', 12, 'bold')
    experience.forEach((exp) => {
      addText(`${exp.position} - ${exp.company}`, 11, 'bold')
      addText(`${exp.location} | ${exp.startDate} - ${exp.endDate}`, 9, 'normal')
      yPosition += 2
      exp.achievements?.forEach((achievement) => {
        if (achievement) {
          addText(`• ${achievement}`, 9, 'normal')
        }
      })
      yPosition += 3
    })
  }

  // Education
  if (education && education.length > 0) {
    addText('EDUCATION', 12, 'bold')
    education.forEach((edu) => {
      addText(`${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`, 11, 'bold')
      addText(
        `${edu.institution} | ${edu.location} | ${edu.startDate} - ${edu.endDate}`,
        9,
        'normal'
      )
      if (edu.gpa) {
        addText(`GPA: ${edu.gpa}`, 9, 'normal')
      }
      yPosition += 3
    })
  }

  // Skills
  if (skills && skills.length > 0) {
    addText('SKILLS', 12, 'bold')
    skills.forEach((group) => {
      if (group.category && group.skills.length > 0) {
        addText(`${group.category}: ${group.skills.filter(Boolean).join(', ')}`, 9, 'normal')
      }
    })
  }

  // Save PDF
  pdf.save(filename)
}

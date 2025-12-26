import QRCode from 'qrcode'

/**
 * Generate a QR code as a PNG blob from text
 * @param text - The text content to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 300)
 * @returns Promise that resolves to a Blob containing the PNG image
 */
export async function generateQRCodeBlob(text: string, size = 300): Promise<Blob> {
  if (!text || text.trim() === '') {
    throw new Error('QR code text cannot be empty')
  }

  const canvas = document.createElement('canvas')

  try {
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to generate QR code blob'))
        }
      }, 'image/png')
    })
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Generate a QR code as a data URL from text
 * @param text - The text content to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 300)
 * @returns Promise that resolves to a data URL string
 */
export async function generateQRCodeDataURL(text: string, size = 300): Promise<string> {
  if (!text || text.trim() === '') {
    throw new Error('QR code text cannot be empty')
  }

  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (error) {
    throw new Error(
      `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Convert a Blob to a File object
 * @param blob - The blob to convert
 * @param filename - The filename for the file
 * @returns File object
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type })
}

/**
 * Generate a QR code as a File object
 * @param text - The text content to encode in the QR code
 * @param filename - The filename for the generated file (default: 'qrcode.png')
 * @param size - The size of the QR code in pixels (default: 300)
 * @returns Promise that resolves to a File object
 */
export async function generateQRCodeFile(
  text: string,
  filename = 'qrcode.png',
  size = 300
): Promise<File> {
  const blob = await generateQRCodeBlob(text, size)
  return blobToFile(blob, filename)
}

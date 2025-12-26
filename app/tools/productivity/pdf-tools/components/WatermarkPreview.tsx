'use client'

import { Eye } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { css } from '@/styled-system/css'

interface WatermarkPreviewProps {
  type: 'text' | 'image' | 'qr'
  text?: string
  image?: File | null
  opacity: number
  rotation: number
  position:
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
    | 'diagonal'
  color: string
  fontSize: number
  pattern: boolean
  imageScale?: number
}

export function WatermarkPreview({
  type,
  text = '',
  image,
  opacity,
  rotation,
  position,
  color,
  fontSize,
  pattern,
  imageScale = 1.0,
}: WatermarkPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // A4 aspect ratio (210mm x 297mm)
    const width = 400
    const height = 566

    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw mock page background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Draw border
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, width, height)

    // Draw some mock content lines
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 1
    for (let i = 60; i < height - 60; i += 30) {
      ctx.beginPath()
      ctx.moveTo(40, i)
      ctx.lineTo(width - 40, i)
      ctx.stroke()
    }

    // Calculate watermark positions
    const getPosition = () => {
      const margin = 40
      const centerX = width / 2
      const centerY = height / 2

      switch (position) {
        case 'top-left':
          return { x: margin, y: margin }
        case 'top':
          return { x: centerX, y: margin }
        case 'top-right':
          return { x: width - margin, y: margin }
        case 'left':
          return { x: margin, y: centerY }
        case 'center':
          return { x: centerX, y: centerY }
        case 'right':
          return { x: width - margin, y: centerY }
        case 'bottom-left':
          return { x: margin, y: height - margin }
        case 'bottom':
          return { x: centerX, y: height - margin }
        case 'bottom-right':
          return { x: width - margin, y: height - margin }
        case 'diagonal':
          return { x: centerX, y: centerY }
        default:
          return { x: centerX, y: centerY }
      }
    }

    const drawWatermark = (x: number, y: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.globalAlpha = opacity

      if (type === 'text' && text) {
        ctx.font = `bold ${fontSize}px Arial`
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, 0, 0)
      } else if (type === 'image' || type === 'qr') {
        if (imageRef.current) {
          const imgWidth = imageRef.current.width * imageScale * 0.3
          const imgHeight = imageRef.current.height * imageScale * 0.3
          ctx.drawImage(imageRef.current, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
        }
      }

      ctx.restore()
    }

    const pos = getPosition()

    if (pattern && type === 'text') {
      // Draw pattern/tiling
      const spacingX = 200
      const spacingY = 150
      for (let px = 0; px < width; px += spacingX) {
        for (let py = 0; py < height; py += spacingY) {
          drawWatermark(px + 100, py + 75)
        }
      }
    } else {
      // Draw single watermark
      drawWatermark(pos.x, pos.y)
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: image is used in the second useEffect
  }, [type, text, opacity, rotation, position, color, fontSize, pattern, imageScale])

  // Load image for preview
  useEffect(() => {
    if ((type === 'image' || type === 'qr') && image) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          imageRef.current = img
          // Trigger canvas redraw
          const canvas = canvasRef.current
          if (canvas) {
            const event = new CustomEvent('imageLoaded')
            canvas.dispatchEvent(event)
          }
        }
        if (e.target?.result) {
          img.src = e.target.result as string
        }
      }
      reader.readAsDataURL(image)
    } else {
      imageRef.current = null
    }
  }, [type, image])

  return (
    <div className={css({ spaceY: '3' })}>
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'white',
        })}
      >
        <Eye className={css({ w: '4', h: '4', color: 'blue.400' })} />
        <span>Live Preview</span>
      </div>

      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: '4',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'gray.700',
          bg: 'gray.800/30',
          backdropFilter: 'blur(4px)',
        })}
      >
        <canvas
          ref={canvasRef}
          className={css({
            maxW: 'full',
            h: 'auto',
            borderRadius: 'md',
            boxShadow: 'lg',
          })}
        />
      </div>

      <div
        className={css({
          fontSize: 'xs',
          color: 'white',
          fontStyle: 'italic',
        })}
      >
        Preview shows how the watermark will appear on your PDF
      </div>
    </div>
  )
}

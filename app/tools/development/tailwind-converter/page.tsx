'use client'

import { ArrowRight, Copy, Palette, RotateCcw, Sparkles, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { RelatedTools } from '@/components/ui/related-tools'
import { Textarea } from '@/components/ui/textarea'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { css } from '@/styled-system/css'

// CSS property to Tailwind class mappings
const spacingScale: Record<string, string> = {
  '0': '0',
  '0px': '0',
  '1px': 'px',
  '2px': '0.5',
  '4px': '1',
  '6px': '1.5',
  '8px': '2',
  '10px': '2.5',
  '12px': '3',
  '14px': '3.5',
  '16px': '4',
  '20px': '5',
  '24px': '6',
  '28px': '7',
  '32px': '8',
  '36px': '9',
  '40px': '10',
  '44px': '11',
  '48px': '12',
  '56px': '14',
  '64px': '16',
  '80px': '20',
  '96px': '24',
  '112px': '28',
  '128px': '32',
  '144px': '36',
  '160px': '40',
  '176px': '44',
  '192px': '48',
  '208px': '52',
  '224px': '56',
  '240px': '60',
  '256px': '64',
  '288px': '72',
  '320px': '80',
  '384px': '96',
  '0.125rem': '0.5',
  '0.25rem': '1',
  '0.375rem': '1.5',
  '0.5rem': '2',
  '0.625rem': '2.5',
  '0.75rem': '3',
  '0.875rem': '3.5',
  '1rem': '4',
  '1.25rem': '5',
  '1.5rem': '6',
  '1.75rem': '7',
  '2rem': '8',
  '2.25rem': '9',
  '2.5rem': '10',
  '2.75rem': '11',
  '3rem': '12',
  '3.5rem': '14',
  '4rem': '16',
  '5rem': '20',
  '6rem': '24',
  '7rem': '28',
  '8rem': '32',
  '9rem': '36',
  '10rem': '40',
  '11rem': '44',
  '12rem': '48',
  '13rem': '52',
  '14rem': '56',
  '15rem': '60',
  '16rem': '64',
  '18rem': '72',
  '20rem': '80',
  '24rem': '96',
  auto: 'auto',
}

const fontSizeMap: Record<string, string> = {
  '12px': 'text-xs',
  '14px': 'text-sm',
  '16px': 'text-base',
  '18px': 'text-lg',
  '20px': 'text-xl',
  '24px': 'text-2xl',
  '30px': 'text-3xl',
  '36px': 'text-4xl',
  '48px': 'text-5xl',
  '60px': 'text-6xl',
  '72px': 'text-7xl',
  '96px': 'text-8xl',
  '128px': 'text-9xl',
  '0.75rem': 'text-xs',
  '0.875rem': 'text-sm',
  '1rem': 'text-base',
  '1.125rem': 'text-lg',
  '1.25rem': 'text-xl',
  '1.5rem': 'text-2xl',
  '1.875rem': 'text-3xl',
  '2.25rem': 'text-4xl',
  '3rem': 'text-5xl',
  '3.75rem': 'text-6xl',
  '4.5rem': 'text-7xl',
  '6rem': 'text-8xl',
  '8rem': 'text-9xl',
}

const fontWeightMap: Record<string, string> = {
  '100': 'font-thin',
  '200': 'font-extralight',
  '300': 'font-light',
  '400': 'font-normal',
  '500': 'font-medium',
  '600': 'font-semibold',
  '700': 'font-bold',
  '800': 'font-extrabold',
  '900': 'font-black',
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
}

const borderRadiusMap: Record<string, string> = {
  '0': 'rounded-none',
  '0px': 'rounded-none',
  '2px': 'rounded-sm',
  '4px': 'rounded',
  '6px': 'rounded-md',
  '8px': 'rounded-lg',
  '12px': 'rounded-xl',
  '16px': 'rounded-2xl',
  '24px': 'rounded-3xl',
  '9999px': 'rounded-full',
  '50%': 'rounded-full',
  '0.125rem': 'rounded-sm',
  '0.25rem': 'rounded',
  '0.375rem': 'rounded-md',
  '0.5rem': 'rounded-lg',
  '0.75rem': 'rounded-xl',
  '1rem': 'rounded-2xl',
  '1.5rem': 'rounded-3xl',
}

const colorMap: Record<string, string> = {
  white: 'white',
  black: 'black',
  transparent: 'transparent',
  '#000': 'black',
  '#000000': 'black',
  '#fff': 'white',
  '#ffffff': 'white',
  '#f8fafc': 'slate-50',
  '#f1f5f9': 'slate-100',
  '#e2e8f0': 'slate-200',
  '#cbd5e1': 'slate-300',
  '#94a3b8': 'slate-400',
  '#64748b': 'slate-500',
  '#475569': 'slate-600',
  '#334155': 'slate-700',
  '#1e293b': 'slate-800',
  '#0f172a': 'slate-900',
  '#fef2f2': 'red-50',
  '#fee2e2': 'red-100',
  '#fecaca': 'red-200',
  '#fca5a5': 'red-300',
  '#f87171': 'red-400',
  '#ef4444': 'red-500',
  '#dc2626': 'red-600',
  '#b91c1c': 'red-700',
  '#991b1b': 'red-800',
  '#7f1d1d': 'red-900',
  '#ecfdf5': 'green-50',
  '#d1fae5': 'green-100',
  '#a7f3d0': 'green-200',
  '#6ee7b7': 'green-300',
  '#34d399': 'green-400',
  '#10b981': 'green-500',
  '#059669': 'green-600',
  '#047857': 'green-700',
  '#065f46': 'green-800',
  '#064e3b': 'green-900',
  '#eff6ff': 'blue-50',
  '#dbeafe': 'blue-100',
  '#bfdbfe': 'blue-200',
  '#93c5fd': 'blue-300',
  '#60a5fa': 'blue-400',
  '#3b82f6': 'blue-500',
  '#2563eb': 'blue-600',
  '#1d4ed8': 'blue-700',
  '#1e40af': 'blue-800',
  '#1e3a8a': 'blue-900',
}

interface ConversionResult {
  original: string
  tailwind: string
  success: boolean
  note?: string
}

interface HistoryItem {
  id: string
  cssInput: string
  tailwindOutput: string
  timestamp: number
}

const HISTORY_KEY = 'tailwind-converter-history'
const MAX_HISTORY = 10

function getSpacingClass(prefix: string, value: string): string | null {
  const normalizedValue = value.trim().toLowerCase()
  const scale = spacingScale[normalizedValue]
  if (scale) {
    return `${prefix}-${scale}`
  }
  return null
}

function convertCSSProperty(property: string, value: string): ConversionResult {
  const prop = property.trim().toLowerCase()
  const val = value.trim().toLowerCase()

  // Display
  if (prop === 'display') {
    const displayMap: Record<string, string> = {
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      'inline-grid': 'inline-grid',
      block: 'block',
      'inline-block': 'inline-block',
      inline: 'inline',
      none: 'hidden',
      contents: 'contents',
      'flow-root': 'flow-root',
      table: 'table',
      'table-row': 'table-row',
      'table-cell': 'table-cell',
    }
    if (displayMap[val]) {
      return { original: `${property}: ${value}`, tailwind: displayMap[val], success: true }
    }
  }

  // Position
  if (prop === 'position') {
    const posMap: Record<string, string> = {
      static: 'static',
      relative: 'relative',
      absolute: 'absolute',
      fixed: 'fixed',
      sticky: 'sticky',
    }
    if (posMap[val]) {
      return { original: `${property}: ${value}`, tailwind: posMap[val], success: true }
    }
  }

  // Flex direction
  if (prop === 'flex-direction') {
    const flexDirMap: Record<string, string> = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      column: 'flex-col',
      'column-reverse': 'flex-col-reverse',
    }
    if (flexDirMap[val]) {
      return { original: `${property}: ${value}`, tailwind: flexDirMap[val], success: true }
    }
  }

  // Flex wrap
  if (prop === 'flex-wrap') {
    const flexWrapMap: Record<string, string> = {
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
      nowrap: 'flex-nowrap',
    }
    if (flexWrapMap[val]) {
      return { original: `${property}: ${value}`, tailwind: flexWrapMap[val], success: true }
    }
  }

  // Justify content
  if (prop === 'justify-content') {
    const justifyMap: Record<string, string> = {
      'flex-start': 'justify-start',
      'flex-end': 'justify-end',
      center: 'justify-center',
      'space-between': 'justify-between',
      'space-around': 'justify-around',
      'space-evenly': 'justify-evenly',
      start: 'justify-start',
      end: 'justify-end',
      stretch: 'justify-stretch',
    }
    if (justifyMap[val]) {
      return { original: `${property}: ${value}`, tailwind: justifyMap[val], success: true }
    }
  }

  // Align items
  if (prop === 'align-items') {
    const alignMap: Record<string, string> = {
      'flex-start': 'items-start',
      'flex-end': 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
      start: 'items-start',
      end: 'items-end',
    }
    if (alignMap[val]) {
      return { original: `${property}: ${value}`, tailwind: alignMap[val], success: true }
    }
  }

  // Align self
  if (prop === 'align-self') {
    const alignSelfMap: Record<string, string> = {
      auto: 'self-auto',
      'flex-start': 'self-start',
      'flex-end': 'self-end',
      center: 'self-center',
      baseline: 'self-baseline',
      stretch: 'self-stretch',
    }
    if (alignSelfMap[val]) {
      return { original: `${property}: ${value}`, tailwind: alignSelfMap[val], success: true }
    }
  }

  // Gap
  if (prop === 'gap') {
    const gapClass = getSpacingClass('gap', val)
    if (gapClass) {
      return { original: `${property}: ${value}`, tailwind: gapClass, success: true }
    }
  }

  if (prop === 'row-gap') {
    const gapClass = getSpacingClass('gap-y', val)
    if (gapClass) {
      return { original: `${property}: ${value}`, tailwind: gapClass, success: true }
    }
  }

  if (prop === 'column-gap') {
    const gapClass = getSpacingClass('gap-x', val)
    if (gapClass) {
      return { original: `${property}: ${value}`, tailwind: gapClass, success: true }
    }
  }

  // Margin
  if (prop === 'margin') {
    const marginClass = getSpacingClass('m', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-top') {
    const marginClass = getSpacingClass('mt', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-right') {
    const marginClass = getSpacingClass('mr', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-bottom') {
    const marginClass = getSpacingClass('mb', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-left') {
    const marginClass = getSpacingClass('ml', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-inline') {
    const marginClass = getSpacingClass('mx', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  if (prop === 'margin-block') {
    const marginClass = getSpacingClass('my', val)
    if (marginClass) {
      return { original: `${property}: ${value}`, tailwind: marginClass, success: true }
    }
  }

  // Padding
  if (prop === 'padding') {
    const paddingClass = getSpacingClass('p', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-top') {
    const paddingClass = getSpacingClass('pt', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-right') {
    const paddingClass = getSpacingClass('pr', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-bottom') {
    const paddingClass = getSpacingClass('pb', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-left') {
    const paddingClass = getSpacingClass('pl', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-inline') {
    const paddingClass = getSpacingClass('px', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  if (prop === 'padding-block') {
    const paddingClass = getSpacingClass('py', val)
    if (paddingClass) {
      return { original: `${property}: ${value}`, tailwind: paddingClass, success: true }
    }
  }

  // Width
  if (prop === 'width') {
    if (val === '100%')
      return { original: `${property}: ${value}`, tailwind: 'w-full', success: true }
    if (val === '100vw')
      return { original: `${property}: ${value}`, tailwind: 'w-screen', success: true }
    if (val === 'auto')
      return { original: `${property}: ${value}`, tailwind: 'w-auto', success: true }
    if (val === 'min-content')
      return { original: `${property}: ${value}`, tailwind: 'w-min', success: true }
    if (val === 'max-content')
      return { original: `${property}: ${value}`, tailwind: 'w-max', success: true }
    if (val === 'fit-content')
      return { original: `${property}: ${value}`, tailwind: 'w-fit', success: true }
    const widthClass = getSpacingClass('w', val)
    if (widthClass) {
      return { original: `${property}: ${value}`, tailwind: widthClass, success: true }
    }
  }

  // Height
  if (prop === 'height') {
    if (val === '100%')
      return { original: `${property}: ${value}`, tailwind: 'h-full', success: true }
    if (val === '100vh')
      return { original: `${property}: ${value}`, tailwind: 'h-screen', success: true }
    if (val === 'auto')
      return { original: `${property}: ${value}`, tailwind: 'h-auto', success: true }
    if (val === 'min-content')
      return { original: `${property}: ${value}`, tailwind: 'h-min', success: true }
    if (val === 'max-content')
      return { original: `${property}: ${value}`, tailwind: 'h-max', success: true }
    if (val === 'fit-content')
      return { original: `${property}: ${value}`, tailwind: 'h-fit', success: true }
    const heightClass = getSpacingClass('h', val)
    if (heightClass) {
      return { original: `${property}: ${value}`, tailwind: heightClass, success: true }
    }
  }

  // Min/Max width/height
  if (prop === 'min-width') {
    if (val === '100%')
      return { original: `${property}: ${value}`, tailwind: 'min-w-full', success: true }
    if (val === '0')
      return { original: `${property}: ${value}`, tailwind: 'min-w-0', success: true }
    if (val === 'min-content')
      return { original: `${property}: ${value}`, tailwind: 'min-w-min', success: true }
    if (val === 'max-content')
      return { original: `${property}: ${value}`, tailwind: 'min-w-max', success: true }
    if (val === 'fit-content')
      return { original: `${property}: ${value}`, tailwind: 'min-w-fit', success: true }
  }

  if (prop === 'max-width') {
    if (val === '100%')
      return { original: `${property}: ${value}`, tailwind: 'max-w-full', success: true }
    if (val === 'none')
      return { original: `${property}: ${value}`, tailwind: 'max-w-none', success: true }
    if (val === 'min-content')
      return { original: `${property}: ${value}`, tailwind: 'max-w-min', success: true }
    if (val === 'max-content')
      return { original: `${property}: ${value}`, tailwind: 'max-w-max', success: true }
    if (val === 'fit-content')
      return { original: `${property}: ${value}`, tailwind: 'max-w-fit', success: true }
  }

  // Font size
  if (prop === 'font-size') {
    if (fontSizeMap[val]) {
      return { original: `${property}: ${value}`, tailwind: fontSizeMap[val], success: true }
    }
  }

  // Font weight
  if (prop === 'font-weight') {
    if (fontWeightMap[val]) {
      return { original: `${property}: ${value}`, tailwind: fontWeightMap[val], success: true }
    }
  }

  // Text align
  if (prop === 'text-align') {
    const textAlignMap: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
      start: 'text-start',
      end: 'text-end',
    }
    if (textAlignMap[val]) {
      return { original: `${property}: ${value}`, tailwind: textAlignMap[val], success: true }
    }
  }

  // Text decoration
  if (prop === 'text-decoration') {
    const textDecoMap: Record<string, string> = {
      underline: 'underline',
      'line-through': 'line-through',
      none: 'no-underline',
      overline: 'overline',
    }
    if (textDecoMap[val]) {
      return { original: `${property}: ${value}`, tailwind: textDecoMap[val], success: true }
    }
  }

  // Text transform
  if (prop === 'text-transform') {
    const textTransformMap: Record<string, string> = {
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
      none: 'normal-case',
    }
    if (textTransformMap[val]) {
      return { original: `${property}: ${value}`, tailwind: textTransformMap[val], success: true }
    }
  }

  // Color
  if (prop === 'color') {
    const colorClass = colorMap[val]
    if (colorClass) {
      return { original: `${property}: ${value}`, tailwind: `text-${colorClass}`, success: true }
    }
  }

  // Background color
  if (prop === 'background-color' || prop === 'background') {
    const colorClass = colorMap[val]
    if (colorClass) {
      return { original: `${property}: ${value}`, tailwind: `bg-${colorClass}`, success: true }
    }
  }

  // Border radius
  if (prop === 'border-radius') {
    if (borderRadiusMap[val]) {
      return { original: `${property}: ${value}`, tailwind: borderRadiusMap[val], success: true }
    }
  }

  // Border
  if (prop === 'border') {
    if (val === 'none' || val === '0') {
      return { original: `${property}: ${value}`, tailwind: 'border-0', success: true }
    }
    if (val.includes('1px solid')) {
      return {
        original: `${property}: ${value}`,
        tailwind: 'border',
        success: true,
        note: 'Border color may need manual adjustment',
      }
    }
  }

  if (prop === 'border-width') {
    const borderWidthMap: Record<string, string> = {
      '0': 'border-0',
      '0px': 'border-0',
      '1px': 'border',
      '2px': 'border-2',
      '4px': 'border-4',
      '8px': 'border-8',
    }
    if (borderWidthMap[val]) {
      return { original: `${property}: ${value}`, tailwind: borderWidthMap[val], success: true }
    }
  }

  // Overflow
  if (prop === 'overflow') {
    const overflowMap: Record<string, string> = {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
      scroll: 'overflow-scroll',
      clip: 'overflow-clip',
    }
    if (overflowMap[val]) {
      return { original: `${property}: ${value}`, tailwind: overflowMap[val], success: true }
    }
  }

  if (prop === 'overflow-x') {
    const overflowMap: Record<string, string> = {
      auto: 'overflow-x-auto',
      hidden: 'overflow-x-hidden',
      visible: 'overflow-x-visible',
      scroll: 'overflow-x-scroll',
      clip: 'overflow-x-clip',
    }
    if (overflowMap[val]) {
      return { original: `${property}: ${value}`, tailwind: overflowMap[val], success: true }
    }
  }

  if (prop === 'overflow-y') {
    const overflowMap: Record<string, string> = {
      auto: 'overflow-y-auto',
      hidden: 'overflow-y-hidden',
      visible: 'overflow-y-visible',
      scroll: 'overflow-y-scroll',
      clip: 'overflow-y-clip',
    }
    if (overflowMap[val]) {
      return { original: `${property}: ${value}`, tailwind: overflowMap[val], success: true }
    }
  }

  // Cursor
  if (prop === 'cursor') {
    const cursorMap: Record<string, string> = {
      auto: 'cursor-auto',
      default: 'cursor-default',
      pointer: 'cursor-pointer',
      wait: 'cursor-wait',
      text: 'cursor-text',
      move: 'cursor-move',
      help: 'cursor-help',
      'not-allowed': 'cursor-not-allowed',
      none: 'cursor-none',
      progress: 'cursor-progress',
      cell: 'cursor-cell',
      crosshair: 'cursor-crosshair',
      'vertical-text': 'cursor-vertical-text',
      alias: 'cursor-alias',
      copy: 'cursor-copy',
      'no-drop': 'cursor-no-drop',
      grab: 'cursor-grab',
      grabbing: 'cursor-grabbing',
    }
    if (cursorMap[val]) {
      return { original: `${property}: ${value}`, tailwind: cursorMap[val], success: true }
    }
  }

  // Opacity
  if (prop === 'opacity') {
    const opacityNum = parseFloat(val)
    if (!Number.isNaN(opacityNum)) {
      const opacityClass = Math.round(opacityNum * 100)
      const validOpacities = [
        0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
      ]
      const closest = validOpacities.reduce((prev, curr) =>
        Math.abs(curr - opacityClass) < Math.abs(prev - opacityClass) ? curr : prev
      )
      return { original: `${property}: ${value}`, tailwind: `opacity-${closest}`, success: true }
    }
  }

  // Z-index
  if (prop === 'z-index') {
    const zMap: Record<string, string> = {
      '0': 'z-0',
      '10': 'z-10',
      '20': 'z-20',
      '30': 'z-30',
      '40': 'z-40',
      '50': 'z-50',
      auto: 'z-auto',
    }
    if (zMap[val]) {
      return { original: `${property}: ${value}`, tailwind: zMap[val], success: true }
    }
  }

  // Flex
  if (prop === 'flex') {
    const flexMap: Record<string, string> = {
      '1': 'flex-1',
      '1 1 0%': 'flex-1',
      auto: 'flex-auto',
      '1 1 auto': 'flex-auto',
      initial: 'flex-initial',
      '0 1 auto': 'flex-initial',
      none: 'flex-none',
      '0 0 auto': 'flex-none',
    }
    if (flexMap[val]) {
      return { original: `${property}: ${value}`, tailwind: flexMap[val], success: true }
    }
  }

  // Flex grow/shrink
  if (prop === 'flex-grow') {
    if (val === '0') return { original: `${property}: ${value}`, tailwind: 'grow-0', success: true }
    if (val === '1') return { original: `${property}: ${value}`, tailwind: 'grow', success: true }
  }

  if (prop === 'flex-shrink') {
    if (val === '0')
      return { original: `${property}: ${value}`, tailwind: 'shrink-0', success: true }
    if (val === '1') return { original: `${property}: ${value}`, tailwind: 'shrink', success: true }
  }

  // Object fit
  if (prop === 'object-fit') {
    const objectFitMap: Record<string, string> = {
      contain: 'object-contain',
      cover: 'object-cover',
      fill: 'object-fill',
      none: 'object-none',
      'scale-down': 'object-scale-down',
    }
    if (objectFitMap[val]) {
      return { original: `${property}: ${value}`, tailwind: objectFitMap[val], success: true }
    }
  }

  // Visibility
  if (prop === 'visibility') {
    if (val === 'visible')
      return { original: `${property}: ${value}`, tailwind: 'visible', success: true }
    if (val === 'hidden')
      return { original: `${property}: ${value}`, tailwind: 'invisible', success: true }
    if (val === 'collapse')
      return { original: `${property}: ${value}`, tailwind: 'collapse', success: true }
  }

  // White space
  if (prop === 'white-space') {
    const wsMap: Record<string, string> = {
      normal: 'whitespace-normal',
      nowrap: 'whitespace-nowrap',
      pre: 'whitespace-pre',
      'pre-line': 'whitespace-pre-line',
      'pre-wrap': 'whitespace-pre-wrap',
      'break-spaces': 'whitespace-break-spaces',
    }
    if (wsMap[val]) {
      return { original: `${property}: ${value}`, tailwind: wsMap[val], success: true }
    }
  }

  // Word break
  if (prop === 'word-break') {
    if (val === 'break-all')
      return { original: `${property}: ${value}`, tailwind: 'break-all', success: true }
    if (val === 'keep-all')
      return { original: `${property}: ${value}`, tailwind: 'break-keep', success: true }
    if (val === 'normal')
      return { original: `${property}: ${value}`, tailwind: 'break-normal', success: true }
  }

  // Pointer events
  if (prop === 'pointer-events') {
    if (val === 'none')
      return { original: `${property}: ${value}`, tailwind: 'pointer-events-none', success: true }
    if (val === 'auto')
      return { original: `${property}: ${value}`, tailwind: 'pointer-events-auto', success: true }
  }

  // User select
  if (prop === 'user-select') {
    const selectMap: Record<string, string> = {
      none: 'select-none',
      text: 'select-text',
      all: 'select-all',
      auto: 'select-auto',
    }
    if (selectMap[val]) {
      return { original: `${property}: ${value}`, tailwind: selectMap[val], success: true }
    }
  }

  // Return failure for unrecognized property
  return {
    original: `${property}: ${value}`,
    tailwind: '',
    success: false,
    note: 'Property not recognized or value needs manual conversion',
  }
}

function convertCSS(cssInput: string): { results: ConversionResult[]; tailwindClasses: string } {
  const results: ConversionResult[] = []
  const successfulClasses: string[] = []

  // Parse CSS - handle both single properties and full selectors
  const cssText = cssInput
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\{[\s\S]*?\}/g, (match) => match) // Keep content inside braces

  // Extract just the properties (remove selectors)
  let properties = cssText
  const braceMatch = cssText.match(/\{([\s\S]*?)\}/)
  if (braceMatch) {
    properties = braceMatch[1]
  }

  // Split by semicolons and newlines
  const lines = properties.split(/[;\n]/).filter((line) => line.trim())

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue

    // Parse property: value
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const property = trimmed.slice(0, colonIndex).trim()
    const value = trimmed
      .slice(colonIndex + 1)
      .trim()
      .replace(/;$/, '')

    if (!property || !value) continue

    const result = convertCSSProperty(property, value)
    results.push(result)

    if (result.success && result.tailwind) {
      successfulClasses.push(result.tailwind)
    }
  }

  return {
    results,
    tailwindClasses: successfulClasses.join(' '),
  }
}

const cssExamples = [
  {
    name: 'Flexbox Center',
    css: `display: flex;
justify-content: center;
align-items: center;
gap: 16px;`,
  },
  {
    name: 'Card Style',
    css: `padding: 24px;
border-radius: 8px;
background-color: white;
border: 1px solid;`,
  },
  {
    name: 'Typography',
    css: `font-size: 18px;
font-weight: 600;
text-align: center;
color: black;`,
  },
  {
    name: 'Layout Box',
    css: `width: 100%;
max-width: fit-content;
margin: 0;
padding: 16px;
overflow: hidden;`,
  },
  {
    name: 'Button Style',
    css: `display: inline-flex;
padding: 8px;
border-radius: 6px;
cursor: pointer;
font-weight: 500;`,
  },
  {
    name: 'Grid Layout',
    css: `display: grid;
gap: 24px;
padding: 32px;`,
  },
]

const faqs = [
  {
    question: 'How does the CSS to Tailwind converter work?',
    answer:
      'The converter parses your CSS properties and maps them to equivalent Tailwind utility classes. It supports common properties like display, flexbox, spacing (margin/padding), typography, colors, borders, and more. Simply paste your CSS and get instant Tailwind classes.',
  },
  {
    question: 'Which CSS properties are supported?',
    answer:
      'We support most common CSS properties including: display, position, flexbox (direction, wrap, justify, align), grid, spacing (margin, padding, gap), width/height, typography (font-size, font-weight, text-align), colors, borders, border-radius, overflow, cursor, opacity, z-index, and many more.',
  },
  {
    question: 'What if a CSS property cannot be converted?',
    answer:
      "Properties that cannot be automatically converted will be marked as unsuccessful in the results. This typically happens with custom values, complex shorthand properties, or CSS features that require arbitrary values in Tailwind. You can manually add these using Tailwind's arbitrary value syntax like `[property:value]`.",
  },
  {
    question: 'Does this support CSS variables or custom properties?',
    answer:
      "Currently, the converter focuses on standard CSS values. CSS variables (custom properties) need to be manually converted to Tailwind's theme configuration or arbitrary values. We recommend defining your design tokens in tailwind.config.js for consistent theming.",
  },
  {
    question: 'Is my CSS data stored or sent to a server?',
    answer:
      "No! All conversion happens entirely in your browser using JavaScript. Your CSS code never leaves your device. We only store your conversion history locally in your browser's localStorage for convenience, and you can clear it anytime.",
  },
]

export default function TailwindConverter() {
  useTrackToolView({
    toolId: 'tailwind-converter',
    title: 'Tailwind CSS Converter',
    href: '/tools/development/tailwind-converter',
    iconName: 'Palette',
    gradient: 'from-cyan-500 to-blue-500',
  })

  const [cssInput, setCssInput] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>([])

  // Load history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (stored) {
      try {
        setHistory(JSON.parse(stored))
      } catch {
        // Invalid stored data, ignore
      }
    }
  }, [])

  // Save history to localStorage
  const saveToHistory = useCallback(
    (css: string, tailwind: string) => {
      if (!css.trim() || !tailwind.trim()) return

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        cssInput: css,
        tailwindOutput: tailwind,
        timestamp: Date.now(),
      }

      const updatedHistory = [newItem, ...history.filter((h) => h.cssInput !== css)].slice(
        0,
        MAX_HISTORY
      )
      setHistory(updatedHistory)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
    },
    [history]
  )

  // Conversion results
  const { results, tailwindClasses } = useMemo(() => {
    if (!cssInput.trim()) {
      return { results: [], tailwindClasses: '' }
    }
    return convertCSS(cssInput)
  }, [cssInput])

  // Stats
  const stats = useMemo(() => {
    const total = results.length
    const successful = results.filter((r) => r.success).length
    const failed = total - successful
    return { total, successful, failed }
  }, [results])

  const handleCopy = () => {
    if (!tailwindClasses) {
      toast.error('No Tailwind classes to copy')
      return
    }
    navigator.clipboard.writeText(tailwindClasses)
    toast.success('Tailwind classes copied!')
    saveToHistory(cssInput, tailwindClasses)
  }

  const handleClear = () => {
    setCssInput('')
    toast.info('Input cleared')
  }

  const handleClearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
    toast.info('History cleared')
  }

  const handleLoadExample = (css: string) => {
    setCssInput(css)
    toast.success('Example loaded')
  }

  const handleLoadFromHistory = (item: HistoryItem) => {
    setCssInput(item.cssInput)
    toast.success('Loaded from history')
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'cyan.500/30',
            bg: 'cyan.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Palette className={css({ h: '5', w: '5', color: 'cyan.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'cyan.300',
            })}
          >
            CSS to Tailwind
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'cyan.400',
            gradientVia: 'blue.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Tailwind CSS Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Convert your CSS properties to Tailwind utility classes instantly. Paste CSS and get
          clean, optimized Tailwind output.
        </p>
      </div>

      {/* Main Tool Area */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Input Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <span>CSS Input</span>
              {stats.total > 0 && (
                <Badge variant="outline" className={css({ ml: 'auto' })}>
                  {stats.total} properties
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Paste your CSS properties or full CSS blocks</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <Textarea
              placeholder={`display: flex;
justify-content: center;
align-items: center;
gap: 16px;
padding: 24px;`}
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              className={css({
                minH: '200px',
                fontFamily: 'mono',
                fontSize: 'sm',
                resize: 'vertical',
              })}
            />
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              <Button
                onClick={handleClear}
                variant="outline"
                className={css({ gap: '2', minH: '11' })}
              >
                <RotateCcw className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'purple.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <span>Tailwind Output</span>
              {stats.total > 0 && (
                <div className={css({ display: 'flex', gap: '2', ml: 'auto' })}>
                  <Badge
                    variant="default"
                    className={css({ bg: 'green.500/20', color: 'green.400' })}
                  >
                    {stats.successful} converted
                  </Badge>
                  {stats.failed > 0 && (
                    <Badge
                      variant="outline"
                      className={css({ borderColor: 'orange.500/50', color: 'orange.400' })}
                    >
                      {stats.failed} manual
                    </Badge>
                  )}
                </div>
              )}
            </CardTitle>
            <CardDescription>Copy the generated Tailwind classes</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            {/* Combined Classes */}
            <div
              className={css({
                p: '4',
                rounded: 'lg',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700/50',
                minH: '80px',
              })}
            >
              {tailwindClasses ? (
                <code
                  className={css({
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'cyan.300',
                    wordBreak: 'break-all',
                  })}
                >
                  {tailwindClasses}
                </code>
              ) : (
                <span className={css({ color: 'gray.500', fontSize: 'sm' })}>
                  Tailwind classes will appear here...
                </span>
              )}
            </div>

            <Button
              onClick={handleCopy}
              disabled={!tailwindClasses}
              className={css({ gap: '2', w: 'full', minH: '11' })}
            >
              <Copy className={css({ h: '4', w: '4' })} />
              Copy Tailwind Classes
            </Button>

            {/* Detailed Results */}
            {results.length > 0 && (
              <div className={css({ spaceY: '2' })}>
                <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}>
                  Conversion Details
                </div>
                <div
                  className={css({
                    maxH: '200px',
                    overflow: 'auto',
                    rounded: 'lg',
                    bg: 'gray.800/30',
                    p: '3',
                    spaceY: '2',
                  })}
                >
                  {results.map((result, index) => (
                    <div
                      key={`result-${result.original}-${index}`}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'xs',
                        fontFamily: 'mono',
                        p: '2',
                        rounded: 'md',
                        bg: result.success ? 'green.500/10' : 'orange.500/10',
                        border: '1px solid',
                        borderColor: result.success ? 'green.500/20' : 'orange.500/20',
                      })}
                    >
                      <span className={css({ color: 'gray.400', flexShrink: '0' })}>
                        {result.original}
                      </span>
                      <ArrowRight
                        className={css({ h: '3', w: '3', color: 'gray.500', flexShrink: '0' })}
                      />
                      {result.success ? (
                        <span className={css({ color: 'cyan.300' })}>{result.tailwind}</span>
                      ) : (
                        <span className={css({ color: 'orange.400', fontStyle: 'italic' })}>
                          {result.note || 'Manual conversion needed'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Examples */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Sparkles className={css({ h: '5', w: '5', color: 'blue.400' })} />
            CSS Examples
          </CardTitle>
          <CardDescription>Click an example to load it into the converter</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: '4',
              w: 'full',
            })}
          >
            {cssExamples.map((example) => (
              <button
                type="button"
                key={example.name}
                onClick={() => handleLoadExample(example.css)}
                className={css({
                  p: '4',
                  rounded: 'lg',
                  bg: 'gray.800/50',
                  border: '1px solid',
                  borderColor: 'gray.700/50',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  _hover: {
                    borderColor: 'blue.500/50',
                    bg: 'gray.800/80',
                  },
                })}
              >
                <div className={css({ fontWeight: 'medium', color: 'white', mb: '2' })}>
                  {example.name}
                </div>
                <pre
                  className={css({
                    fontSize: 'xs',
                    fontFamily: 'mono',
                    color: 'gray.400',
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxH: '80px',
                  })}
                >
                  {example.css}
                </pre>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <div>
                <CardTitle>Conversion History</CardTitle>
                <CardDescription>Your recent conversions (stored locally)</CardDescription>
              </div>
              <Button
                onClick={handleClearHistory}
                variant="ghost"
                size="sm"
                className={css({ gap: '2' })}
              >
                <Trash2 className={css({ h: '4', w: '4' })} />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className={css({ spaceY: '3' })}>
              {history.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleLoadFromHistory(item)}
                  className={css({
                    w: 'full',
                    p: '3',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700/50',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    _hover: {
                      borderColor: 'cyan.500/50',
                      bg: 'gray.800/80',
                    },
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <div className={css({ flex: '1', minW: '0' })}>
                      <div
                        className={css({
                          fontSize: 'xs',
                          fontFamily: 'mono',
                          color: 'gray.400',
                          truncate: true,
                          mb: '1',
                        })}
                      >
                        {item.cssInput.split('\n')[0]}...
                      </div>
                      <div
                        className={css({
                          fontSize: 'sm',
                          fontFamily: 'mono',
                          color: 'cyan.300',
                          truncate: true,
                        })}
                      >
                        {item.tailwindOutput}
                      </div>
                    </div>
                    <div className={css({ fontSize: 'xs', color: 'gray.500', flexShrink: '0' })}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <FAQAccordion faqs={faqs} />

      {/* Related Tools */}
      <RelatedTools
        currentToolPath="/tools/development/tailwind-converter"
        category="development"
      />

      {/* Rating */}
      <ToolRating
        toolId="/tools/development/tailwind-converter"
        toolName="Tailwind CSS Converter"
      />

      {/* Search */}
      <ToolSearch />
    </main>
  )
}

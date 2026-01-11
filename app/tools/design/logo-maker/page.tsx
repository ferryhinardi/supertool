'use client'

import * as LucideIcons from 'lucide-react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowRight,
  Download,
  Palette,
  RefreshCw,
  Search,
  Sparkles,
  Type,
} from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Icon categories for better organization
const ICON_CATEGORIES = {
  business: [
    'Briefcase',
    'Building',
    'Building2',
    'Store',
    'Landmark',
    'PiggyBank',
    'Wallet',
    'CreditCard',
    'TrendingUp',
    'BarChart3',
    'LineChart',
    'Target',
    'Award',
    'Trophy',
    'Medal',
    'Crown',
  ],
  technology: [
    'Code',
    'Code2',
    'Terminal',
    'Cpu',
    'Database',
    'Server',
    'Cloud',
    'Wifi',
    'Globe',
    'Globe2',
    'Laptop',
    'Monitor',
    'Smartphone',
    'Tablet',
    'Bot',
    'Zap',
  ],
  creative: [
    'Palette',
    'Brush',
    'Pen',
    'PenTool',
    'Pencil',
    'Paintbrush',
    'Camera',
    'Image',
    'Video',
    'Music',
    'Music2',
    'Mic',
    'Film',
    'Clapperboard',
    'Sparkles',
    'Wand2',
  ],
  nature: [
    'Leaf',
    'TreeDeciduous',
    'Trees',
    'Flower',
    'Flower2',
    'Sun',
    'Moon',
    'Star',
    'Mountain',
    'CloudSun',
    'Droplet',
    'Waves',
    'Bird',
    'Fish',
    'Bug',
    'Feather',
  ],
  food: [
    'Coffee',
    'UtensilsCrossed',
    'ChefHat',
    'Pizza',
    'Apple',
    'Cake',
    'Cookie',
    'IceCream2',
    'Wine',
    'Beer',
    'Carrot',
    'Beef',
    'Egg',
    'Croissant',
    'Soup',
    'Salad',
  ],
  health: [
    'Heart',
    'HeartPulse',
    'Activity',
    'Stethoscope',
    'Pill',
    'Syringe',
    'Cross',
    'Hospital',
    'Dumbbell',
    'PersonStanding',
    'Footprints',
    'Apple',
    'Brain',
    'Eye',
    'Ear',
    'Hand',
  ],
  travel: [
    'Plane',
    'Car',
    'Bus',
    'Train',
    'Ship',
    'Bike',
    'Compass',
    'Map',
    'MapPin',
    'Navigation',
    'Luggage',
    'Tent',
    'Anchor',
    'Rocket',
    'Globe',
    'Earth',
  ],
  social: [
    'Users',
    'UserPlus',
    'MessageCircle',
    'MessageSquare',
    'Mail',
    'Send',
    'Share2',
    'ThumbsUp',
    'Heart',
    'Star',
    'Bell',
    'Gift',
    'PartyPopper',
    'Handshake',
    'Link',
    'AtSign',
  ],
} as const

// Web-safe fonts
const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
]

// Preset color palettes
const COLOR_PALETTES = [
  { name: 'Professional', primary: '#1e3a5f', secondary: '#3d5a80', accent: '#98c1d9' },
  { name: 'Modern', primary: '#2d3436', secondary: '#636e72', accent: '#00b894' },
  { name: 'Vibrant', primary: '#6c5ce7', secondary: '#a29bfe', accent: '#fd79a8' },
  { name: 'Nature', primary: '#00b894', secondary: '#55efc4', accent: '#81ecec' },
  { name: 'Sunset', primary: '#e17055', secondary: '#fdcb6e', accent: '#fab1a0' },
  { name: 'Ocean', primary: '#0984e3', secondary: '#74b9ff', accent: '#00cec9' },
  { name: 'Minimal', primary: '#2d3436', secondary: '#636e72', accent: '#ffffff' },
  { name: 'Bold', primary: '#d63031', secondary: '#e84393', accent: '#fdcb6e' },
]

type LayoutOption = 'horizontal' | 'vertical' | 'icon-only' | 'text-only'
type TextAlign = 'left' | 'center' | 'right'

interface IconItem {
  name: string
  component: React.ComponentType<LucideIcons.LucideProps>
}

export default function LogoMakerPage() {
  // Icon selection
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ICON_CATEGORIES>('business')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null)

  // Text customization
  const [brandName, setBrandName] = useState('Brand')
  const [tagline, setTagline] = useState('')
  const [selectedFont, setSelectedFont] = useState(FONTS[0])
  const [fontSize, setFontSize] = useState(48)
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('bold')
  const [textAlign, setTextAlign] = useState<TextAlign>('center')
  const [letterSpacing, _setLetterSpacing] = useState(0)

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#6c5ce7')
  const [secondaryColor, setSecondaryColor] = useState('#a29bfe')
  const [backgroundColor, setBackgroundColor] = useState('transparent')
  const [useGradient, _setUseGradient] = useState(false)

  // Layout
  const [layout, setLayout] = useState<LayoutOption>('horizontal')
  const [iconSize, setIconSize] = useState(64)
  const [iconStrokeWidth, setIconStrokeWidth] = useState(2)
  const [spacing, setSpacing] = useState(16)

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get all Lucide icons
  const allIcons = useMemo(() => {
    const icons: IconItem[] = []
    for (const [name, component] of Object.entries(LucideIcons)) {
      if (
        typeof component === 'function' &&
        name !== 'createLucideIcon' &&
        name !== 'default' &&
        !name.startsWith('Lucide')
      ) {
        icons.push({ name, component: component as React.ComponentType<LucideIcons.LucideProps> })
      }
    }
    return icons
  }, [])

  // Filter icons by category or search
  const filteredIcons = useMemo(() => {
    if (searchQuery) {
      return allIcons.filter((icon) => icon.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    const categoryIcons = ICON_CATEGORIES[selectedCategory] as readonly string[]
    return allIcons.filter((icon) => categoryIcons.includes(icon.name))
  }, [allIcons, searchQuery, selectedCategory])

  // Apply color palette
  const applyPalette = useCallback((palette: (typeof COLOR_PALETTES)[0]) => {
    setPrimaryColor(palette.primary)
    setSecondaryColor(palette.secondary)
    trackToolEvent('logo_apply_palette', { palette: palette.name })
  }, [])

  // Generate random logo
  const generateRandom = useCallback(() => {
    const randomCategory = Object.keys(ICON_CATEGORIES)[
      Math.floor(Math.random() * Object.keys(ICON_CATEGORIES).length)
    ] as keyof typeof ICON_CATEGORIES
    const categoryIcons = ICON_CATEGORIES[randomCategory]
    const randomIconName = categoryIcons[Math.floor(Math.random() * categoryIcons.length)]
    const randomIcon = allIcons.find((icon) => icon.name === randomIconName)
    if (randomIcon) setSelectedIcon(randomIcon)

    const randomPalette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
    setPrimaryColor(randomPalette.primary)
    setSecondaryColor(randomPalette.secondary)

    const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)]
    setSelectedFont(randomFont)

    const layouts: LayoutOption[] = ['horizontal', 'vertical']
    setLayout(layouts[Math.floor(Math.random() * layouts.length)])

    trackToolEvent('logo_generate_random')
    toast.success('Random logo generated!')
  }, [allIcons])

  // Download as PNG
  const downloadPNG = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const canvasSize = 512
    canvas.width = canvasSize
    canvas.height = canvasSize

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Draw background
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvasSize, canvasSize)
    }

    // Calculate positions based on layout
    const centerX = canvasSize / 2
    const centerY = canvasSize / 2

    // Draw icon if selected and not text-only
    if (selectedIcon && layout !== 'text-only') {
      const IconComponent = selectedIcon.component
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      const { createRoot } = await import('react-dom/client')
      const root = createRoot(tempDiv)
      root.render(
        <IconComponent
          size={iconSize * 4}
          color={useGradient ? primaryColor : primaryColor}
          strokeWidth={iconStrokeWidth}
        />
      )

      await new Promise((resolve) => setTimeout(resolve, 100))

      const svg = tempDiv.querySelector('svg')
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        const img = new Image()
        img.crossOrigin = 'anonymous'

        await new Promise<void>((resolve) => {
          img.onload = () => {
            let iconX = centerX - (iconSize * 4) / 2
            let iconY = centerY - (iconSize * 4) / 2

            if (layout === 'horizontal' && brandName) {
              iconX = centerX - (iconSize * 4) / 2 - 80
            } else if (layout === 'vertical' && brandName) {
              iconY = centerY - (iconSize * 4) / 2 - 60
            }

            ctx.drawImage(img, iconX, iconY, iconSize * 4, iconSize * 4)
            URL.revokeObjectURL(url)
            resolve()
          }
          img.src = url
        })
      }

      document.body.removeChild(tempDiv)
    }

    // Draw text
    if (brandName && layout !== 'icon-only') {
      ctx.font = `${fontWeight} ${fontSize * 2}px ${selectedFont.value}`
      ctx.fillStyle = primaryColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      let textY = centerY

      if (layout === 'horizontal' && selectedIcon) {
        ctx.textAlign = 'left'
        const textX = centerX + spacing
        ctx.fillText(brandName, textX, textY)
      } else if (layout === 'vertical' && selectedIcon) {
        textY = centerY + iconSize * 2 + spacing
        ctx.fillText(brandName, centerX, textY)
      } else {
        ctx.fillText(brandName, centerX, textY)
      }

      // Draw tagline
      if (tagline) {
        ctx.font = `normal ${fontSize}px ${selectedFont.value}`
        ctx.fillStyle = secondaryColor
        ctx.fillText(tagline, centerX, textY + fontSize * 2 + 10)
      }
    }

    // Download
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${brandName || 'logo'}-logo.png`
    link.href = dataUrl
    link.click()

    trackToolEvent('logo_download', { format: 'png' })
    toast.success('Logo downloaded as PNG!')
  }, [
    backgroundColor,
    brandName,
    fontWeight,
    fontSize,
    iconSize,
    iconStrokeWidth,
    layout,
    primaryColor,
    secondaryColor,
    selectedFont.value,
    selectedIcon,
    spacing,
    tagline,
    useGradient,
  ])

  // Download as SVG
  const downloadSVG = useCallback(async () => {
    const svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(svgNS, 'svg')
    svg.setAttribute('width', '512')
    svg.setAttribute('height', '512')
    svg.setAttribute('viewBox', '0 0 512 512')
    svg.setAttribute('xmlns', svgNS)

    // Background
    if (backgroundColor !== 'transparent') {
      const rect = document.createElementNS(svgNS, 'rect')
      rect.setAttribute('width', '512')
      rect.setAttribute('height', '512')
      rect.setAttribute('fill', backgroundColor)
      svg.appendChild(rect)
    }

    // Add icon as embedded SVG
    if (selectedIcon && layout !== 'text-only') {
      const IconComponent = selectedIcon.component
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)

      const { createRoot } = await import('react-dom/client')
      const root = createRoot(tempDiv)
      root.render(
        <IconComponent size={iconSize * 2} color={primaryColor} strokeWidth={iconStrokeWidth} />
      )

      await new Promise((resolve) => setTimeout(resolve, 100))

      const iconSvg = tempDiv.querySelector('svg')
      if (iconSvg) {
        const g = document.createElementNS(svgNS, 'g')
        let translateX = 256 - iconSize
        let translateY = 256 - iconSize

        if (layout === 'horizontal' && brandName) {
          translateX = 100
        } else if (layout === 'vertical' && brandName) {
          translateY = 100
        }

        g.setAttribute('transform', `translate(${translateX}, ${translateY})`)
        g.innerHTML = iconSvg.innerHTML
        // Copy stroke attributes
        for (const child of g.querySelectorAll('*')) {
          child.setAttribute('stroke', primaryColor)
          child.setAttribute('stroke-width', String(iconStrokeWidth))
        }
        svg.appendChild(g)
      }

      document.body.removeChild(tempDiv)
    }

    // Add text
    if (brandName && layout !== 'icon-only') {
      const text = document.createElementNS(svgNS, 'text')
      text.setAttribute('font-family', selectedFont.value)
      text.setAttribute('font-size', String(fontSize))
      text.setAttribute('font-weight', fontWeight)
      text.setAttribute('fill', primaryColor)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')

      let textX = 256
      let textY = 256

      if (layout === 'horizontal' && selectedIcon) {
        textX = 300
      } else if (layout === 'vertical' && selectedIcon) {
        textY = 350
      }

      text.setAttribute('x', String(textX))
      text.setAttribute('y', String(textY))
      text.textContent = brandName
      svg.appendChild(text)

      // Tagline
      if (tagline) {
        const taglineText = document.createElementNS(svgNS, 'text')
        taglineText.setAttribute('font-family', selectedFont.value)
        taglineText.setAttribute('font-size', String(fontSize / 2))
        taglineText.setAttribute('fill', secondaryColor)
        taglineText.setAttribute('text-anchor', 'middle')
        taglineText.setAttribute('x', '256')
        taglineText.setAttribute('y', String(textY + fontSize + 10))
        taglineText.textContent = tagline
        svg.appendChild(taglineText)
      }
    }

    // Download
    const svgString = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${brandName || 'logo'}-logo.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)

    trackToolEvent('logo_download', { format: 'svg' })
    toast.success('Logo downloaded as SVG!')
  }, [
    backgroundColor,
    brandName,
    fontSize,
    fontWeight,
    iconSize,
    iconStrokeWidth,
    layout,
    primaryColor,
    secondaryColor,
    selectedFont.value,
    selectedIcon,
    tagline,
  ])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2',
            mb: '3',
            px: '3',
            py: '1.5',
            bg: 'purple.500/10',
            rounded: 'full',
          })}
        >
          <Sparkles className={css({ w: '4', h: '4', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.400' })}>
            Free Logo Maker
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'purple.400',
            gradientTo: 'pink.400',
            bgClip: 'text',
            mb: '3',
          })}
        >
          Create Your Logo in Minutes
        </h1>

        <p
          className={css({
            fontSize: { base: 'sm', sm: 'base', md: 'lg' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
            mb: '4',
          })}
        >
          Design professional logos with 1000+ icons, custom fonts, and color palettes. Export as
          PNG or SVG for free. No design skills required.
        </p>

        <Button onClick={generateRandom} variant="outline">
          <RefreshCw className={css({ w: '4', h: '4', mr: '2' })} />
          Generate Random Logo
        </Button>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr 400px' },
          gap: '6',
          alignItems: 'start',
        })}
      >
        {/* Left Column - Preview & Icon Selection */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Your logo will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minH: '300px',
                  p: '8',
                  bg: backgroundColor === 'transparent' ? 'gray.900' : backgroundColor,
                  rounded: 'lg',
                  border: '1px dashed',
                  borderColor: 'gray.700',
                  backgroundImage:
                    backgroundColor === 'transparent'
                      ? 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)'
                      : 'none',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: layout === 'vertical' ? 'column' : 'row',
                    alignItems: 'center',
                    gap: `${spacing}px`,
                  })}
                >
                  {selectedIcon && layout !== 'text-only' && (
                    <div>
                      {(() => {
                        const IconComponent = selectedIcon.component
                        return (
                          <IconComponent
                            size={iconSize}
                            color={primaryColor}
                            strokeWidth={iconStrokeWidth}
                          />
                        )
                      })()}
                    </div>
                  )}
                  {brandName && layout !== 'icon-only' && (
                    <div
                      className={css({ textAlign })}
                      style={{
                        fontFamily: selectedFont.value,
                        fontSize: `${fontSize}px`,
                        fontWeight,
                        color: primaryColor,
                        letterSpacing: `${letterSpacing}px`,
                      }}
                    >
                      <div>{brandName}</div>
                      {tagline && (
                        <div
                          style={{
                            fontSize: `${fontSize / 2}px`,
                            color: secondaryColor,
                            fontWeight: 'normal',
                            marginTop: '4px',
                          }}
                        >
                          {tagline}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Download Buttons */}
              <div className={css({ display: 'flex', gap: '3', mt: '4' })}>
                <Button onClick={downloadPNG} className={css({ flex: '1' })}>
                  <Download className={css({ w: '4', h: '4', mr: '2' })} />
                  Download PNG
                </Button>
                <Button onClick={downloadSVG} variant="outline" className={css({ flex: '1' })}>
                  <Download className={css({ w: '4', h: '4', mr: '2' })} />
                  Download SVG
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Icon Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose an Icon</CardTitle>
              <CardDescription>
                {searchQuery
                  ? `Found ${filteredIcons.length} icons`
                  : `${filteredIcons.length} icons in ${selectedCategory}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className={css({ position: 'relative', mb: '4' })}>
                <Search
                  className={css({
                    position: 'absolute',
                    left: '3',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    w: '4',
                    h: '4',
                    color: 'gray.400',
                  })}
                />
                <Input
                  type="text"
                  placeholder="Search icons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={css({ pl: '10' })}
                />
              </div>

              {/* Categories */}
              {!searchQuery && (
                <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', mb: '4' })}>
                  {Object.keys(ICON_CATEGORIES).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category as keyof typeof ICON_CATEGORIES)}
                      className={css({
                        px: '3',
                        py: '1.5',
                        rounded: 'full',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s',
                        bg: selectedCategory === category ? 'purple.500' : 'gray.800',
                        color: selectedCategory === category ? 'white' : 'gray.400',
                        _hover: { bg: selectedCategory === category ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Icon Grid */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: 'repeat(5, 1fr)', sm: 'repeat(8, 1fr)' },
                  gap: '2',
                  maxH: '300px',
                  overflow: 'auto',
                })}
              >
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.component
                  const isSelected = selectedIcon?.name === icon.name
                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        setSelectedIcon(icon)
                        trackToolEvent('logo_select_icon', { icon: icon.name })
                      }}
                      className={css({
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: isSelected ? 'purple.500' : 'gray.800',
                        bg: isSelected ? 'purple.500/10' : 'gray.900',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        _hover: { borderColor: 'purple.500', bg: 'purple.500/5' },
                      })}
                      title={icon.name}
                    >
                      <IconComponent size={24} className={css({ color: 'gray.300' })} />
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customization Panel */}
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
          {/* Text Settings */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Type className={css({ w: '5', h: '5' })} />
                Text Settings
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              {/* Brand Name */}
              <div>
                <label
                  htmlFor="brand-name"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Brand Name
                </label>
                <Input
                  id="brand-name"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Enter your brand name"
                />
              </div>

              {/* Tagline */}
              <div>
                <label
                  htmlFor="tagline"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Tagline (optional)
                </label>
                <Input
                  id="tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Your tagline here"
                />
              </div>

              {/* Font Selection */}
              <div>
                <label
                  htmlFor="font-select"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Font
                </label>
                <select
                  id="font-select"
                  value={selectedFont.name}
                  onChange={(e) => {
                    const font = FONTS.find((f) => f.name === e.target.value)
                    if (font) setSelectedFont(font)
                  }}
                  className={css({
                    w: 'full',
                    p: '2',
                    rounded: 'md',
                    bg: 'gray.900',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    color: 'white',
                  })}
                >
                  {FONTS.map((font) => (
                    <option key={font.name} value={font.name} style={{ fontFamily: font.value }}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label
                  htmlFor="font-size"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Font Size: {fontSize}px
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="16"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={css({ w: 'full' })}
                />
              </div>

              {/* Font Weight & Alignment */}
              <div className={css({ display: 'flex', gap: '4' })}>
                <div className={css({ flex: '1' })}>
                  <span
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Weight
                  </span>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <button
                      type="button"
                      onClick={() => setFontWeight('normal')}
                      className={css({
                        flex: '1',
                        py: '2',
                        rounded: 'md',
                        fontSize: 'sm',
                        bg: fontWeight === 'normal' ? 'purple.500' : 'gray.800',
                        _hover: { bg: fontWeight === 'normal' ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontWeight('bold')}
                      className={css({
                        flex: '1',
                        py: '2',
                        rounded: 'md',
                        fontSize: 'sm',
                        fontWeight: 'bold',
                        bg: fontWeight === 'bold' ? 'purple.500' : 'gray.800',
                        _hover: { bg: fontWeight === 'bold' ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      Bold
                    </button>
                  </div>
                </div>
                <div className={css({ flex: '1' })}>
                  <span
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Align
                  </span>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <button
                      type="button"
                      onClick={() => setTextAlign('left')}
                      className={css({
                        flex: '1',
                        py: '2',
                        rounded: 'md',
                        bg: textAlign === 'left' ? 'purple.500' : 'gray.800',
                        _hover: { bg: textAlign === 'left' ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      <AlignLeft className={css({ w: '4', h: '4', mx: 'auto' })} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign('center')}
                      className={css({
                        flex: '1',
                        py: '2',
                        rounded: 'md',
                        bg: textAlign === 'center' ? 'purple.500' : 'gray.800',
                        _hover: { bg: textAlign === 'center' ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      <AlignCenter className={css({ w: '4', h: '4', mx: 'auto' })} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTextAlign('right')}
                      className={css({
                        flex: '1',
                        py: '2',
                        rounded: 'md',
                        bg: textAlign === 'right' ? 'purple.500' : 'gray.800',
                        _hover: { bg: textAlign === 'right' ? 'purple.600' : 'gray.700' },
                      })}
                    >
                      <AlignRight className={css({ w: '4', h: '4', mx: 'auto' })} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Settings */}
          <Card>
            <CardHeader>
              <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Palette className={css({ w: '5', h: '5' })} />
                Colors
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              {/* Color Palettes */}
              <div>
                <span
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Quick Palettes
                </span>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '2',
                  })}
                >
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => applyPalette(palette)}
                      className={css({
                        p: '2',
                        rounded: 'md',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        _hover: { borderColor: 'purple.500' },
                      })}
                      title={palette.name}
                    >
                      <div className={css({ display: 'flex', gap: '1' })}>
                        <div
                          style={{ backgroundColor: palette.primary }}
                          className={css({ w: '4', h: '4', rounded: 'sm' })}
                        />
                        <div
                          style={{ backgroundColor: palette.secondary }}
                          className={css({ w: '4', h: '4', rounded: 'sm' })}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color */}
              <div>
                <label
                  htmlFor="primary-color"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Primary Color
                </label>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className={css({ flex: '1' })}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label
                  htmlFor="secondary-color"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Secondary Color
                </label>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className={css({ flex: '1' })}
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <span
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Background
                </span>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <button
                    type="button"
                    onClick={() => setBackgroundColor('transparent')}
                    className={css({
                      px: '3',
                      py: '2',
                      rounded: 'md',
                      fontSize: 'sm',
                      bg: backgroundColor === 'transparent' ? 'purple.500' : 'gray.800',
                      _hover: { bg: backgroundColor === 'transparent' ? 'purple.600' : 'gray.700' },
                    })}
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackgroundColor('#ffffff')}
                    className={css({
                      px: '3',
                      py: '2',
                      rounded: 'md',
                      fontSize: 'sm',
                      bg: backgroundColor === '#ffffff' ? 'purple.500' : 'gray.800',
                      _hover: { bg: backgroundColor === '#ffffff' ? 'purple.600' : 'gray.700' },
                    })}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBackgroundColor('#000000')}
                    className={css({
                      px: '3',
                      py: '2',
                      rounded: 'md',
                      fontSize: 'sm',
                      bg: backgroundColor === '#000000' ? 'purple.500' : 'gray.800',
                      _hover: { bg: backgroundColor === '#000000' ? 'purple.600' : 'gray.700' },
                    })}
                  >
                    Black
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
            </CardHeader>
            <CardContent className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              {/* Layout Options */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '2',
                })}
              >
                <button
                  type="button"
                  onClick={() => setLayout('horizontal')}
                  className={css({
                    p: '3',
                    rounded: 'md',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2',
                    border: '1px solid',
                    borderColor: layout === 'horizontal' ? 'purple.500' : 'gray.700',
                    bg: layout === 'horizontal' ? 'purple.500/10' : 'gray.900',
                    _hover: { borderColor: 'purple.500' },
                  })}
                >
                  <Sparkles className={css({ w: '4', h: '4' })} />
                  <ArrowRight className={css({ w: '3', h: '3' })} />
                  <span className={css({ fontSize: 'sm' })}>Aa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('vertical')}
                  className={css({
                    p: '3',
                    rounded: 'md',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1',
                    border: '1px solid',
                    borderColor: layout === 'vertical' ? 'purple.500' : 'gray.700',
                    bg: layout === 'vertical' ? 'purple.500/10' : 'gray.900',
                    _hover: { borderColor: 'purple.500' },
                  })}
                >
                  <Sparkles className={css({ w: '4', h: '4' })} />
                  <ArrowDown className={css({ w: '3', h: '3' })} />
                  <span className={css({ fontSize: 'xs' })}>Aa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('icon-only')}
                  className={css({
                    p: '3',
                    rounded: 'md',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: layout === 'icon-only' ? 'purple.500' : 'gray.700',
                    bg: layout === 'icon-only' ? 'purple.500/10' : 'gray.900',
                    _hover: { borderColor: 'purple.500' },
                  })}
                >
                  <Sparkles className={css({ w: '5', h: '5' })} />
                </button>
                <button
                  type="button"
                  onClick={() => setLayout('text-only')}
                  className={css({
                    p: '3',
                    rounded: 'md',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: layout === 'text-only' ? 'purple.500' : 'gray.700',
                    bg: layout === 'text-only' ? 'purple.500/10' : 'gray.900',
                    _hover: { borderColor: 'purple.500' },
                  })}
                >
                  <span className={css({ fontSize: 'lg', fontWeight: 'bold' })}>Aa</span>
                </button>
              </div>

              {/* Icon Size */}
              {layout !== 'text-only' && (
                <div>
                  <label
                    htmlFor="icon-size"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Icon Size: {iconSize}px
                  </label>
                  <input
                    id="icon-size"
                    type="range"
                    min="24"
                    max="128"
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>
              )}

              {/* Icon Stroke Width */}
              {layout !== 'text-only' && (
                <div>
                  <label
                    htmlFor="stroke-width"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Icon Stroke: {iconStrokeWidth}
                  </label>
                  <input
                    id="stroke-width"
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={iconStrokeWidth}
                    onChange={(e) => setIconStrokeWidth(Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>
              )}

              {/* Spacing */}
              <div>
                <label
                  htmlFor="spacing"
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Spacing: {spacing}px
                </label>
                <input
                  id="spacing"
                  type="range"
                  min="0"
                  max="48"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className={css({ w: 'full' })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className={css({ display: 'none' })} />

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Logo Design Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', md: 'repeat(3, 1fr)' },
              gap: '4',
            })}
          >
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'purple.400' })}>
                Keep It Simple
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                The best logos are simple and memorable. Avoid clutter and focus on one clear
                concept that represents your brand.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'purple.400' })}>
                Think Scalable
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Your logo should look good at any size, from a tiny favicon to a large billboard.
                Test it at different scales.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'purple.400' })}>
                Choose Colors Wisely
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Colors evoke emotions. Blue suggests trust, green suggests growth, purple suggests
                creativity. Pick colors that match your brand.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ToolSearch />
    </main>
  )
}

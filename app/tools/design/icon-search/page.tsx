'use client'

import * as LucideIcons from 'lucide-react'
import { Copy, Download, Heart, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

interface IconItem {
  name: string
  component: React.ComponentType<LucideIcons.LucideProps>
}

export default function IconSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<IconItem | null>(null)
  const [iconSize, setIconSize] = useState(24)
  const [iconColor, setIconColor] = useState('#ffffff')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Get all Lucide icons
  const allIcons = useMemo(() => {
    const icons: IconItem[] = []

    for (const [name, component] of Object.entries(LucideIcons)) {
      // Filter out non-icon exports
      if (
        typeof component === 'function' &&
        name !== 'createLucideIcon' &&
        name !== 'default' &&
        !name.startsWith('Lucide')
      ) {
        icons.push({ name, component: component as React.ComponentType<LucideIcons.LucideProps> })
      }
    }

    return icons.sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return allIcons

    return allIcons.filter((icon) => icon.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [allIcons, searchQuery])

  const handleIconSelect = (icon: IconItem) => {
    setSelectedIcon(icon)
    trackToolEvent('icon_select', { icon: icon.name })
  }

  const toggleFavorite = (iconName: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(iconName)) {
      newFavorites.delete(iconName)
    } else {
      newFavorites.add(iconName)
    }
    setFavorites(newFavorites)
    trackToolEvent('icon_favorite', { icon: iconName })
  }

  const copySVG = () => {
    if (!selectedIcon) return

    const IconComponent = selectedIcon.component
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    // Create a temporary React root to render the icon
    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv)
      root.render(<IconComponent size={iconSize} color={iconColor} strokeWidth={strokeWidth} />)

      setTimeout(() => {
        const svg = tempDiv.querySelector('svg')
        if (svg) {
          const svgString = new XMLSerializer().serializeToString(svg)
          navigator.clipboard.writeText(svgString)
          toast.success('SVG copied to clipboard!')
          trackToolEvent('icon_copy_svg', { icon: selectedIcon.name })
        }
        document.body.removeChild(tempDiv)
      }, 100)
    })
  }

  const copyReactCode = () => {
    if (!selectedIcon) return

    const code = `import { ${selectedIcon.name} } from 'lucide-react'

<${selectedIcon.name} 
  size={${iconSize}} 
  color="${iconColor}" 
  strokeWidth={${strokeWidth}}
/>`

    navigator.clipboard.writeText(code)
    toast.success('React code copied to clipboard!')
    trackToolEvent('icon_copy_react', { icon: selectedIcon.name })
  }

  const downloadSVG = () => {
    if (!selectedIcon) return

    const IconComponent = selectedIcon.component
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    document.body.appendChild(tempDiv)

    import('react-dom/client').then(({ createRoot }) => {
      const root = createRoot(tempDiv)
      root.render(<IconComponent size={iconSize} color={iconColor} strokeWidth={strokeWidth} />)

      setTimeout(() => {
        const svg = tempDiv.querySelector('svg')
        if (svg) {
          const svgString = new XMLSerializer().serializeToString(svg)
          const blob = new Blob([svgString], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${selectedIcon.name}.svg`
          a.click()
          URL.revokeObjectURL(url)
          toast.success('SVG downloaded successfully!')
          trackToolEvent('icon_download_svg', { icon: selectedIcon.name })
        }
        document.body.removeChild(tempDiv)
      }, 100)
    })
  }

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
          <Search className={css({ w: '4', h: '4', color: 'purple.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'purple.400' })}>
            Icon Search & Download Hub
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
          Search 1000+ Free Icons
        </h1>

        <p
          className={css({
            fontSize: { base: 'sm', sm: 'base', md: 'lg' },
            color: 'gray.400',
            maxW: '3xl',
            mx: 'auto',
          })}
        >
          Find, customize, and download Lucide icons for your projects. Export as SVG or React
          components with full customization options.
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Icons</CardTitle>
          <CardDescription>
            Showing {filteredIcons.length} of {allIcons.length} icons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={css({ position: 'relative' })}>
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
              placeholder="Search icons... (e.g., home, user, settings)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={css({ pl: '10' })}
            />
          </div>
        </CardContent>
      </Card>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '2fr 1fr' },
          gap: '6',
          alignItems: 'start',
        })}
      >
        {/* Icon Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Library</CardTitle>
            <CardDescription>Click any icon to customize and download</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: {
                  base: 'repeat(4, 1fr)',
                  sm: 'repeat(6, 1fr)',
                  md: 'repeat(8, 1fr)',
                },
                gap: '2',
                maxH: '600px',
                overflow: 'auto',
              })}
            >
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component
                const isFavorite = favorites.has(icon.name)
                const isSelected = selectedIcon?.name === icon.name

                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon)}
                    className={css({
                      position: 'relative',
                      p: '3',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: isSelected ? 'purple.500' : 'gray.800',
                      bg: isSelected ? 'purple.500/10' : 'gray.900',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      _hover: {
                        borderColor: 'purple.500',
                        bg: 'purple.500/5',
                      },
                    })}
                    title={icon.name}
                  >
                    <IconComponent
                      size={24}
                      className={css({ w: 'full', h: 'auto', color: 'gray.300' })}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(icon.name)
                      }}
                      className={css({
                        position: 'absolute',
                        top: '1',
                        right: '1',
                        p: '1',
                        rounded: 'sm',
                        bg: 'gray.800/80',
                        _hover: { bg: 'gray.700' },
                      })}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart
                        size={12}
                        className={css({
                          color: isFavorite ? 'red.500' : 'gray.400',
                          fill: isFavorite ? 'currentColor' : 'none',
                        })}
                      />
                    </button>
                  </button>
                )
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div
                className={css({
                  textAlign: 'center',
                  py: '12',
                  color: 'gray.400',
                })}
              >
                <Search className={css({ w: '12', h: '12', mx: 'auto', mb: '4', opacity: 0.5 })} />
                <p>No icons found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customization Panel */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedIcon ? 'Customize & Download' : 'Select an Icon'}</CardTitle>
            {selectedIcon && <CardDescription>{selectedIcon.name}</CardDescription>}
          </CardHeader>
          <CardContent>
            {selectedIcon ? (
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
                {/* Preview */}
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: '8',
                    bg: 'gray.900',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.800',
                  })}
                >
                  {(() => {
                    const IconComponent = selectedIcon.component
                    return (
                      <IconComponent size={iconSize} color={iconColor} strokeWidth={strokeWidth} />
                    )
                  })()}
                </div>

                {/* Size Control */}
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
                    Size: {iconSize}px
                  </label>
                  <input
                    id="icon-size"
                    type="range"
                    min="16"
                    max="128"
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>

                {/* Color Control */}
                <div>
                  <label
                    htmlFor="icon-color"
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Color
                  </label>
                  <div className={css({ display: 'flex', gap: '2' })}>
                    <input
                      id="icon-color"
                      type="color"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className={css({ w: '12', h: '10', rounded: 'md', cursor: 'pointer' })}
                    />
                    <Input
                      type="text"
                      value={iconColor}
                      onChange={(e) => setIconColor(e.target.value)}
                      className={css({ flex: 1 })}
                    />
                  </div>
                </div>

                {/* Stroke Width Control */}
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
                    Stroke Width: {strokeWidth}
                  </label>
                  <input
                    id="stroke-width"
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className={css({ w: 'full' })}
                  />
                </div>

                {/* Action Buttons */}
                <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                  <Button onClick={copySVG} className={css({ w: 'full' })}>
                    <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                    Copy SVG
                  </Button>
                  <Button onClick={downloadSVG} variant="outline" className={css({ w: 'full' })}>
                    <Download className={css({ w: '4', h: '4', mr: '2' })} />
                    Download SVG
                  </Button>
                  <Button onClick={copyReactCode} variant="outline" className={css({ w: 'full' })}>
                    <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                    Copy React Code
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={css({
                  textAlign: 'center',
                  py: '12',
                  color: 'gray.400',
                })}
              >
                <Search className={css({ w: '12', h: '12', mx: 'auto', mb: '4', opacity: 0.5 })} />
                <p>Select an icon to customize and download</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pro Tips</CardTitle>
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
                Search Tips
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Try searching for common terms like &quot;arrow&quot;, &quot;menu&quot;,
                &quot;user&quot;, &quot;settings&quot;, or &quot;mail&quot; to find related icons
                quickly.
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'purple.400' })}>
                React Integration
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                All icons are from lucide-react. Install with:{' '}
                <code className={css({ bg: 'gray.800', px: '1', rounded: 'sm' })}>
                  npm install lucide-react
                </code>
              </p>
            </div>
            <div>
              <h3 className={css({ fontWeight: 'semibold', mb: '2', color: 'purple.400' })}>
                Favorites
              </h3>
              <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                Click the heart icon on any icon to add it to your favorites for quick access later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

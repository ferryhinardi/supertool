'use client'

import { Check, Copy, Search } from 'lucide-react'
import { useState } from 'react'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  characterCategories,
  getAllCharacters,
  getCharactersByCategory,
  searchCharacters,
} from './templates'

export default function CharacterMapPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedChar, setCopiedChar] = useState<string | null>(null)

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSearchQuery('')
    trackToolEvent('character_map_category_changed', { category: categoryId })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query) {
      trackToolEvent('character_map_searched', { query_length: query.length })
    }
  }

  const handleCopyCharacter = async (char: string, name: string) => {
    try {
      await navigator.clipboard.writeText(char)
      setCopiedChar(char)
      setTimeout(() => setCopiedChar(null), 2000)
      trackToolEvent('character_map_character_copied', { character_name: name })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Get characters based on search or category
  const displayCharacters = searchQuery
    ? searchCharacters(searchQuery)
    : selectedCategory === 'all'
      ? getAllCharacters()
      : getCharactersByCategory(selectedCategory)

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
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <h1
          className={css({
            fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'indigo.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
        >
          Character Map
        </h1>
        <p
          className={css({
            fontSize: { base: 'sm', sm: 'base', md: 'lg' },
            color: 'neutral.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Browse and copy 300+ special characters, symbols, and Unicode characters with a single
          click
        </p>
      </div>

      {/* Search Bar */}
      <div
        className={css({
          maxW: '2xl',
          mx: 'auto',
          position: 'relative',
        })}
      >
        <Search
          className={css({
            position: 'absolute',
            left: '4',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'neutral.500',
          })}
          size={20}
        />
        <input
          type="text"
          placeholder="Search characters (e.g., arrow, pi, euro)..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className={css({
            w: 'full',
            pl: '12',
            pr: '4',
            py: '3',
            bg: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 'xl',
            color: 'white',
            fontSize: 'base',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            _placeholder: {
              color: 'neutral.500',
            },
            _focus: {
              outline: 'none',
              borderColor: 'indigo.500',
              bg: 'rgba(255, 255, 255, 0.08)',
            },
          })}
        />
      </div>

      {/* Category Buttons */}
      {!searchQuery && (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '3',
            justifyContent: 'center',
          })}
        >
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={css({
              px: '6',
              py: '2.5',
              bg: selectedCategory === 'all' ? 'indigo.500' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid',
              borderColor: selectedCategory === 'all' ? 'indigo.500' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'full',
              color: 'white',
              fontSize: 'sm',
              fontWeight: 'medium',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s',
              cursor: 'pointer',
              _hover: {
                bg: selectedCategory === 'all' ? 'indigo.600' : 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)',
              },
              _active: {
                transform: 'translateY(0)',
              },
            })}
          >
            All Characters
          </button>
          {characterCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryChange(category.id)}
              className={css({
                px: '6',
                py: '2.5',
                bg: selectedCategory === category.id ? 'indigo.500' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor:
                  selectedCategory === category.id ? 'indigo.500' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'full',
                color: 'white',
                fontSize: 'sm',
                fontWeight: 'medium',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                _hover: {
                  bg: selectedCategory === category.id ? 'indigo.600' : 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                },
                _active: {
                  transform: 'translateY(0)',
                },
              })}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className={css({ textAlign: 'center' })}>
        <p className={css({ color: 'neutral.400', fontSize: 'sm' })}>
          {searchQuery
            ? `Found ${displayCharacters.length} character${displayCharacters.length === 1 ? '' : 's'}`
            : selectedCategory === 'all'
              ? `Showing all ${displayCharacters.length} characters`
              : `${displayCharacters.length} character${displayCharacters.length === 1 ? '' : 's'} in category`}
        </p>
      </div>

      {/* Character Grid */}
      {displayCharacters.length > 0 ? (
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: {
              base: 'repeat(3, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(6, 1fr)',
              lg: 'repeat(8, 1fr)',
              xl: 'repeat(10, 1fr)',
            },
            gap: { base: '3', sm: '4' },
            w: 'full',
          })}
        >
          {displayCharacters.map((char) => (
            <button
              key={`${char.char}-${char.code}`}
              type="button"
              onClick={() => handleCopyCharacter(char.char, char.name)}
              className={css({
                position: 'relative',
                aspectRatio: '1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1',
                p: { base: '2', sm: '3' },
                bg: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 'xl',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                cursor: 'pointer',
                overflow: 'hidden',
                _hover: {
                  bg: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'indigo.500',
                  transform: 'translateY(-2px)',
                  '& .char-name': {
                    opacity: '1',
                  },
                },
                _active: {
                  transform: 'translateY(0)',
                },
              })}
            >
              {/* Character */}
              <span
                className={css({
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                  color: 'white',
                  userSelect: 'none',
                })}
              >
                {char.char}
              </span>

              {/* Unicode Code */}
              <span
                className={css({
                  fontSize: { base: '2xs', sm: 'xs' },
                  color: 'neutral.500',
                  fontFamily: 'mono',
                })}
              >
                {char.code}
              </span>

              {/* Character Name (appears on hover) */}
              <div
                className={css({
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  p: '2',
                  bg: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(10px)',
                  opacity: '0',
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                })}
                style={{ opacity: 0 }}
              >
                <p
                  className={css({
                    fontSize: '2xs',
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: 'tight',
                  })}
                >
                  {char.name}
                </p>
              </div>

              {/* Copied Indicator */}
              {copiedChar === char.char && (
                <div
                  className={css({
                    position: 'absolute',
                    top: '1',
                    right: '1',
                    p: '1',
                    bg: 'green.500',
                    borderRadius: 'full',
                  })}
                >
                  <Check size={12} className={css({ color: 'white' })} />
                </div>
              )}

              {/* Copy Icon (visible on hover for larger screens) */}
              <div
                className={css({
                  position: 'absolute',
                  top: '1',
                  right: '1',
                  p: '1',
                  opacity: '0',
                  transition: 'opacity 0.2s',
                  display: { base: 'none', md: 'block' },
                  _groupHover: {
                    opacity: '1',
                  },
                })}
              >
                <Copy size={12} className={css({ color: 'neutral.400' })} />
              </div>
            </button>
          ))}
        </div>
      ) : (
        // Empty State
        <div
          className={css({
            textAlign: 'center',
            py: '20',
            spaceY: '4',
          })}
        >
          <div
            className={css({
              w: '20',
              h: '20',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bg: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'full',
            })}
          >
            <Search size={40} className={css({ color: 'neutral.600' })} />
          </div>
          <div>
            <h3 className={css({ fontSize: 'xl', fontWeight: 'semibold', color: 'white' })}>
              No characters found
            </h3>
            <p className={css({ color: 'neutral.400', fontSize: 'sm', mt: '2' })}>
              Try a different search term or browse by category
            </p>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div
        className={css({
          maxW: '4xl',
          mx: 'auto',
          p: { base: '4', sm: '6' },
          bg: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2xl',
          backdropFilter: 'blur(10px)',
        })}
      >
        <h3
          className={css({
            fontSize: 'lg',
            fontWeight: 'semibold',
            color: 'white',
            mb: '3',
          })}
        >
          💡 Tips
        </h3>
        <ul className={css({ spaceY: '2', color: 'neutral.300', fontSize: 'sm' })}>
          <li>
            • <strong>Click any character</strong> to instantly copy it to your clipboard
          </li>
          <li>
            • <strong>Search by name</strong> to quickly find specific characters (e.g., "arrow",
            "pi", "euro")
          </li>
          <li>
            • <strong>Browse by category</strong> to explore related characters
          </li>
          <li>
            • <strong>Hover over characters</strong> to see their full name and details
          </li>
          <li>
            • <strong>All processing is local</strong> - your data never leaves your device
          </li>
        </ul>
      </div>
    </main>
  )
}

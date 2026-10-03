'use client'

import {
  Calculator,
  ChevronDown,
  ChevronRight,
  Code,
  Eye,
  FileJson,
  Heart,
  Home,
  Image,
  Lock,
  LogIn,
  LogOut,
  Menu,
  User,
  X,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrandMark } from '@/components/design-system/BrandMark'
import { useAuthStore } from '@/lib/auth/auth-store'
import { type Tool, type ToolCategory, tools } from '@/lib/data/tools'
import { css, cva } from '@/styled-system/css'

// Category display order and metadata for sidebar
const SIDEBAR_CATEGORIES: {
  id: ToolCategory
  label: string
  icon: React.ElementType
}[] = [
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'design', label: 'Design & Visual', icon: Eye },
  { id: 'media', label: 'Media Tools', icon: Image },
  { id: 'finance', label: 'Finance', icon: Calculator },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'data', label: 'Data Processing', icon: FileJson },
  { id: 'development', label: 'Developer Tools', icon: Code },
]

// Sort tools within a category: high priority first, then alphabetical
function sortCategoryTools(categoryTools: Tool[]): Tool[] {
  return [...categoryTools].sort((a, b) => {
    const aPriority = a.sidebarPriority === 'high' ? 0 : 1
    const bPriority = b.sidebarPriority === 'high' ? 0 : 1
    if (aPriority !== bPriority) return aPriority - bPriority
    return a.title.localeCompare(b.title)
  })
}

// Navigation link variants using cva
const navLinkStyles = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    rounded: 'lg',
    px: '4',
    py: '2.5',
    // px/py alone render these links 41px tall - 3px under the 44px minimum
    // touch target, which is the single largest source of violations in
    // docs/planning/TOUCH_TARGETS_BACKLOG.md (2200 of 2611, one per link per route).
    minH: '11',
    transition: 'all 0.2s',
    _hover: {
      color: 'brand.ink',
      bg: 'rgba(255, 255, 255, 0.035)',
    },
  },
  variants: {
    active: {
      true: {
        bg: 'brand.violetSoft',
        color: 'white',
      },
      false: {
        color: 'brand.muted',
        _hover: {
          color: 'brand.ink',
        },
      },
    },
  },
})

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(new Set())

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Prevent background scroll while the mobile drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mobileMenuOpen])

  const toggleCategory = useCallback((category: ToolCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  // Group tools by category, sorted within each group
  const groupedTools = useMemo(() => {
    const activeTools = tools.filter((tool) => !tool.comingSoon)
    const groups = new Map<ToolCategory, Tool[]>()

    for (const cat of SIDEBAR_CATEGORIES) {
      const categoryTools = activeTools.filter((t) => t.category === cat.id)
      if (categoryTools.length > 0) {
        groups.set(cat.id, sortCategoryTools(categoryTools))
      }
    }

    return groups
  }, [])

  // Check if any tool in a category is active (for highlighting the category header)
  const activeCategoryId = useMemo(() => {
    for (const [catId, catTools] of groupedTools) {
      if (catTools.some((t) => pathname === t.href)) {
        return catId
      }
    }
    return null
  }, [pathname, groupedTools])

  return (
    <>
      {/* Mobile Menu Button - Fixed top-left */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={css({
          display: { base: 'flex', md: 'none' },
          position: 'fixed',
          top: '4',
          left: '4',
          // Numeric z-index — semantic token `tooltip` was not resolving (computed `auto`)
          // so homepage content intercepted taps on the hamburger.
          zIndex: 70,
          alignItems: 'center',
          justifyContent: 'center',
          minH: '11',
          minW: '11',
          rounded: 'lg',
          border: '1px solid',
          borderColor: 'brand.line',
          bg: 'brand.surface',
          color: 'brand.muted',
          p: '3',
          transition: 'all 0.2s',
          _hover: {
            color: 'brand.ink',
            bg: 'brand.surfaceRaised',
          },
        })}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className={css({ h: '6', w: '6' })} />
        ) : (
          <Menu className={css({ h: '6', w: '6' })} />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className={css({
            display: { base: 'block', md: 'none' },
            position: 'fixed',
            inset: '0',
            zIndex: 40,
            bg: 'rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
          })}
          aria-label="Close menu"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={css({
          position: { base: 'fixed', md: 'sticky' },
          top: { base: '0', md: '0' },
          left: { base: mobileMenuOpen ? '0' : '-100%', md: '0' },
          zIndex: { base: 50, md: 'auto' },
          display: 'flex',
          height: { base: '100vh', md: '100vh' },
          minH: '100vh',
          width: { base: '80vw', sm: '20rem', md: '248px' },
          maxW: { base: '20rem', md: '248px' },
          flexShrink: 0,
          flexDirection: 'column',
          overflow: 'hidden',
          overflowY: 'auto',
          p: { base: '4', md: '6' },
          shadow: '2xl',
          transition: 'left 0.3s ease-in-out',
        })}
        style={{
          borderRight: '1px solid #1a1f2b',
          background: '#0b0d13',
          contentVisibility: 'auto',
          containIntrinsicSize: '248px 100vh',
        }}
      >
        <div
          className={css({
            display: 'flex',
            h: 'full',
            flexDirection: 'column',
          })}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className={css({
              display: 'flex',
              alignItems: 'center',
              minH: '11',
              mb: { base: '6', md: '8' },
              textDecoration: 'none !important',
            })}
          >
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
                fontFamily: 'display',
                fontSize: 'lg',
                fontWeight: 'extrabold',
                letterSpacing: '-0.03em',
                color: 'brand.ink',
              })}
            >
              <BrandMark />
              SuperTool
            </span>
          </Link>

          {/* Navigation */}
          <nav className={css({ flex: '1', spaceY: '1' })}>
            {/* Home & Support links */}
            {[
              { name: 'Home', href: '/', icon: Home },
              { name: 'Support Us', href: '/support', icon: Heart },
            ].map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={navLinkStyles({ active: isActive })}
                >
                  {isActive && (
                    <div
                      className={css({
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        h: '6',
                        w: '1',
                        transform: 'translateY(-50%)',
                        roundedRight: 'full',
                        bg: 'purple.400',
                      })}
                    />
                  )}
                  <Icon
                    className={css({
                      h: '5',
                      w: '5',
                      color: isActive ? 'purple.300' : 'gray.500',
                    })}
                  />
                  <span className={css({ fontWeight: 'medium', fontSize: 'sm' })}>{item.name}</span>
                </Link>
              )
            })}

            {/* Divider */}
            <div
              className={css({
                borderTop: '1px solid rgba(139, 92, 246, 0.1)',
                my: '3',
              })}
            />

            {/* Category groups */}
            {SIDEBAR_CATEGORIES.map((cat) => {
              const categoryTools = groupedTools.get(cat.id)
              if (!categoryTools || categoryTools.length === 0) return null

              const isCollapsed = collapsedCategories.has(cat.id)
              const hasActiveTool = activeCategoryId === cat.id
              const CatIcon = cat.icon

              return (
                <div key={cat.id} className={css({ mb: '1' })}>
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-expanded={!isCollapsed}
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      w: 'full',
                      px: '3',
                      py: '2',
                      // px/py alone render these 34px tall; 140 of the remaining
                      // touch-target violations are this one button per category
                      // per route.
                      minH: '11',
                      rounded: 'md',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      bg: hasActiveTool ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                      _hover: {
                        bg: 'rgba(139, 92, 246, 0.08)',
                      },
                      border: 'none',
                    })}
                  >
                    <CatIcon
                      className={css({
                        h: '4',
                        w: '4',
                        color: hasActiveTool ? 'purple.300' : 'gray.500',
                        flexShrink: 0,
                      })}
                    />
                    <span
                      className={css({
                        flex: '1',
                        textAlign: 'left',
                        fontSize: 'xs',
                        fontWeight: 'semibold',
                        textTransform: 'uppercase',
                        letterSpacing: 'wider',
                        color: hasActiveTool ? 'purple.300' : 'gray.400',
                      })}
                    >
                      {cat.label}
                    </span>
                    <span
                      className={css({
                        fontSize: 'xs',
                        // gray.600 on dark sidebar fails WCAG (~2.3:1); gray.400 stays muted but readable
                        color: 'gray.400',
                        mr: '1',
                      })}
                    >
                      {categoryTools.length}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight
                        className={css({ h: '3.5', w: '3.5', color: 'gray.500', flexShrink: 0 })}
                      />
                    ) : (
                      <ChevronDown
                        className={css({ h: '3.5', w: '3.5', color: 'gray.500', flexShrink: 0 })}
                      />
                    )}
                  </button>

                  {/* Category tools */}
                  {!isCollapsed && (
                    <div className={css({ mt: '0.5', spaceY: '0.5' })}>
                      {categoryTools.map((tool) => {
                        const isActive = pathname === tool.href
                        const ToolIcon = tool.icon
                        return (
                          <Link
                            key={tool.href}
                            href={tool.href}
                            onClick={closeMobileMenu}
                            className={navLinkStyles({ active: isActive })}
                          >
                            {isActive && (
                              <div
                                className={css({
                                  position: 'absolute',
                                  top: '50%',
                                  left: '0',
                                  h: '6',
                                  w: '1',
                                  transform: 'translateY(-50%)',
                                  roundedRight: 'full',
                                  bg: 'purple.400',
                                })}
                              />
                            )}
                            <ToolIcon
                              className={css({
                                h: '5',
                                w: '5',
                                color: isActive ? 'purple.300' : 'gray.500',
                              })}
                            />
                            <span className={css({ fontWeight: 'medium', fontSize: 'sm' })}>
                              {tool.title}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Auth Section */}
          <AuthSection />

          {/* Footer */}
          <div
            className={css({
              mt: 'auto',
              spaceY: '4',
              borderTop: '1px solid rgba(139, 92, 246, 0.1)',
              pt: '4',
            })}
          >
            <div
              className={css({
                p: '3.5',
                backgroundImage: 'linear-gradient(145deg, #171425, #11141c)',
                border: '1px solid #292341',
                rounded: '13px',
              })}
            >
              <div
                className={css({
                  display: 'grid',
                  placeItems: 'center',
                  w: '8',
                  h: '8',
                  color: 'brand.rose',
                  bg: 'rgba(250, 113, 152, 0.1)',
                  rounded: '8px',
                })}
              >
                <Heart className={css({ h: '4', w: '4' })} aria-hidden />
              </div>
              <p
                className={css({
                  mt: '2',
                  fontSize: 'xs',
                  fontWeight: 'semibold',
                  color: 'brand.ink',
                })}
              >
                Enjoying SuperTool?
              </p>
              <p
                className={css({
                  mt: '1',
                  color: 'brand.muted',
                  fontSize: 'xs',
                  lineHeight: 'relaxed',
                })}
              >
                Help keep every tool free.
              </p>
              <Link
                href="/support"
                onClick={closeMobileMenu}
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  minH: '11',
                  mt: '1',
                  color: 'brand.violetBright',
                  fontSize: 'xs',
                  fontWeight: 'bold',
                })}
              >
                Support the project
              </Link>
            </div>
            <p className={css({ fontSize: 'xs', color: 'brand.dim' })}>
              Built with care by{' '}
              <a
                href="https://github.com/ferryhinardi"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  display: 'inline-flex',
                  alignItems: 'center',
                  minH: '11',
                  color: 'brand.muted',
                  fontWeight: 'semibold',
                  textDecoration: 'none !important',
                  _hover: {
                    color: 'white',
                  },
                })}
              >
                Ferry Hinardi
              </a>
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

// Auth Section Component
function AuthSection() {
  const { user, profile, isLoading, openAuthModal, signOut } = useAuthStore()

  if (isLoading) {
    return (
      <div
        className={css({
          px: '3',
          py: '3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <div
          className={css({
            w: '5',
            h: '5',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: 'purple.400',
            rounded: 'full',
            animation: 'spin 1s linear infinite',
          })}
        />
      </div>
    )
  }

  if (user) {
    return (
      <div
        className={css({
          px: '3',
          py: '3',
          display: 'flex',
          flexDirection: 'column',
          gap: '2',
          borderTop: '2px solid rgba(139, 92, 246, 0.2)',
          pt: '4',
        })}
      >
        {/* User Info */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            px: '3',
            py: '2',
            rounded: 'lg',
            bg: 'rgba(139, 92, 246, 0.1)',
          })}
        >
          <div
            className={css({
              w: '10',
              h: '10',
              rounded: 'full',
              bg: 'purple.600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'sm',
              fontWeight: 'bold',
              color: 'white',
            })}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || user.email || 'User'}
                className={css({ w: '10', h: '10', rounded: 'full' })}
              />
            ) : (
              <User className={css({ w: '5', h: '5' })} />
            )}
          </div>
          <div className={css({ flex: '1', minW: '0' })}>
            <p
              className={css({
                fontSize: 'sm',
                fontWeight: 'semibold',
                color: 'white',
                truncate: true,
              })}
            >
              {profile?.display_name || user.email || 'User'}
            </p>
            <p
              className={css({
                fontSize: 'xs',
                color: 'gray.400',
                truncate: true,
              })}
            >
              {profile?.email || user.email}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={() => signOut()}
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            px: '3',
            py: '2',
            minH: '11',
            w: 'full',
            rounded: 'lg',
            fontSize: 'sm',
            color: 'gray.400',
            transition: 'all 0.3s',
            cursor: 'pointer',
            _hover: {
              bg: 'rgba(239, 68, 68, 0.1)',
              color: 'red.400',
            },
          })}
        >
          <LogOut className={css({ w: '5', h: '5' })} />
          <span className={css({ fontWeight: 'medium' })}>Sign Out</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className={css({
        px: '3',
        py: '3',
        borderTop: '2px solid rgba(139, 92, 246, 0.2)',
        pt: '4',
      })}
    >
      <button
        type="button"
        onClick={() => openAuthModal('sign-in')}
        className={css({
          w: 'full',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3',
          px: '4',
          py: '2.5',
          minH: '11',
          rounded: 'lg',
          fontSize: 'sm',
          fontWeight: 'semibold',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          bg: 'brand.violet',
          boxShadow: '0 8px 25px rgba(139, 108, 255, 0.2)',
          _hover: {
            opacity: 0.92,
          },
        })}
      >
        <LogIn className={css({ w: '5', h: '5' })} />
        <span>Sign In</span>
      </button>
    </div>
  )
}

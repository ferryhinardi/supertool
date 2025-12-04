'use client'

import {
  Activity,
  Braces,
  Brain,
  Calendar,
  Camera,
  Clipboard,
  Clock,
  Code,
  DollarSign,
  FileCog,
  FileJson,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Gauge,
  GitCompare,
  Github,
  Globe,
  Hash,
  Home,
  ImagePlus,
  Key,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  QrCode,
  Repeat,
  Shield,
  ShieldAlert,
  Star,
  Subtitles,
  Terminal,
  Timer,
  Upload,
  User,
  Users,
  Wand2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { css, cva } from '@/styled-system/css'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'JSON Beautifier', href: '/tools/json-beautify', icon: Code },
  { name: 'JSON Schema', href: '/tools/json-schema', icon: Code },
  { name: 'JSON to CSV', href: '/tools/json-to-csv', icon: FileSpreadsheet },
  { name: 'YAML ↔ JSON', href: '/tools/yaml-json', icon: FileJson },
  { name: 'CSV ↔ Excel', href: '/tools/csv-excel', icon: FileSpreadsheet },
  { name: 'CSV Merger & Splitter', href: '/tools/csv-merger', icon: FileSpreadsheet },
  { name: 'Split Bill', href: '/tools/split-bill', icon: Users },
  { name: 'Currency Converter', href: '/tools/currency-converter', icon: DollarSign },
  { name: 'QR Code', href: '/tools/qr-code', icon: QrCode },
  { name: 'Password Generator', href: '/tools/password-generator', icon: Key },
  { name: 'Password Strength', href: '/tools/password-strength', icon: ShieldAlert },
  { name: 'Encryption Tool', href: '/tools/encryption-tool', icon: Shield },
  { name: 'Hash Generator', href: '/tools/hash-generator', icon: Hash },
  { name: 'UUID Generator', href: '/tools/uuid-generator', icon: Hash },
  { name: 'Unit Converter', href: '/tools/unit-converter', icon: Repeat },
  { name: 'Timezone Converter', href: '/tools/timezone-converter', icon: Globe },
  {
    name: 'Gradient Generator',
    href: '/tools/gradient-generator',
    icon: Wand2,
  },
  { name: 'AI Photo Editor', href: '/tools/photo-editor', icon: ImagePlus },
  { name: 'Image Metadata', href: '/tools/image-metadata', icon: Camera },
  { name: 'PDF Tools', href: '/tools/pdf-tools', icon: FileCog },
  {
    name: 'Daily Task Summary',
    href: '/tools/daily-task-summary',
    icon: Calendar,
  },
  { name: 'BMI Calculator', href: '/tools/bmi-calculator', icon: Activity },
  { name: 'Stopwatch & Timer', href: '/tools/stopwatch-timer', icon: Clock },
  { name: 'Task Timer', href: '/tools/task-timer', icon: Timer },
  { name: 'Clipboard History', href: '/tools/clipboard-history', icon: Clipboard },
  { name: 'Clipboard Formatter', href: '/tools/clipboard-formatter', icon: Clipboard },
  { name: 'Tally Counter', href: '/tools/tally-counter', icon: Star },
  { name: 'API Tester', href: '/tools/api-tester', icon: Terminal },
  { name: 'Network Speed Test', href: '/tools/speed-test', icon: Gauge },
  { name: 'Code Diff Viewer', href: '/tools/diff', icon: GitCompare },
  { name: 'Markdown Editor', href: '/tools/markdown-editor', icon: FileText },
  { name: 'AI Snippet Generator', href: '/tools/ai-snippet-generator', icon: Braces },
  { name: 'AI JSON Analyzer', href: '/tools/ai-json-analyzer', icon: Brain },
  { name: 'AI Command Explainer', href: '/tools/ai-command-explainer', icon: MessageSquare },
  { name: 'File Inspector', href: '/tools/file-inspector', icon: FileSearch },
  { name: 'File Upload', href: '/tools/upload', icon: Upload },
  { name: 'Video Subtitle Combiner', href: '/tools/video-subtitle-combiner', icon: Subtitles },
]
const showAccessToGithub = false

// Navigation link variants using cva
const navLinkStyles = cva({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    rounded: 'xl',
    px: '4',
    py: '3.5',
    transition: 'all 0.3s',
    _hover: {
      transform: 'scale(1.03)',
      shadow: 'xl',
      boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
    },
  },
  variants: {
    active: {
      true: {
        border: '2px solid rgba(139, 92, 246, 0.4)',
        color: 'white',
        shadow: 'xl',
        boxShadow: '0 10px 20px rgba(139, 92, 246, 0.4)',
      },
      false: {
        border: '1px solid transparent',
        color: 'gray.400',
        _hover: {
          borderColor: 'rgba(139, 92, 246, 0.3)',
          color: 'white',
        },
      },
    },
  },
})

export function Sidebar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)

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
          zIndex: 'tooltip',
          alignItems: 'center',
          justifyContent: 'center',
          rounded: 'xl',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          bg: 'rgba(17, 24, 39, 0.8)',
          p: '3',
          shadow: 'xl',
          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s',
          _hover: {
            bg: 'rgba(139, 92, 246, 0.2)',
            transform: 'scale(1.05)',
          },
          _active: {
            transform: 'scale(0.95)',
          },
        })}
        style={{ WebkitBackdropFilter: 'blur(16px)' }}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className={css({ h: '6', w: '6', color: 'purple.400' })} />
        ) : (
          <Menu className={css({ h: '6', w: '6', color: 'purple.400' })} />
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
            zIndex: 'overlay',
            bg: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            border: 'none',
            padding: 0,
          })}
          style={{ WebkitBackdropFilter: 'blur(4px)' }}
          aria-label="Close menu"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={css({
          position: { base: 'fixed', md: 'sticky' },
          top: { base: '0', md: '0' },
          left: { base: mobileMenuOpen ? '0' : '-100%', md: '0' },
          zIndex: { base: 'modal', md: 'auto' },
          display: 'flex',
          height: { base: '100vh', md: '100vh' },
          minH: '100vh',
          width: { base: '80vw', sm: '20rem', md: '16rem' },
          maxW: { base: '20rem', md: '16rem' },
          flexShrink: 0,
          flexDirection: 'column',
          overflow: 'hidden',
          overflowY: 'auto',
          p: { base: '4', md: '6' },
          shadow: '2xl',
          transition: 'left 0.3s ease-in-out',
        })}
        style={{
          borderRight: '2px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 25px 50px rgba(139, 92, 246, 0.2)',
          // Glass morphism effect
          background:
            'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.06), rgba(59, 130, 246, 0.06))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Animated gradient backgrounds */}
        <div
          className={css({
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            bgGradient: 'to-br',
            gradientFrom: 'rgba(139, 92, 246, 0.2)',
            gradientVia: 'rgba(59, 130, 246, 0.15)',
            gradientTo: 'rgba(6, 182, 212, 0.2)',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            animation: 'pulse 3s infinite',
            bgGradient: 'to-tr',
            gradientFrom: 'rgba(59, 130, 246, 0.15)',
            gradientVia: 'rgba(139, 92, 246, 0.10)',
            gradientTo: 'rgba(236, 72, 153, 0.15)',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            inset: '0',
            pointerEvents: 'none',
            animation: 'pulse 4s 1s infinite',
            bgGradient: 'to-bl',
            gradientFrom: 'rgba(6, 182, 212, 0.10)',
            gradientVia: 'transparent',
            gradientTo: 'rgba(139, 92, 246, 0.10)',
          })}
        />

        <div
          className={css({
            position: 'relative',
            zIndex: '10',
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
              mb: { base: '8', md: '10' },
              textDecoration: 'none !important',
              _hover: {
                transform: 'scale(1.05)',
                transition: 'all 0.3s',
              },
            })}
          >
            <h1
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: { base: '2', md: '3' },
                fontSize: { base: 'xl', md: '2xl' },
                fontWeight: 'bold',
              })}
            >
              <span
                className={css({
                  animation: 'pulse 2s infinite',
                  fontSize: { base: '3xl', md: '4xl' },
                })}
              >
                ⚡
              </span>
              <span
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.400',
                  gradientVia: 'pink.400',
                  gradientTo: 'blue.400',
                  bgClip: 'text',
                  fontWeight: 'extrabold',
                  color: 'transparent',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                SuperTool
              </span>
            </h1>
            <p
              className={css({
                mt: '2',
                ml: { base: '10', md: '12' },
                fontSize: { base: 'xs', md: 'sm' },
                fontWeight: 'medium',
                color: 'purple.300',
              })}
            >
              Digital Toolkit
            </p>
          </Link>

          {/* Navigation */}
          <nav className={css({ flex: '1', spaceY: '3' })}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={navLinkStyles({ active: isActive })}
                  style={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '0.475rem',
                    paddingBottom: '0.475rem',
                    background: isActive
                      ? 'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.4))'
                      : 'transparent',
                  }}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div
                      className={css({
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        h: '10',
                        w: '1.5',
                        transform: 'translateY(-50%)',
                        animation: 'pulse 2s infinite',
                        roundedRight: 'full',
                        bgGradient: 'to-b',
                        gradientFrom: 'purple.400',
                        gradientVia: 'pink.500',
                        gradientTo: 'blue.500',
                        shadow: 'lg',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.7)',
                      })}
                    />
                  )}

                  <Icon
                    className={css({
                      h: '5',
                      w: '5',
                      transition: 'all 0.2s',
                      color: isActive ? 'purple.300' : 'gray.500',
                      _groupHover: {
                        transform: 'scale(1.1)',
                        color: isActive ? 'purple.300' : 'purple.400',
                      },
                    })}
                  />
                  <span className={css({ fontWeight: 'semibold' })}>{item.name}</span>

                  {/* Hover glow effect */}
                  {!isActive && (
                    <div
                      className={css({
                        position: 'absolute',
                        inset: '0',
                        rounded: 'xl',
                        opacity: '0',
                        transition: 'opacity 0.3s',
                        _groupHover: { opacity: '1' },
                      })}
                      style={{
                        background:
                          'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                      }}
                    />
                  )}
                </Link>
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
              borderTop: '2px solid rgba(139, 92, 246, 0.2)',
              pt: '6',
            })}
          >
            {showAccessToGithub && (
              <a
                href="https://github.com/ferryhinardi/supertool"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  rounded: 'lg',
                  px: '3',
                  py: '2',
                  fontSize: 'sm',
                  color: 'gray.400',
                  textDecoration: 'none !important',
                  transition: 'all 0.3s',
                  _hover: {
                    color: 'white',
                  },
                })}
                style={{
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <Github
                  className={css({
                    h: '5',
                    w: '5',
                    transition: 'transform 0.3s',
                    _groupHover: { transform: 'scale(1.1)' },
                  })}
                />
                <span className={css({ fontWeight: 'medium' })}>View on GitHub</span>
              </a>
            )}

            <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
              Built with{' '}
              <span
                className={css({
                  animation: 'pulse 2s infinite',
                  color: 'red.500',
                })}
              >
                ❤️
              </span>{' '}
              by{' '}
              <a
                href="https://github.com/ferryhinardi"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'purple.400',
                  gradientTo: 'pink.400',
                  bgClip: 'text',
                  fontWeight: 'semibold',
                  color: 'transparent',
                  textDecoration: 'none !important',
                  transition: 'all 0.3s',
                  _hover: {
                    gradientFrom: 'purple.300',
                    gradientTo: 'pink.300',
                  },
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ferry
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
          py: '3',
          rounded: 'lg',
          fontSize: 'sm',
          fontWeight: 'semibold',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(168, 85, 247, 0.5)',
          shadow: 'lg',
          boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
          _hover: {
            transform: 'translateY(-2px)',
            shadow: 'xl',
            boxShadow: '0 8px 20px rgba(168, 85, 247, 0.5)',
          },
        })}
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.8))',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgb(168, 85, 247), rgb(236, 72, 153))'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.8))'
        }}
      >
        <LogIn className={css({ w: '5', h: '5' })} />
        <span>Sign In</span>
      </button>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Code, Upload, FileText, GitCompare, Github } from 'lucide-react'
import { css } from '@/styled-system/css'
import { cva } from '@/styled-system/css'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'JSON Beautifier', href: '/tools/json-beautify', icon: Code },
  { name: 'Code Diff Viewer', href: '/tools/diff', icon: GitCompare },
  { name: 'Markdown Editor', href: '/tools/markdown-editor', icon: FileText },
  { name: 'File Upload', href: '/tools/upload', icon: Upload },
]

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
        bg: 'linear-gradient(to right, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.4))',
        color: 'white',
        shadow: 'xl',
        boxShadow: '0 10px 20px rgba(139, 92, 246, 0.4)',
      },
      false: {
        border: '1px solid transparent',
        color: 'gray.400',
        _hover: {
          borderColor: 'rgba(139, 92, 246, 0.3)',
          bg: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
          color: 'white',
        },
      },
    },
  },
})

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className={css({
        position: 'relative',
        display: { base: 'none', md: 'flex' },
        width: '16rem',
        flexShrink: 0,
        flexDirection: 'column',
        overflow: 'hidden',
        overflowY: 'auto',
        borderRight: '2px solid rgba(139, 92, 246, 0.3)',
        p: { base: '4', md: '6' },
        shadow: '2xl',
        boxShadow: '0 25px 50px rgba(139, 92, 246, 0.2)',
        // Glass morphism effect
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.06), rgba(59, 130, 246, 0.06))',
        backdropFilter: 'blur(16px)',
      })}
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
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
            Developer Toolkit
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
                className={navLinkStyles({ active: isActive })}
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
                      bgGradient: 'to-r',
                      gradientFrom: 'rgba(139, 92, 246, 0)',
                      gradientVia: 'rgba(236, 72, 153, 0.1)',
                      gradientTo: 'rgba(59, 130, 246, 0)',
                      opacity: '0',
                      transition: 'opacity 0.3s',
                      _groupHover: { opacity: '1' },
                    })}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className={css({
            mt: 'auto',
            spaceY: '4',
            borderTop: '2px solid rgba(139, 92, 246, 0.2)',
            pt: '6',
          })}
        >
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
                bg: 'linear-gradient(to right, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                color: 'white',
              },
            })}
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

          <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
            Built with{' '}
            <span className={css({ animation: 'pulse 2s infinite', color: 'red.500' })}>❤️</span> by{' '}
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
  )
}

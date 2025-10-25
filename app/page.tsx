'use client'

import Link from 'next/link'
import { Code, Upload, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, useReducedMotion } from 'framer-motion'

const tools = [
  {
    title: 'JSON Beautifier',
    description:
      'Format, validate, and minify JSON with syntax highlighting and one-click operations.',
    icon: Code,
    href: '/tools/json-beautify',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Syntax Highlighting', 'Validation', 'Download'],
  },
  {
    title: 'File Upload',
    description:
      'Upload files to cloud storage with drag-and-drop support and instant shareable links.',
    icon: Upload,
    href: '/tools/upload',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Drag & Drop', 'Cloud Storage', 'Public URLs'],
  },
  {
    title: 'More Tools Coming',
    description:
      "We're constantly adding new developer tools. Stay tuned for image optimization, API testing, and more!",
    icon: Zap,
    href: '#',
    gradient: 'from-orange-500 to-yellow-500',
    features: ['Image Optimizer', 'API Tester', 'Code Formatter'],
    comingSoon: true,
  },
]

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="relative mx-auto max-w-6xl space-y-12 px-4 py-12 sm:space-y-14 sm:px-6 sm:py-14 md:space-y-16 md:px-8 md:py-16 lg:space-y-20 lg:px-10 lg:py-20 xl:px-12">
      {/* Enhanced animated gradient blobs */}
      <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 opacity-30 mix-blend-multiply blur-3xl filter motion-safe:h-96 motion-safe:w-96 motion-safe:animate-pulse sm:h-80 sm:w-80 md:h-96 md:w-96" />
      <div
        className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-30 mix-blend-multiply blur-3xl filter motion-safe:h-96 motion-safe:w-96 motion-safe:animate-pulse sm:h-80 sm:w-80 md:h-96 md:w-96"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 opacity-30 mix-blend-multiply blur-3xl filter motion-safe:h-96 motion-safe:w-96 motion-safe:animate-pulse sm:h-80 sm:w-80 md:h-96 md:w-96"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-25 mix-blend-multiply blur-3xl filter motion-safe:h-96 motion-safe:w-96 motion-safe:animate-pulse sm:h-80 sm:w-80 md:h-96 md:w-96"
        style={{ animationDelay: '3s' }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Badge
            variant="gradient"
            className="animate-shimmer mb-4 bg-gradient-to-r from-purple-500 via-blue-500 via-pink-500 to-cyan-500 bg-[length:200%_100%] px-4 py-1.5 text-xs font-semibold shadow-lg shadow-purple-500/50 sm:mb-6 sm:px-5 sm:py-2 sm:text-sm"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Modern Developer Toolkit
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-4xl leading-tight font-extrabold sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl lg:leading-none xl:text-8xl"
        >
          <span className="inline-block font-extrabold text-purple-400 drop-shadow-lg">
            SuperTool
          </span>
          <br />
          <span className="inline-block text-gray-100">is Ready</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg sm:leading-relaxed md:text-xl md:leading-relaxed lg:text-2xl"
        >
          Beautiful, fast, and powerful developer tools built with modern web technologies. Choose a
          tool from below to get started.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-4 pt-6"
        >
          <Link href="/tools/json-beautify">
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 font-semibold shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-pink-500/60 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:outline-none"
            >
              <span className="relative z-10 flex items-center">
                Try JSON Beautifier
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 space-y-8"
      >
        <div className="text-center">
          <h2 className="mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-2xl font-bold text-transparent drop-shadow-lg sm:mb-3 sm:text-3xl md:text-4xl">
            Available Tools
          </h2>
          <p className="text-base text-gray-300 sm:text-lg">
            Powerful utilities for everyday development
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:gap-7 lg:grid-cols-3 lg:gap-8">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            const isComingSoon = tool.comingSoon

            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -4 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              >
                <Link
                  href={isComingSoon ? '#' : tool.href}
                  className={`block h-full ${isComingSoon ? 'pointer-events-none' : ''}`}
                >
                  <Card
                    className={`glass-card group relative h-full overflow-hidden border-2 border-purple-500/30 transition-all duration-300 hover:border-pink-500/60 hover:shadow-2xl hover:shadow-purple-500/40 ${isComingSoon ? 'opacity-70' : ''}`}
                  >
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <CardHeader className="relative z-10 space-y-4 !p-6 sm:!p-7 md:!p-8 lg:!p-10">
                      <div className="flex items-start justify-between">
                        <motion.div
                          className={`rounded-2xl bg-gradient-to-br p-3 ${tool.gradient} shadow-xl sm:p-3.5 md:p-4`}
                          whileHover={
                            shouldReduceMotion ? {} : { rotate: [0, -5, 5, -5, 0], scale: 1.08 }
                          }
                          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                        >
                          <Icon className="h-6 w-6 text-white md:h-7 md:w-7" />
                        </motion.div>
                        {isComingSoon && (
                          <Badge
                            variant="warning"
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 px-2.5 py-1 text-xs font-semibold sm:px-3 sm:text-sm"
                          >
                            Soon
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="inline-block bg-gradient-to-r from-gray-100 via-white to-gray-100 bg-clip-text text-lg font-bold text-transparent sm:text-xl md:text-2xl">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-gray-300 sm:text-base">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 !px-6 !pb-6 sm:!px-7 sm:!pb-7 md:!px-8 md:!pb-8 lg:!px-10 lg:!pb-10">
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 bg-purple-500/10 px-3 py-1 text-xs text-purple-200 transition-all hover:border-pink-500/70 hover:bg-pink-500/20 hover:text-pink-200 sm:px-4 sm:py-1.5 sm:text-sm"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Stats/Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="glass-card group relative overflow-hidden rounded-3xl border-2 border-purple-500/30 p-6 text-center shadow-2xl shadow-purple-500/20 sm:p-8 md:p-10 lg:p-12"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 via-pink-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8 md:gap-10">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: shouldReduceMotion ? 0 : 300 }}
          >
            <div className="mb-2 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-lg sm:mb-3 sm:text-5xl md:text-6xl lg:text-7xl">
              2+
            </div>
            <div className="text-sm font-medium text-gray-300 sm:text-base md:text-lg">
              Active Tools
            </div>
          </motion.div>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.15, rotate: -5 }}
            transition={{ type: 'spring', stiffness: shouldReduceMotion ? 0 : 300 }}
          >
            <div className="mb-2 bg-gradient-to-r from-pink-300 via-orange-300 to-yellow-400 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-lg sm:mb-3 sm:text-5xl md:text-6xl lg:text-7xl">
              100%
            </div>
            <div className="text-sm font-medium text-gray-300 sm:text-base md:text-lg">
              Open Source
            </div>
          </motion.div>
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: shouldReduceMotion ? 0 : 300 }}
          >
            <div className="mb-2 bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-400 bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-lg sm:mb-3 sm:text-5xl md:text-6xl lg:text-7xl">
              0ms
            </div>
            <div className="text-sm font-medium text-gray-300 sm:text-base md:text-lg">
              Setup Time
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

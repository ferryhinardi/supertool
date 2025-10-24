'use client'

import Link from 'next/link'
import { Code, Upload, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

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
  return (
    <div className="relative mx-auto max-w-6xl space-y-20 px-4 py-16 md:px-6 lg:px-8">
      {/* Enhanced animated gradient blobs */}
      <div className="absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 opacity-30 mix-blend-multiply blur-3xl filter" />
      <div
        className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 opacity-30 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 opacity-30 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-25 mix-blend-multiply blur-3xl filter"
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
            className="animate-shimmer mb-6 bg-gradient-to-r from-purple-500 via-blue-500 via-pink-500 to-cyan-500 bg-[length:200%_100%] px-5 py-2 text-sm font-semibold shadow-lg shadow-purple-500/50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Modern Developer Toolkit
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-6xl leading-tight font-extrabold md:text-7xl lg:text-8xl"
        >
          <span className="gradient-text-vibrant animate-shimmer bg-gradient-to-r from-purple-400 via-blue-500 via-pink-500 to-cyan-400 bg-[length:200%_100%] bg-clip-text text-transparent">
            SuperTool
          </span>
          <br />
          <span className="bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            is Ready
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl"
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
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-8 py-6 text-lg font-semibold shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-2xl hover:shadow-pink-500/60"
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
          <h2 className="mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
            Available Tools
          </h2>
          <p className="text-lg text-gray-300">Powerful utilities for everyday development</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            const isComingSoon = tool.comingSoon

            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={isComingSoon ? '#' : tool.href}
                  className={`block h-full ${isComingSoon ? 'pointer-events-none' : ''}`}
                >
                  <Card
                    className={`glass-card group relative h-full overflow-hidden border-2 border-purple-500/30 p-6 transition-all duration-300 hover:border-pink-500/60 hover:shadow-2xl hover:shadow-purple-500/40 ${isComingSoon ? 'opacity-70' : ''}`}
                  >
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <CardHeader className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <motion.div
                          className={`rounded-2xl bg-gradient-to-br p-4 ${tool.gradient} shadow-xl`}
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </motion.div>
                        {isComingSoon && (
                          <Badge
                            variant="warning"
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-1 font-semibold"
                          >
                            Soon
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-2xl font-bold text-transparent">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-300">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="outline"
                            size="sm"
                            className="border-purple-500/50 bg-purple-500/10 px-3 py-1 text-sm text-purple-300 transition-all hover:border-pink-500/70 hover:bg-pink-500/20 hover:text-pink-300"
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
        className="glass-card group relative overflow-hidden rounded-3xl border-2 border-purple-500/30 p-10 text-center shadow-2xl shadow-purple-500/20"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 via-pink-500/10 to-cyan-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-3">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">
              2+
            </div>
            <div className="text-lg font-medium text-gray-300">Active Tools</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.15, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="mb-3 bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-500 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">
              100%
            </div>
            <div className="text-lg font-medium text-gray-300">Open Source</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="mb-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-500 bg-clip-text text-5xl font-extrabold text-transparent md:text-6xl">
              0ms
            </div>
            <div className="text-lg font-medium text-gray-300">Setup Time</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

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
    <div className="relative mx-auto max-w-6xl space-y-16 py-12">
      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-0 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 mix-blend-multiply blur-3xl filter" />
      <div
        className="absolute top-0 right-0 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-gradient-to-r from-pink-500 to-orange-500 opacity-20 mix-blend-multiply blur-3xl filter"
        style={{ animationDelay: '2s' }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Badge
            variant="gradient"
            className="animate-shimmer mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-[length:200%_100%]"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Modern Developer Toolkit
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl leading-tight font-bold md:text-6xl lg:text-7xl"
        >
          <span className="gradient-text animate-shimmer bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-[length:200%_100%] bg-clip-text text-transparent">
            SuperTool
          </span>
          <br />
          <span className="text-gray-300">is Ready</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-400"
        >
          Beautiful, fast, and powerful developer tools built with modern web technologies. Choose a
          tool from below to get started.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Link href="/tools/json-beautify">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/60"
            >
              Try JSON Beautifier
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative z-10 space-y-6"
      >
        <div className="text-center">
          <h2 className="mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-bold text-transparent">
            Available Tools
          </h2>
          <p className="text-gray-400">Powerful utilities for everyday development</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            const isComingSoon = tool.comingSoon

            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={isComingSoon ? '#' : tool.href}
                  className={`block h-full ${isComingSoon ? 'pointer-events-none' : ''}`}
                >
                  <Card
                    className={`glass-card group relative h-full overflow-hidden border-gray-800/50 transition-all duration-300 hover:border-purple-500/50 ${isComingSoon ? 'opacity-60' : ''}`}
                  >
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between">
                        <motion.div
                          className={`rounded-xl bg-gradient-to-r p-3 ${tool.gradient} mb-4 shadow-lg`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                        {isComingSoon && (
                          <Badge variant="warning" size="sm">
                            Soon
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-xl text-transparent">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
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
                            className="border-gray-700 text-xs transition-colors hover:border-purple-500/50"
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
        className="glass-card group relative overflow-hidden rounded-2xl border-gray-800/50 p-8 text-center"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-4xl font-bold text-transparent">
              2+
            </div>
            <div className="text-gray-400">Active Tools</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="mb-2 bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-4xl font-bold text-transparent">
              100%
            </div>
            <div className="text-gray-400">Open Source</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="mb-2 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
              0ms
            </div>
            <div className="text-gray-400">Setup Time</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

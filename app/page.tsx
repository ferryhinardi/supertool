"use client"

import Link from "next/link"
import { Code, Upload, Zap, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const tools = [
  {
    title: "JSON Beautifier",
    description: "Format, validate, and minify JSON with syntax highlighting and one-click operations.",
    icon: Code,
    href: "/tools/json-beautify",
    gradient: "from-purple-500 to-pink-500",
    features: ["Syntax Highlighting", "Validation", "Download"],
  },
  {
    title: "File Upload",
    description: "Upload files to cloud storage with drag-and-drop support and instant shareable links.",
    icon: Upload,
    href: "/tools/upload",
    gradient: "from-blue-500 to-cyan-500",
    features: ["Drag & Drop", "Cloud Storage", "Public URLs"],
  },
  {
    title: "More Tools Coming",
    description: "We're constantly adding new developer tools. Stay tuned for image optimization, API testing, and more!",
    icon: Zap,
    href: "#",
    gradient: "from-orange-500 to-yellow-500",
    features: ["Image Optimizer", "API Tester", "Code Formatter"],
    comingSoon: true,
  },
]

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-12 relative">
      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Badge variant="gradient" className="mb-4 animate-shimmer bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-[length:200%_100%]">
            <Sparkles className="w-3 h-3 mr-1" />
            Modern Developer Toolkit
          </Badge>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
        >
          <span className="gradient-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
            SuperTool
          </span>
          <br />
          <span className="text-gray-300">is Ready</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
        >
          Beautiful, fast, and powerful developer tools built with modern web technologies.
          Choose a tool from below to get started.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex items-center justify-center gap-4 pt-4"
        >
          <Link href="/tools/json-beautify">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transition-all duration-300 group">
              Try JSON Beautifier
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="space-y-6 relative z-10"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">Available Tools</h2>
          <p className="text-gray-400">Powerful utilities for everyday development</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  href={isComingSoon ? "#" : tool.href}
                  className={`block h-full ${isComingSoon ? 'pointer-events-none' : ''}`}
                >
                  <Card className={`h-full glass-card border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden group ${isComingSoon ? 'opacity-60' : ''}`}>
                    {/* Animated gradient border on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between">
                        <motion.div 
                          className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} mb-4 shadow-lg`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        {isComingSoon && (
                          <Badge variant="warning" size="sm">Soon</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{tool.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <Badge key={feature} variant="outline" size="sm" className="text-xs border-gray-700 hover:border-purple-500/50 transition-colors">
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
        className="glass-card border-gray-800/50 p-8 rounded-2xl text-center relative overflow-hidden group"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">2+</div>
            <div className="text-gray-400">Active Tools</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-500 bg-clip-text text-transparent mb-2">100%</div>
            <div className="text-gray-400">Open Source</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-2">0ms</div>
            <div className="text-gray-400">Setup Time</div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

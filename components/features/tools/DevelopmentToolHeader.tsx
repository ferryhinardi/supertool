'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ToolPageHeader } from '@/components/features/tools/workspace/ToolPageHeader'

export interface DevelopmentToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function DevelopmentToolHeader(props: DevelopmentToolHeaderProps) {
  return <ToolPageHeader category="development" {...props} />
}

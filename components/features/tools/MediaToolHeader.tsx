'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ToolPageHeader } from '@/components/features/tools/workspace/ToolPageHeader'

export interface MediaToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function MediaToolHeader(props: MediaToolHeaderProps) {
  return <ToolPageHeader category="media" {...props} />
}
